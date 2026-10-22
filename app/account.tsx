'use client'

import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'

export type AccountRole = 'player' | 'creator' | 'organization'

export type Account = {
  name: string
  email: string
  role: AccountRole
  age: number
  region: string
  guardianEmail: string
  marketingOptIn: boolean
}

export const roleLabels: Record<AccountRole, string> = {
  player: 'Player',
  creator: 'Content creator',
  organization: 'Esports organization',
}

export const usStates = 'Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,District of Columbia,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming'.split(',')

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
  const [created, setCreated] = useState<Account | null>(null)

  const age = Number(ageInput)
  const isMinor = ageInput !== '' && !Number.isNaN(age) && age >= 13 && age < 18
  const gameFloor = game ? ageFloors[game] : undefined
  const stepTitles = ['Who are you?', 'Create your account', role === 'organization' ? 'Your organization' : role === 'creator' ? 'Your work' : 'Your game', 'Privacy & consent']

  function goToStep(next: number) {
    setError('')
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function continueFromStep() {
    if (step === 1) {
      if (!role) return setError('Choose player, content creator, or esports organization.')
      return goToStep(2)
    }
    if (step === 2) {
      if (!name.trim()) return setError(role === 'organization' ? 'Add your organization name.' : 'Add the display name you want to use.')
      if (!validEmail(email.trim())) return setError('Enter a valid email address.')
      if (password.length < 8) return setError('Use at least 8 characters for your password.')
      if (!ageInput.trim()) return setError('Add your age. Accounts are for people 13 and older.')
      if (Number.isNaN(age) || age < 1) return setError('Enter your age as a number.')
      if (age < 13) return setError('VAYNTR Talent cannot create accounts for children under 13. That is a federal rule (COPPA), not a preference. A parent or guardian can contact support using the feedback panel if this looks wrong.')
      if (role === 'organization' && age < 18) return setError('Organization accounts must be created by someone 18 or older. Player and creator accounts are open from 13 with guardian consent.')
      if (country === 'United States' && !region) return setError('Choose your state so state privacy rights apply to your account.')
      if (age < 18 && !validEmail(guardianEmail.trim())) return setError('Add a parent or guardian email. Anyone under 18 needs guardian consent.')
      return goToStep(3)
    }
    if (step === 3) {
      if (role === 'player' && !game) return setError('Pick the game you compete in.')
      if (role === 'creator' && !creatorKind) return setError('Pick the kind of content you make.')
      if (role === 'organization' && !orgKind) return setError('Choose what kind of organization this is.')
      return goToStep(4)
    }
    if (!consent) return setError('Agree to the privacy notice and safety rules to create an account.')
    if (isMinor && !guardianConsent) return setError('A parent or guardian has to agree before this account is created.')
    const account: Account = {
      name: name.trim(),
      email: email.trim(),
      role: role ?? 'player',
      age,
      region: country === 'United States' ? region : country,
      guardianEmail: isMinor ? guardianEmail.trim() : '',
      marketingOptIn: marketing,
    }
    setError('')
    setCreated(account)
    onCreated(account)
  }

  if (created) {
    return <section className="page-wrap wrap">
      <div className="page-heading">
        <div className="eyebrow">ACCOUNT CREATED</div>
        <h1>Welcome,<br /><span>{created.name}.</span></h1>
        <p>Your free {roleLabels[created.role].toLowerCase()} account is ready on this device. Accounts, sign-in and profiles are not connected to the server yet, so nothing was uploaded and everything resets when you reload the page.</p>
      </div>
      <div className="signup-panel card-panel">
        <div className="signup-success-head"><span className="signup-success-mark" aria-hidden="true"><Check size={18} strokeWidth={2.6} /></span><div><h2>You’re in. It’s free.</h2><p>No card, no application fee, no pay-to-play.</p></div></div>
        <dl className="signup-summary">
          <div><dt>Role</dt><dd>{roleLabels[created.role]}</dd></div>
          <div><dt>Name</dt><dd>{created.name}</dd></div>
          <div><dt>Email</dt><dd>{created.email}</dd></div>
          <div><dt>Region</dt><dd>{created.region}</dd></div>
          <div><dt>Age</dt><dd>{created.age}</dd></div>
          <div><dt>Status</dt><dd>{created.age < 18 ? 'Guardian confirmation pending' : 'Active on this device'}</dd></div>
        </dl>
        {created.age < 18 && <p className="signup-note">We ask {created.guardianEmail} to confirm this account. No email is sent until email delivery is connected.</p>}
        <div className="signup-actions">
          <button className="button button-red" onClick={() => go('My profile')}>Open my profile <span className="button-arrow" aria-hidden="true">↗</span></button>
          <button className="button button-outline" onClick={() => go(created.role === 'organization' ? 'For organizations' : 'Marketplace')}>{created.role === 'organization' ? 'Open the organization workspace' : 'Browse roles'}</button>
          <button className="text-link" onClick={() => go('Privacy')}>Read the privacy notice</button>
        </div>
      </div>
    </section>
  }

  return <section className="page-wrap wrap">
    <div className="page-heading">
      <div className="eyebrow">FREE TO JOIN</div>
      <h1>Create a free<br /><span>account.</span></h1>
      <p>Open to players, content creators and esports organizations. No invitation, no approval queue, no card, and no application fees. Anyone 13 or older can join; anyone under 18 needs a parent or guardian to agree.</p>
    </div>

    <div className="signup-layout">
      <div className="signup-panel card-panel">
        <ol className="signup-steps" aria-label="Sign-up progress">
          {stepTitles.map((title, index) => <li key={title} className={index + 1 === step ? 'signup-step active' : index + 1 < step ? 'signup-step done' : 'signup-step'} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1}</span>{title}</li>)}
        </ol>

        <h2 className="signup-title">{stepTitles[step - 1]}</h2>

        {step === 1 && <fieldset className="role-choices">
          <legend className="sr-only">Choose the account type that fits you</legend>
          {roleChoices.map((choice) => <button type="button" key={choice.id} className={role === choice.id ? 'role-choice chosen' : 'role-choice'} aria-pressed={role === choice.id} onClick={() => { setRole(choice.id); setError('') }}>
            <span className="role-choice-icon" aria-hidden="true">{choice.icon}</span>
            <strong>{choice.label}</strong>
            <small>{choice.blurb}</small>
          </button>)}
        </fieldset>}

        {step === 2 && <div className="form-grid">
          <label className="form-field span-2">{role === 'organization' ? 'Organization name' : 'Display name'}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={role === 'organization' ? 'e.g. your team or studio name' : 'e.g. the name you compete under'} autoComplete="nickname" /></label>
          <label className="form-field span-2">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <label className="form-field span-2">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" /><em className="field-hint">Checked here only. This build never stores your password in the browser.</em></label>
          <label className="form-field">Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>European Union</option><option>Australia</option><option>Other</option></select></label>
          {country === 'United States' ? <label className="form-field">State<select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">Select your state</option>{usStates.map((state) => <option key={state}>{state}</option>)}</select></label> : <label className="form-field">Region<input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Your region" /></label>}
          <label className="form-field">Age<input type="number" min={1} max={99} value={ageInput} onChange={(event) => setAgeInput(event.target.value)} placeholder="e.g. 16" /><em className="field-hint">We store your age, not your exact date of birth.</em></label>
          {isMinor && <label className="form-field">Parent or guardian email<input type="email" value={guardianEmail} onChange={(event) => setGuardianEmail(event.target.value)} placeholder="guardian@example.com" /><em className="field-hint">Anyone under 18 needs guardian consent. We will email them once email delivery is connected.</em></label>}
        </div>}

        {step === 3 && <div className="form-grid">
          {role === 'player' && <>
            <label className="form-field">Primary game<select value={game} onChange={(event) => setGame(event.target.value)}><option value="">Select a game</option>{games.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="form-field">Role<input value={playerRole} onChange={(event) => setPlayerRole(event.target.value)} placeholder="e.g. controller, support, IGL" /></label>
            <label className="form-field">Rank<input value={rank} onChange={(event) => setRank(event.target.value)} placeholder="e.g. Immortal 2" /></label>
            <label className="form-field">Availability<input value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="e.g. 10–14 hrs/week" /></label>
            <label className="form-field span-2">What are you looking for?<input value={lookingFor} onChange={(event) => setLookingFor(event.target.value)} placeholder="e.g. an academy roster with weekly review" /></label>
            <label className="form-field span-2">Salary expectation (optional)<input value={salaryAsk} onChange={(event) => setSalaryAsk(event.target.value)} placeholder="e.g. 300–500 USD / month, or revenue share" /></label>
            {game && gameFloor ? <p className={`age-profile-note ${age < gameFloor ? 'blocked' : ''}`}>{game} competitions set a minimum age of <strong>{gameFloor}+</strong>. {age < gameFloor ? `You can still hold an account, but you cannot be signed for ${game} until you meet that floor.` : 'Your age meets that floor.'}</p> : null}
          </>}
          {role === 'creator' && <>
            <label className="form-field span-2">What do you make?<select value={creatorKind} onChange={(event) => setCreatorKind(event.target.value)}><option value="">Select a focus</option>{creatorKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
            <label className="form-field span-2">Platforms<input value={platforms} onChange={(event) => setPlatforms(event.target.value)} placeholder="e.g. YouTube, TikTok, Twitch" /></label>
            <label className="form-field span-2">Portfolio link (optional)<input value={portfolio} onChange={(event) => setPortfolio(event.target.value)} placeholder="https://…" /></label>
            <label className="form-field span-2">Rate or expectation (optional)<input value={rate} onChange={(event) => setRate(event.target.value)} placeholder="e.g. 25–35 USD / hour" /></label>
          </>}
          {role === 'organization' && <>
            <label className="form-field">Organization type<select value={orgKind} onChange={(event) => setOrgKind(event.target.value)}><option value="">Select a type</option>{orgKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
            <label className="form-field">Games or focus<input value={orgFocus} onChange={(event) => setOrgFocus(event.target.value)} placeholder="e.g. VALORANT, Rocket League" /></label>
            <label className="form-field">Website (optional)<input value={orgSite} onChange={(event) => setOrgSite(event.target.value)} placeholder="https://…" /></label>
            <label className="form-field">Hiring for<input value={hiringFor} onChange={(event) => setHiringFor(event.target.value)} placeholder="e.g. players, editor, analyst" /></label>
          </>}
        </div>}

        {step === 4 && <>
          <dl className="signup-summary">
            <div><dt>Account type</dt><dd>{role ? roleLabels[role] : '—'}</dd></div>
            <div><dt>Name</dt><dd>{name || '—'}</dd></div>
            <div><dt>Email</dt><dd>{email || '—'}</dd></div>
            <div><dt>Region</dt><dd>{country === 'United States' ? region || '—' : country}</dd></div>
            <div><dt>Age</dt><dd>{ageInput || '—'}</dd></div>
          </dl>
          <div className="consent-list">
            <label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I agree to the <button type="button" className="text-link" onClick={() => go('Privacy')}>privacy notice</button> and the <button type="button" className="text-link" onClick={() => go('Trust & safety')}>safety rules</button>, and the details above are accurate.</span></label>
            {isMinor && <label><input type="checkbox" checked={guardianConsent} onChange={(event) => setGuardianConsent(event.target.checked)} /><span>My parent or guardian has read the privacy notice and agrees to this account.</span></label>}
            <label><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /><span>Email me product updates. Optional, separate from creating an account, and never used for ads.</span></label>
          </div>
          <div className="privacy-brief">
            <strong><ShieldCheck size={15} strokeWidth={2} aria-hidden="true" /> Your data, in short</strong>
            <ul>
              <li>Free to join. We take no payment details and charge no application fees.</li>
              <li>We never sell or share your personal information, and this site loads no ad, pixel, or analytics scripts.</li>
              <li>Profiles are private by default. Nothing is published until you choose it.</li>
              <li>You can ask to see, correct, delete, or opt out at any time. Under-18 accounts need guardian consent.</li>
            </ul>
          </div>
        </>}

        {error && <p className="field-error" role="alert">{error}</p>}

        <div className="signup-actions">
          {step > 1 ? <button className="button button-outline" onClick={() => goToStep(step - 1)}>← Back</button> : <span />}
          <button className="button button-red" onClick={continueFromStep}>{step === 4 ? 'Create free account' : 'Continue'} <span className="button-arrow" aria-hidden="true">↗</span></button>
        </div>
      </div>

      <aside className="signup-sidebar">
        <div className="side-callout">
          <div className="eyebrow">ALWAYS FREE</div>
          <h3>No fee, no pay-to-play.</h3>
          <p>Creating an account and applying to roles stays free. Nobody can charge you for consideration, and organizations can’t buy visibility over candidates.</p>
        </div>
        <div className="signup-facts">
          <div><strong>13+</strong><span>Minimum age. Under 13 cannot create an account under federal COPPA rules.</span></div>
          <div><strong>18</strong><span>Guardian consent required for everyone under 18.</span></div>
          <div><strong>0</strong><span>Ad scripts, trackers, or data sales on this site.</span></div>
        </div>
        <button className="text-link" onClick={() => go('Privacy')}>Read the full privacy notice <span className="button-arrow" aria-hidden="true">↗</span></button>
      </aside>
    </div>
  </section>
}

export function PrivacyPage({ go }: { go: (page: string) => void }) {
  return <section className="page-wrap wrap">
    <div className="page-heading">
      <div className="eyebrow">PRIVACY / UNITED STATES</div>
      <h1>Your data,<br /><span>your rights.</span></h1>
      <p>How VAYNTR Talent handles personal information for accounts, profiles, messages and applications, and the rights US privacy laws give you. Reviewed October 22, 2026.</p>
    </div>

    <div className="privacy-callout">
      <strong>Draft notice.</strong>
      <span>This build stores nothing on a server: your answers stay in the browser tab and reset on reload. The policy below describes the service that launches with the API, and it needs legal review before launch.</span>
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
      <article className="trust-card"><span className="trust-number">05</span><h2>Minors and guardians</h2><p>Teen accounts get protective defaults: candidate discovery off, no public profile, no ads, no engagement feeds, and no targeted messaging from unverified organizations. A parent or guardian can ask to review, correct, or delete a minor’s information at any time.</p></article>
      <article className="trust-card"><span className="trust-number">06</span><h2>How long we keep it</h2><p>Profile, application and message data is kept while the account is active and deleted within 30 days of a verified deletion request, unless a safety investigation or legal obligation requires longer retention. Reports are kept only as long as needed to resolve them.</p></article>
      <article className="trust-card"><span className="trust-number">07</span><h2>How it is protected</h2><p>Production data must be encrypted in transit and at rest, scoped per account and organization, and reachable only by authorized staff for a specific case. This build keeps everything in memory precisely because it has no secure server yet.</p></article>
      <article className="trust-card"><span className="trust-number">08</span><h2>Changes and contact</h2><p>Material changes to this notice will be announced in-product before they take effect. Privacy requests and questions go through the feedback panel until a monitored privacy contact is assigned, which is a launch requirement.</p></article>
    </div>

    <div className="privacy-note"><strong>Not legal advice.</strong><p>This notice reflects published federal and state requirements as of October 2026, including COPPA and the California privacy statutes. Some state child-safety provisions are enjoined or not yet effective. Have counsel review the final policy, retention schedule, and request-handling process before launch.</p><button className="text-link" onClick={() => go('Trust & safety')}>Safety guidance <span className="button-arrow" aria-hidden="true">↗</span></button></div>
  </section>
}
