'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Check, ShieldCheck } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Account model                                                             */
/* -------------------------------------------------------------------------- */

export type AccountRole = 'player' | 'creator' | 'organization'

export type Account = {
  id: string
  name: string
  email: string
  role: AccountRole
  age: number
  region: string
  guardianEmail: string
  guardianPending: boolean
  marketingOptIn: boolean
}

type StoredAccount = Account & { salt: string; hash: string; iterations: number; createdAt: string }

type Session = { accountId: string; expiresAt: number; persistent: boolean }

export const roleLabels: Record<AccountRole, string> = {
  player: 'Player',
  creator: 'Content creator',
  organization: 'Esports organization',
}

export const usStates = 'Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming'.split(',')

/* -------------------------------------------------------------------------- */
/*  Credential store                                                          */
/* -------------------------------------------------------------------------- */

const ACCOUNTS_KEY = 'vayntr.accounts.v1'
const SESSION_KEY = 'vayntr.session.v1'
const SESSION_MS = 7 * 24 * 60 * 60 * 1000
// OWASP's 2023 floor for PBKDF2-HMAC-SHA256 is 600,000 iterations.
const PBKDF2_ITERATIONS = 600_000
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

const commonPasswords = new Set([
  'password', 'password1', 'password123', '123456789012', 'qwertyuiop12', 'letmein12345', 'iloveyou1234',
  'welcome12345', 'admin1234567', 'football1234', 'baseball1234', 'sunshine1234', 'princess1234',
  'superman1234', 'trustno1', 'monkey123456', 'dragon123456', 'abc123456789', 'vayntr123456',
])

// Failed sign-in attempts are tracked in memory only: a reload clears the counter.
const attempts = new Map<string, { fails: number; lockedUntil: number }>()

/** A one-off salt used to keep failed sign-ins for unknown emails as slow as real ones. */
const DUMMY_SALT = new Uint8Array(16)

export class AuthError extends Error {}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function normaliseEmail(value: string) {
  return value.trim().toLowerCase()
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

async function deriveHash(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  if (!crypto?.subtle) throw new AuthError('This browser cannot create a secure account here. Use a modern browser over HTTPS or on localhost.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256)
  return new Uint8Array(bits)
}

function readAccounts(): StoredAccount[] {
  const store = storage()
  if (!store) return []
  try {
    const parsed = JSON.parse(store.getItem(ACCOUNTS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed as StoredAccount[] : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  storage()?.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function publicAccount(account: StoredAccount): Account {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    age: account.age,
    region: account.region,
    guardianEmail: account.guardianEmail,
    guardianPending: account.guardianPending,
    marketingOptIn: account.marketingOptIn,
  }
}

function sessionStorageSafe(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function readSession(): Session | null {
  for (const store of [storage(), sessionStorageSafe()]) {
    if (!store) continue
    try {
      const parsed = JSON.parse(store.getItem(SESSION_KEY) ?? 'null') as Session | null
      if (!parsed) continue
      if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt < Date.now()) {
        store.removeItem(SESSION_KEY)
        continue
      }
      return parsed
    } catch {
      store.removeItem(SESSION_KEY)
    }
  }
  return null
}

function startSession(accountId: string, persistent: boolean) {
  const session: Session = { accountId, expiresAt: Date.now() + SESSION_MS, persistent }
  storage()?.removeItem(SESSION_KEY)
  sessionStorageSafe()?.removeItem(SESSION_KEY)
  ;(persistent ? storage() : sessionStorageSafe())?.setItem(SESSION_KEY, JSON.stringify(session))
}

/** The account currently signed in on this device, or null. */
export function restoreSession(): Account | null {
  const session = readSession()
  if (!session) return null
  const account = readAccounts().find((entry) => entry.id === session.accountId)
  return account ? publicAccount(account) : null
}

export function endSession() {
  storage()?.removeItem(SESSION_KEY)
  sessionStorageSafe()?.removeItem(SESSION_KEY)
}

export function isEmailTaken(email: string) {
  return readAccounts().some((entry) => entry.email === normaliseEmail(email))
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  role: AccountRole
  age: number
  region: string
  guardianEmail: string
  marketingOptIn: boolean
}

export async function register(input: RegisterInput): Promise<Account> {
  const email = normaliseEmail(input.email)
  if (readAccounts().some((entry) => entry.email === email)) {
    throw new AuthError('An account with that email already exists on this device. Use Log in instead.')
  }
  if (passwordScore(input.password, email) < 2) {
    throw new AuthError('Choose a stronger password before creating the account.')
  }
  const salt = randomBytes(16)
  const hash = await deriveHash(input.password, salt, PBKDF2_ITERATIONS)
  const account: StoredAccount = {
    id: `acct-${toBase64(randomBytes(8)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
    name: input.name.trim(),
    email,
    role: input.role,
    age: input.age,
    region: input.region,
    guardianEmail: input.guardianEmail.trim().toLowerCase(),
    guardianPending: input.age < 18,
    marketingOptIn: input.marketingOptIn,
    salt: toBase64(salt),
    hash: toBase64(hash),
    iterations: PBKDF2_ITERATIONS,
    createdAt: new Date().toISOString(),
  }
  writeAccounts([...readAccounts(), account])
  startSession(account.id, true)
  return publicAccount(account)
}

export async function authenticate(email: string, password: string, persistent = true): Promise<Account> {
  const key = normaliseEmail(email)
  const now = Date.now()
  const attempt = attempts.get(key)
  if (attempt && attempt.lockedUntil > now) {
    throw new AuthError(`Too many attempts. Try again in ${Math.ceil((attempt.lockedUntil - now) / 1000)} seconds.`)
  }

  const account = readAccounts().find((entry) => entry.email === key)
  // Unknown emails still run a full derivation so response time does not reveal whether an account exists.
  const hash = await deriveHash(password, account ? fromBase64(account.salt) : DUMMY_SALT, account?.iterations ?? PBKDF2_ITERATIONS)
  const valid = Boolean(account) && timingSafeEqual(hash, fromBase64(account!.hash))

  if (!valid) {
    const fails = (attempt?.fails ?? 0) + 1
    attempts.set(key, { fails: fails >= MAX_ATTEMPTS ? 0 : fails, lockedUntil: fails >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0 })
    throw new AuthError('Email or password is incorrect.')
  }

  attempts.delete(key)
  startSession(account!.id, persistent)
  return publicAccount(account!)
}

export function deleteAccount(id: string) {
  writeAccounts(readAccounts().filter((entry) => entry.id !== id))
  endSession()
}

export function updateAccount(id: string, patch: { name?: string; age?: number }) {
  const accounts = readAccounts().map((entry) => entry.id === id ? { ...entry, ...patch } : entry)
  writeAccounts(accounts)
  return accounts.find((entry) => entry.id === id)
}

/* -------------------------------------------------------------------------- */
/*  Password policy                                                           */
/* -------------------------------------------------------------------------- */

export function passwordChecks(password: string, email = '') {
  const local = email.split('@')[0]?.toLowerCase() ?? ''
  return [
    { id: 'length', label: 'At least 12 characters', met: password.length >= 12 },
    { id: 'common', label: 'Not a commonly used password', met: password.length > 0 && !commonPasswords.has(password.toLowerCase()) },
    { id: 'unique', label: 'Not your email address', met: password.length > 0 && (!local || !password.toLowerCase().includes(local)) },
    { id: 'variety', label: 'Mix two of: letters, numbers, symbols', met: [/[a-zA-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((pattern) => pattern.test(password)).length >= 2 },
  ]
}

export function passwordScore(password: string, email = '') {
  if (!password) return 0
  const met = passwordChecks(password, email).filter((check) => check.met).length
  if (met <= 1) return 1
  if (met === 2) return 2
  if (met === 3) return 3
  return 4
}

/* -------------------------------------------------------------------------- */
/*  Shared authentication layout                                              */
/* -------------------------------------------------------------------------- */

function AuthShell({ eyebrow, title, accent, lead, children, aside }: { eyebrow: string; title: string; accent: string; lead: string; children: ReactNode; aside: ReactNode }) {
  return <section className="page-wrap wrap">
    <div className="page-heading auth-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}<br /><span>{accent}</span></h1>
      <p>{lead}</p>
    </div>
    <div className="auth-layout">
      <div className="card-panel auth-panel">{children}</div>
      <aside className="auth-aside">{aside}</aside>
    </div>
  </section>
}

function PasswordField({ id, label, value, onChange, autoComplete, placeholder, hint }: { id: string; label: string; value: string; onChange: (value: string) => void; autoComplete: string; placeholder: string; hint?: string }) {
  const [shown, setShown] = useState(false)
  return <div className="form-field password-field">
    <label htmlFor={id}>{label}</label>
    <span className="password-input">
      <input id={id} name={id} type={shown ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} minLength={12} maxLength={128} spellCheck={false} aria-describedby={hint ? `${id}-hint` : undefined} />
      <button type="button" className="password-toggle" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown(!shown)}>{shown ? 'Hide' : 'Show'}</button>
    </span>
    {hint ? <em className="field-hint" id={`${id}-hint`}>{hint}</em> : null}
  </div>
}

/* -------------------------------------------------------------------------- */
/*  Sign up                                                                   */
/* -------------------------------------------------------------------------- */

const roleChoices: { id: AccountRole; label: string; blurb: string; icon: string }[] = [
  { id: 'player', label: 'Player', blurb: 'Compete on a roster. Show your rank, game and availability.', icon: '◎' },
  { id: 'creator', label: 'Content creator', blurb: 'Edit, stream, cast or build community around games.', icon: '✳' },
  { id: 'organization', label: 'Esports organization', blurb: 'Recruit players and staff, and post roles with pay terms.', icon: '◈' },
]

const creatorKinds = ['Short-form editing', 'Long-form editing', 'Live streaming', 'Casting & hosting', 'Community & social', 'Art, thumbnails & motion']
const orgKinds = ['Esports team', 'Creator collective', 'Production studio', 'Community project', 'Other']

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function SignUpPage({ go, games, ageFloors, onCreated }: { go: (page: string) => void; games: string[]; ageFloors: Record<string, number>; onCreated: (account: Account) => void }) {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<AccountRole | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [country, setCountry] = useState('United States')
  const [region, setRegion] = useState('')
  const [ageInput, setAgeInput] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [game, setGame] = useState('')
  const [playerRole, setPlayerRole] = useState('')
  const [rank, setRank] = useState('')
  const [availability, setAvailability] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [salaryAsk, setSalaryAsk] = useState('')
  const [creatorKind, setCreatorKind] = useState('')
  const [platforms, setPlatforms] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [rate, setRate] = useState('')
  const [orgFocus, setOrgFocus] = useState('')
  const [orgKind, setOrgKind] = useState('')
  const [orgSite, setOrgSite] = useState('')
  const [hiringFor, setHiringFor] = useState('')
  const [consent, setConsent] = useState(false)
  const [guardianConsent, setGuardianConsent] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<Account | null>(null)

  const age = Number(ageInput)
  const isMinor = ageInput !== '' && !Number.isNaN(age) && age >= 13 && age < 18
  const gameFloor = game ? ageFloors[game] : undefined
  const checks = passwordChecks(password, email)
  const score = passwordScore(password, email)
  const stepTitles = ['Who are you?', 'Create your account', role === 'organization' ? 'Your organization' : role === 'creator' ? 'Your work' : 'Your game', 'Privacy & consent']

  useEffect(() => {
    if (created) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [created])

  function goToStep(next: number) {
    setError('')
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateAccountStep() {
    if (!name.trim()) return role === 'organization' ? 'Add your organization name.' : 'Add the display name you want to use.'
    if (!validEmail(email.trim())) return 'Enter a valid email address.'
    if (password.length < 12) return 'Use at least 12 characters for your password.'
    if (passwordScore(password, email) < 2) return 'Choose a stronger password: longer, or mix letters with numbers or symbols.'
    if (password !== confirmPassword) return 'The two passwords do not match.'
    if (!ageInput.trim()) return 'Add your age. Accounts are for people 13 and older.'
    if (Number.isNaN(age) || age < 1) return 'Enter your age as a number.'
    if (age < 13) return 'VAYNTR Talent cannot create accounts for children under 13. That is a federal rule (COPPA), not a preference. A parent or guardian can contact support using the feedback panel if this looks wrong.'
    if (role === 'organization' && age < 18) return 'Organization accounts must be created by someone 18 or older. Player and creator accounts are open from 13 with guardian consent.'
    if (country === 'United States' && !region) return 'Choose your state so state privacy rights apply to your account.'
    if (age < 18 && !validEmail(guardianEmail.trim())) return 'Add a parent or guardian email. Anyone under 18 needs guardian consent.'
    return ''
  }

  async function createAccount() {
    setError('')
    if (!consent) return setError('Agree to the privacy notice and safety rules to create an account.')
    if (isMinor && !guardianConsent) return setError('A parent or guardian has to agree before this account is created.')
    if (isEmailTaken(email)) return setError('An account with that email already exists on this device. Use Log in instead.')
    setBusy(true)
    try {
      const account = await register({
        name,
        email,
        password,
        role: role ?? 'player',
        age,
        region: country === 'United States' ? region : country,
        guardianEmail: isMinor ? guardianEmail : '',
        marketingOptIn: marketing,
      })
      setCreated(account)
      setPassword('')
      setConfirmPassword('')
      onCreated(account)
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'The account could not be created on this device.')
    } finally {
      setBusy(false)
    }
  }

  function submitStep(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (step === 1) {
      if (!role) return setError('Choose player, content creator, or esports organization.')
      return goToStep(2)
    }
    if (step === 2) {
      const problem = validateAccountStep()
      return problem ? setError(problem) : goToStep(3)
    }
    if (step === 3) {
      if (role === 'player' && !game) return setError('Pick the game you compete in.')
      if (role === 'creator' && !creatorKind) return setError('Pick the kind of content you make.')
      if (role === 'organization' && !orgKind) return setError('Choose what kind of organization this is.')
      return goToStep(4)
    }
    void createAccount()
  }

  if (created) {
    return <AuthShell
      eyebrow="ACCOUNT CREATED"
      title="Welcome,"
      accent={`${created.name}.`}
      lead={`Your free ${roleLabels[created.role].toLowerCase()} account is ready. You can log in with this email and password on this device right now.`}
      aside={<>
        <div className="side-callout"><div className="eyebrow">WHAT HAPPENS NEXT</div><h3>Everything stays free.</h3><p>Profiles, applications and messages never cost anything. When the server is connected, this same account carries over to every device and browser.</p></div>
        <button className="text-link" onClick={() => go('Privacy')}>Read the privacy notice <span className="button-arrow" aria-hidden="true">↗</span></button>
      </>}
    >
      <div className="auth-success">
        <div className="signup-success-head"><span className="signup-success-mark" aria-hidden="true"><Check size={18} strokeWidth={2.6} /></span><div><h2>You’re in. It’s free.</h2><p>No card, no application fee, no pay-to-play.</p></div></div>
        <dl className="signup-summary">
          <div><dt>Role</dt><dd>{roleLabels[created.role]}</dd></div>
          <div><dt>Name</dt><dd>{created.name}</dd></div>
          <div><dt>Email</dt><dd>{created.email}</dd></div>
          <div><dt>Region</dt><dd>{created.region}</dd></div>
          <div><dt>Age</dt><dd>{created.age}</dd></div>
          <div><dt>Status</dt><dd>{created.guardianPending ? 'Guardian confirmation pending' : 'Active on this device'}</dd></div>
        </dl>
        {created.guardianPending ? <p className="signup-note">We ask {created.guardianEmail} to confirm this account. No email is sent until email delivery is connected.</p> : null}
        <div className="signup-actions">
          <button className="button button-red" onClick={() => go('My profile')}>Open my profile <span className="button-arrow" aria-hidden="true">↗</span></button>
          <button className="button button-outline" onClick={() => go(created.role === 'organization' ? 'For organizations' : 'Marketplace')}>{created.role === 'organization' ? 'Open the organization workspace' : 'Browse roles'}</button>
          <button className="text-link" onClick={() => go('Privacy')}>Read the privacy notice</button>
        </div>
      </div>
    </AuthShell>
  }

  return <AuthShell
    eyebrow="FREE TO JOIN"
    title="Create your free"
    accent="account."
    lead="Open to players, content creators and esports organizations. No invitation, no approval queue, no card, and no application fees. Anyone 13 or older can join; anyone under 18 needs a parent or guardian to agree."
    aside={<>
      <div className="side-callout"><div className="eyebrow">ALWAYS FREE</div><h3>No fee, no pay-to-play.</h3><p>Creating an account and applying to roles stays free. Nobody can charge you for consideration, and organizations can’t buy visibility over candidates.</p></div>
      <div className="signup-facts">
        <div><strong>13+</strong><span>Minimum age. Under 13 cannot create an account under federal COPPA rules.</span></div>
        <div><strong>18</strong><span>Guardian consent required for everyone under 18.</span></div>
        <div><strong>0</strong><span>Ad scripts, trackers, or data sales on this site.</span></div>
      </div>
      <div className="auth-note"><ShieldCheck size={16} strokeWidth={2} aria-hidden="true" /><p>Passwords are hashed with PBKDF2-SHA-256 and never stored as text. Until the server is connected, your account lives only in this browser.</p></div>
      <button className="text-link" onClick={() => go('Privacy')}>Read the full privacy notice <span className="button-arrow" aria-hidden="true">↗</span></button>
      <p className="auth-switch">Already have an account? <button type="button" className="text-link" onClick={() => go('Log in')}>Log in</button></p>
    </>}
  >
    <form className="auth-form" onSubmit={submitStep} noValidate>
      <ol className="signup-steps" aria-label="Sign-up progress">
        {stepTitles.map((title, index) => <li key={title} className={index + 1 === step ? 'signup-step active' : index + 1 < step ? 'signup-step done' : 'signup-step'} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1}</span>{title}</li>)}
      </ol>

      <h2 className="signup-title" aria-live="polite">{stepTitles[step - 1]}</h2>

      {step === 1 ? <fieldset className="role-choices">
        <legend className="sr-only">Choose the account type that fits you</legend>
        {roleChoices.map((choice) => <button type="button" key={choice.id} className={role === choice.id ? 'role-choice chosen' : 'role-choice'} aria-pressed={role === choice.id} onClick={() => { setRole(choice.id); setError('') }}>
          <span className="role-choice-icon" aria-hidden="true">{choice.icon}</span>
          <strong>{choice.label}</strong>
          <small>{choice.blurb}</small>
        </button>)}
      </fieldset> : null}

      {step === 2 ? <div className="form-grid">
        <label className="form-field span-2">{role === 'organization' ? 'Organization name' : 'Display name'}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={role === 'organization' ? 'e.g. your team or studio name' : 'e.g. the name you compete under'} autoComplete="nickname" maxLength={60} /></label>
        <label className="form-field span-2">Email<input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" spellCheck={false} inputMode="email" maxLength={254} /></label>
        <div className="span-2 password-block">
          <PasswordField id="signup-password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 12 characters" hint="Length matters more than symbols. Never reuse a password from another site." />
          <div className={`password-meter level-${score}`} aria-hidden="true"><span /></div>
          <ul className="password-checks">{checks.map((check) => <li key={check.id} className={check.met ? 'met' : ''}><span aria-hidden="true">{check.met ? '✓' : '·'}</span>{check.label}</li>)}</ul>
        </div>
        <div className="span-2"><PasswordField id="signup-password-confirm" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="Type it again" /></div>
        <label className="form-field">Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>European Union</option><option>Australia</option><option>Other</option></select></label>
        {country === 'United States' ? <label className="form-field">State<select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">Select your state</option>{usStates.map((state) => <option key={state}>{state}</option>)}</select></label> : <label className="form-field">Region<input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Your region" /></label>}
        <label className="form-field">Age<input type="number" inputMode="numeric" min={1} max={99} value={ageInput} onChange={(event) => setAgeInput(event.target.value)} placeholder="e.g. 16" /><em className="field-hint">We store your age, not your exact date of birth.</em></label>
        {isMinor ? <label className="form-field">Parent or guardian email<input type="email" value={guardianEmail} onChange={(event) => setGuardianEmail(event.target.value)} placeholder="guardian@example.com" spellCheck={false} /><em className="field-hint">Anyone under 18 needs guardian consent. We will email them once email delivery is connected.</em></label> : null}
      </div> : null}

      {step === 3 ? <div className="form-grid">
        {role === 'player' ? <>
          <label className="form-field">Primary game<select value={game} onChange={(event) => setGame(event.target.value)}><option value="">Select a game</option>{games.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="form-field">Role<input value={playerRole} onChange={(event) => setPlayerRole(event.target.value)} placeholder="e.g. controller, support, IGL" maxLength={60} /></label>
          <label className="form-field">Rank<input value={rank} onChange={(event) => setRank(event.target.value)} placeholder="e.g. Immortal 2" maxLength={40} /></label>
          <label className="form-field">Availability<input value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="e.g. 10–14 hrs/week" maxLength={40} /></label>
          <label className="form-field span-2">What are you looking for?<input value={lookingFor} onChange={(event) => setLookingFor(event.target.value)} placeholder="e.g. an academy roster with weekly review" maxLength={120} /></label>
          <label className="form-field span-2">Salary expectation (optional)<input value={salaryAsk} onChange={(event) => setSalaryAsk(event.target.value)} placeholder="e.g. 300–500 USD / month, or revenue share" maxLength={120} /></label>
          {game && gameFloor ? <p className={`age-profile-note span-2 ${age < gameFloor ? 'blocked' : ''}`}>{game} competitions set a minimum age of <strong>{gameFloor}+</strong>. {age < gameFloor ? `You can still hold an account, but you cannot be signed for ${game} until you meet that floor.` : 'Your age meets that floor.'}</p> : null}
        </> : null}
        {role === 'creator' ? <>
          <label className="form-field span-2">What do you make?<select value={creatorKind} onChange={(event) => setCreatorKind(event.target.value)}><option value="">Select a focus</option>{creatorKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          <label className="form-field span-2">Platforms<input value={platforms} onChange={(event) => setPlatforms(event.target.value)} placeholder="e.g. YouTube, TikTok, Twitch" maxLength={120} /></label>
          <label className="form-field span-2">Portfolio link (optional)<input value={portfolio} onChange={(event) => setPortfolio(event.target.value)} placeholder="https://…" maxLength={200} /></label>
          <label className="form-field span-2">Rate or expectation (optional)<input value={rate} onChange={(event) => setRate(event.target.value)} placeholder="e.g. 25–35 USD / hour" maxLength={120} /></label>
        </> : null}
        {role === 'organization' ? <>
          <label className="form-field">Organization type<select value={orgKind} onChange={(event) => setOrgKind(event.target.value)}><option value="">Select a type</option>{orgKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          <label className="form-field">Games or focus<input value={orgFocus} onChange={(event) => setOrgFocus(event.target.value)} placeholder="e.g. VALORANT, Rocket League" maxLength={120} /></label>
          <label className="form-field">Website (optional)<input value={orgSite} onChange={(event) => setOrgSite(event.target.value)} placeholder="https://…" maxLength={200} /></label>
          <label className="form-field">Hiring for<input value={hiringFor} onChange={(event) => setHiringFor(event.target.value)} placeholder="e.g. players, editor, analyst" maxLength={120} /></label>
        </> : null}
      </div> : null}

      {step === 4 ? <>
        <dl className="signup-summary">
          <div><dt>Account type</dt><dd>{role ? roleLabels[role] : '—'}</dd></div>
          <div><dt>Name</dt><dd>{name || '—'}</dd></div>
          <div><dt>Email</dt><dd>{email || '—'}</dd></div>
          <div><dt>Region</dt><dd>{country === 'United States' ? region || '—' : country}</dd></div>
          <div><dt>Age</dt><dd>{ageInput || '—'}</dd></div>
        </dl>
        <div className="consent-list">
          <label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I agree to the <button type="button" className="text-link" onClick={() => go('Privacy')}>privacy notice</button> and the <button type="button" className="text-link" onClick={() => go('Trust & safety')}>safety rules</button>, and the details above are accurate.</span></label>
          {isMinor ? <label><input type="checkbox" checked={guardianConsent} onChange={(event) => setGuardianConsent(event.target.checked)} /><span>My parent or guardian has read the privacy notice and agrees to this account.</span></label> : null}
          <label><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /><span>Email me product updates. Optional, separate from creating an account, and never used for ads.</span></label>
        </div>
        <div className="privacy-brief">
          <strong><ShieldCheck size={15} strokeWidth={2} aria-hidden="true" /> Your data, in short</strong>
          <ul>
            <li>Free to join. We take no payment details and charge no application fees.</li>
            <li>Your password is stored only as a salted PBKDF2 hash, never as text.</li>
            <li>We never sell or share your personal information, and this site loads no ad, pixel, or analytics scripts.</li>
            <li>Profiles are private by default. You can ask to see, correct, delete, or opt out at any time.</li>
          </ul>
        </div>
      </> : null}

      {error ? <p className="field-error" role="alert">{error}</p> : null}

      <div className="signup-actions">
        {step > 1 ? <button type="button" className="button button-outline" onClick={() => goToStep(step - 1)}>← Back</button> : <span />}
        <button type="submit" className="button button-red" disabled={busy}>{busy ? 'Creating account…' : step === 4 ? 'Create free account' : 'Continue'} <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
      {step === 1 ? <p className="auth-switch">Already have an account? <button type="button" className="text-link" onClick={() => go('Log in')}>Log in</button></p> : null}
    </form>
  </AuthShell>
}

/* -------------------------------------------------------------------------- */
/*  Log in                                                                    */
/* -------------------------------------------------------------------------- */

export function SignInPage({ go, onSignedIn, onNotice }: { go: (page: string) => void; onSignedIn: (account: Account) => void; onNotice: (message: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (!validEmail(email.trim())) return setError('Enter the email address you signed up with.')
    if (!password) return setError('Enter your password.')
    setBusy(true)
    try {
      const account = await authenticate(email, password, remember)
      setPassword('')
      onSignedIn(account)
      onNotice(`Logged in as ${account.name}.`)
      go(account.role === 'organization' ? 'For organizations' : 'My profile')
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'Sign-in failed on this device.')
    } finally {
      setBusy(false)
    }
  }

  return <AuthShell
    eyebrow="WELCOME BACK"
    title="Log in to"
    accent="your account."
    lead="Use the email and password you signed up with. Until the server is connected, accounts live in this browser only, so a different device or a cleared browser will not have them."
    aside={<>
      <div className="side-callout"><div className="eyebrow">SECURE BY DEFAULT</div><h3>We never store your password.</h3><p>Only a salted PBKDF2-SHA-256 hash is kept, and the session expires after seven days. Signing out clears it immediately.</p></div>
      <div className="auth-note"><ShieldCheck size={16} strokeWidth={2} aria-hidden="true" /><p>Five wrong attempts pause sign-in for 30 seconds. We do not say whether an email exists.</p></div>
      <p className="auth-switch">New to VAYNTR Talent? <button type="button" className="text-link" onClick={() => go('Sign up')}>Create a free account</button></p>
      <button className="text-link" onClick={() => go('Privacy')}>Privacy notice &amp; your rights <span className="button-arrow" aria-hidden="true">↗</span></button>
    </>}
  >
    <form className="auth-form" onSubmit={submit} noValidate>
      <h2 className="signup-title">Account details</h2>
      <div className="form-grid">
        <label className="form-field span-2">Email<input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" spellCheck={false} inputMode="email" maxLength={254} /></label>
        <div className="span-2"><PasswordField id="login-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Your password" /></div>
      </div>
      <label className="checkbox-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Keep me signed in on this device for 7 days</span></label>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="signup-actions">
        <button type="button" className="text-link" onClick={() => onNotice('Password reset needs email delivery, which is not connected yet. Contact support through the feedback panel.')}>Forgot password?</button>
        <button type="submit" className="button button-red" disabled={busy}>{busy ? 'Checking…' : 'Log in'} <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </form>
  </AuthShell>
}

/* -------------------------------------------------------------------------- */
/*  Privacy notice                                                            */
/* -------------------------------------------------------------------------- */

export function PrivacyPage({ go }: { go: (page: string) => void }) {
  return <section className="page-wrap wrap">
    <div className="page-heading">
      <div className="eyebrow">PRIVACY / UNITED STATES</div>
      <h1>Your data,<br /><span>your rights.</span></h1>
      <p>How VAYNTR Talent handles personal information for accounts, profiles, messages and applications, and the rights US privacy laws give you. Reviewed October 22, 2026.</p>
    </div>

    <div className="privacy-callout">
      <strong>Draft notice.</strong>
      <span>This build keeps accounts in your browser only. The policy below describes the service that launches with the API, and it needs legal review before launch.</span>
    </div>

    <div className="trust-grid">
      <article className="trust-card"><span className="trust-number">01</span><h2>Who can create an account</h2><p>Anyone 13 or older can sign up free, with no invitation. Under 13 cannot create an account: COPPA bars collecting their personal information without verifiable parental consent, which this service does not offer. Anyone 13–17 needs a parent or guardian to agree, and can use the account while that confirmation is pending.</p></article>
      <article className="trust-card"><span className="trust-number">02</span><h2>What we collect</h2><p>Account and sign-in details (display or organization name, email), country and US state, your age as a number rather than a date of birth, the role answers you give, the profile content you choose, messages you send, applications you submit, and reports you file. Payment details are never requested.</p></article>
      <article className="trust-card"><span className="trust-number">03</span><h2>What we never collect</h2><p>No Social Security or tax numbers, government ID images, bank or card numbers, precise location, biometric identifiers, or health data. Never send identity documents or financial details through a profile, message, or application.</p></article>
      <article className="trust-card"><span className="trust-number">04</span><h2>No sale, no ad tracking</h2><p>We do not sell personal information or share it for cross-context behavioral advertising, and this site loads no ad network, pixel, or third-party analytics script. Because there is nothing to sell, there is nothing to opt out of, and Global Privacy Control signals are honored by default.</p></article>
    </div>

    <section className="privacy-rights" aria-labelledby="rights-title">
      <div className="age-policy-head">
        <div className="eyebrow">YOUR RIGHTS</div>
        <h2 id="rights-title">What you can ask for.</h2>
        <p>California’s CCPA/CPRA and the comprehensive privacy laws of other states (including Virginia, Colorado, Connecticut, Utah, Texas, Oregon and Montana, where they apply) give consumers rights over their personal information. We extend these to every account holder, wherever you live.</p>
      </div>
      <ul className="rights-list">
        <li><strong>Know and access</strong><span>The categories of information we hold about you and a copy of it.</span></li>
        <li><strong>Correct</strong><span>Fix inaccurate account or profile details.</span></li>
        <li><strong>Delete</strong><span>Remove your account and the data tied to it, subject to safety and legal retention.</span></li>
        <li><strong>Opt out</strong><span>Opt out of sale or sharing. We do neither, so nothing is sold or shared.</span></li>
        <li><strong>Limit sensitive data</strong><span>Restrict use of sensitive personal information. We do not ask for any.</span></li>
        <li><strong>Non-discrimination</strong><span>No loss of access, features, or price for exercising a privacy right. The service is free either way.</span></li>
        <li><strong>Authorized agent</strong><span>Ask someone to submit a request for you, with proof of authorization.</span></li>
        <li><strong>Appeal</strong><span>If a request is refused, appeal the decision where your state requires an appeal process.</span></li>
      </ul>
      <p className="age-policy-note">We respond within the time your state allows, including 45 days under California law, extendable once with notice. Requests are free.</p>
    </section>

    <div className="trust-grid">
      <article className="trust-card"><span className="trust-number">05</span><h2>Accounts on this device</h2><p>Until the API is connected, your account is stored in this browser’s local storage: your name, email, role answers and a salted PBKDF2-SHA-256 hash of your password. The password itself is never written to storage, the session expires after seven days, and clearing site data deletes the account. This is not a substitute for server-side authentication.</p></article>
      <article className="trust-card"><span className="trust-number">06</span><h2>Minors and guardians</h2><p>Teen accounts get protective defaults: candidate discovery off, no public profile, no ads, no engagement feeds, and no targeted messaging from unverified organizations. A parent or guardian can ask to review, correct, or delete a minor’s information at any time.</p></article>
      <article className="trust-card"><span className="trust-number">07</span><h2>How long we keep it</h2><p>Profile, application and message data is kept while the account is active and deleted within 30 days of a verified deletion request, unless a safety investigation or legal obligation requires longer retention. Reports are kept only as long as needed to resolve them.</p></article>
      <article className="trust-card"><span className="trust-number">08</span><h2>Changes and contact</h2><p>Material changes to this notice will be announced in-product before they take effect. Privacy requests and questions go through the feedback panel until a monitored privacy contact is assigned, which is a launch requirement.</p></article>
    </div>

    <div className="privacy-note"><strong>Not legal advice.</strong><p>This notice reflects published federal and state requirements as of October 2026, including COPPA and the California privacy statutes. Some state child-safety provisions are enjoined or not yet effective. Have counsel review the final policy, retention schedule, and request-handling process before launch.</p><button className="text-link" onClick={() => go('Trust & safety')}>Safety guidance <span className="button-arrow" aria-hidden="true">↗</span></button></div>
  </section>
}
