'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Check, CircleAlert, Plus, Search, ShieldCheck, UserRound } from 'lucide-react'
type Listing = {
  id: string; title: string; org: string; mark: string; category: string; game: string; openings: number
  engagement: string; salary: string; payTerms: string; hours: string; schedule: string; location: string; eligibility: string
  experience: string; skills: string; responsibilities: string; process: string; posted: string; expires: string; description: string
}
type Application = { listingId: string; status: string; shared: string[] }
type Player = {
  id: string; name: string; handle: string; mark: string; game: string; role: string; rank: string
  region: string; age: number; availability: string; lookingFor: string; expecting: string; languages: string; blurb: string
}
type ChatMessage = { id: string; from: 'org' | 'player'; body: string; at: string }
type Conversation = { id: string; org: string; orgMark: string; playerId: string; playerName: string; playerMark: string; subject: string; messages: ChatMessage[] }
const orgs = [
  { name: 'Northstar Esports', mark: 'N', location: 'Remote · Americas', focus: 'VALORANT · Rocket League', summary: 'Community esports organization focused on structured, respectful competition.', listings: 2 },
  { name: 'PixelForge Studio', mark: 'P', location: 'Remote · Worldwide', focus: 'Gaming & creator content', summary: 'A small creator production team looking for thoughtful collaborators.', listings: 1 },
  { name: 'Arcadia Collective', mark: 'A', location: 'Remote · Europe / Africa', focus: 'Multi-game community · Fighting games', summary: 'An independent community project supporting events and creator work.', listings: 2 },
]
const players: Player[] = [
  { id: 'p1', name: 'Mika Sato', handle: 'mikasato', mark: 'M', game: 'Rocket League', role: 'Midfielder / striker', rank: 'Grand Champion 2', region: 'Europe · UTC+1', age: 14, availability: '10–14 hrs/week', lookingFor: 'Academy or RLCS roster', expecting: '300–500 USD / month (guardian-managed)', languages: 'English, Japanese', blurb: 'Two seasons of structured 3v3 scrims with a coach. Wants a roster with weekly VOD review and a clear trial path.' },
  { id: 'p2', name: 'Dante Cruz', handle: 'dcruz', mark: 'D', game: 'Call of Duty / Warzone', role: 'Entry fragger', rank: 'Crimson I', region: 'Americas · UTC−6', age: 17, availability: '15+ hrs/week', lookingFor: 'Challengers team', expecting: 'Trial first, then 500+ USD / month', languages: 'English, Spanish', blurb: 'Grinds ranked nightly and calls rotations. Looking for a Challengers roster with scheduled practice.' },
  { id: 'p3', name: 'Nadia Ferreira', handle: 'nadiaf', mark: 'N', game: 'VALORANT', role: 'Controller / IGL', rank: 'Immortal 2', region: 'Brazil · UTC−3', age: 19, availability: '20 hrs/week', lookingFor: 'Tier 2 roster', expecting: '1,000–1,500 USD / month', languages: 'Portuguese, English', blurb: 'Two years calling for a Tier 3 roster. Comfortable building a playbook from scratch and reviewing with the team.' },
  { id: 'p4', name: 'Owen Blake', handle: 'oblake', mark: 'O', game: 'Apex Legends', role: 'Support / anchor', rank: 'Predator', region: 'North America · UTC−5', age: 16, availability: '12 hrs/week', lookingFor: 'ALGS challenger circuit', expecting: '500–800 USD / month', languages: 'English', blurb: 'Plays anchor for a ranked trio, tracks zone rotations and keeps comms short.' },
  { id: 'p5', name: 'Ivy Chen', handle: 'ivychen', mark: 'I', game: 'Fortnite', role: 'Flex / IGL', rank: 'Elite', region: 'Asia-Pacific · UTC+8', age: 15, availability: '8–10 hrs/week', lookingFor: 'Duo or trio for FNCS', expecting: 'Revenue share or 300 USD / month', languages: 'English, Mandarin', blurb: 'Practices box fights and endgame calls daily. Looking for a duo that reviews scrim results together.' },
  { id: 'p6', name: 'Rafael Moreno', handle: 'rmoreno', mark: 'R', game: 'Overwatch 2', role: 'Flex support', rank: 'Grandmaster 3', region: 'Europe · UTC+2', age: 18, availability: '18 hrs/week', lookingFor: 'OWCS Open Division', expecting: '800–1,200 USD / month', languages: 'English, Spanish', blurb: 'Flex support with scrim experience across two Open Division runs. Wants a team with a fixed weekly schedule.' },
]
const listings: Listing[] = [
  { id: '1', title: 'Valorant Controller Player', org: 'Northstar Esports', mark: 'N', category: 'Player', game: 'VALORANT', openings: 1, engagement: 'Trial', salary: '1,500 USD / month after trial', payTerms: 'The trial itself is unpaid. Salary, travel cover, and contract length are confirmed in writing before signing.', hours: '8–12 hrs/week', schedule: 'Evenings, UTC−5 to UTC−3', location: 'Remote · Americas', eligibility: 'VCT rules require 18+; reliable internet in the Americas', experience: 'Competitive team experience preferred', skills: 'Controller agent pool, clear comms, review mindset', responsibilities: 'Attend scheduled scrims, communicate availability, review match VODs with the team.', process: 'Platform application → team review → mutually agreed trial details. No purchase or fee required.', posted: 'Oct 18, 2026', expires: 'Nov 17, 2026', description: 'Looking for a dependable controller player who enjoys structured practice and constructive communication. Share only the profile details you choose.' },
  { id: '2', title: 'Short-form Video Editor', org: 'PixelForge Studio', mark: 'P', category: 'Editor', game: 'Gaming & creator content', openings: 2, engagement: 'Freelance', salary: '25–35 USD / hour', payTerms: 'Paid freelance, invoiced monthly. The test edit is paid at the agreed rate.', hours: '4–8 hrs/week', schedule: 'Flexible; async', location: 'Remote · Worldwide', eligibility: 'Adults 18+; able to invoice in your region', experience: 'Portfolio demonstrating short-form edits', skills: 'Premiere Pro or DaVinci Resolve, captions, pacing', responsibilities: 'Edit supplied gameplay and creator footage into vertical short videos; deliver project files.', process: 'Platform application with portfolio → paid test edit with agreed scope and rate.', posted: 'Oct 20, 2026', expires: 'Nov 19, 2026', description: 'Small creator team looking for an editor to help package existing long-form footage into vertical clips. No guaranteed volume; test work is paid.' },
  { id: '3', title: 'Community & Social Coordinator', org: 'Arcadia Collective', mark: 'A', category: 'Community/social', game: 'Multi-game community', openings: 1, engagement: 'Contract', salary: '400–600 USD / month', payTerms: 'Paid contract, invoiced monthly. Scope and deliverables are agreed in writing before work begins.', hours: '6 hrs/week', schedule: 'Flexible; weekly sync', location: 'Remote · Europe / Africa', eligibility: 'Adults 18+; Europe/Africa time zones', experience: 'Community moderation or social publishing experience', skills: 'Clear writing, conflict de-escalation, scheduling', responsibilities: 'Help plan community posts, maintain event calendar, escalate safety concerns to owner.', process: 'Platform application → structured conversation on platform → written scope.', posted: 'Oct 21, 2026', expires: 'Nov 20, 2026', description: 'A small community project seeking a thoughtful coordinator. This is a defined part-time contract; exact deliverables are agreed before work begins.' },
  { id: '4', title: 'Rocket League Analyst', org: 'Northstar Esports', mark: 'N', category: 'Analyst', game: 'Rocket League', openings: 1, engagement: 'Volunteer', salary: 'Unpaid volunteer', payTerms: 'No pay for this role. No fee is required to apply, and expenses are agreed before any spend.', hours: '3–5 hrs/week', schedule: 'Weekends, UTC−5 to UTC−3', location: 'Remote · Americas', eligibility: 'Rocket League rules allow 13+ with guardian consent; Americas', experience: 'Experience reviewing competitive matches', skills: 'Replay analysis, concise written feedback, rotation fundamentals', responsibilities: 'Review agreed match replays, identify a small number of actionable patterns.', process: 'Platform application → short analysis discussion. No fees, purchases, or guaranteed future paid role.', posted: 'Oct 16, 2026', expires: 'Nov 15, 2026', description: 'Volunteer community development role with clear hours and scope. Please apply only if unpaid work fits your circumstances.' },
  { id: '5', title: 'Creator & Caster', org: 'Arcadia Collective', mark: 'A', category: 'Caster', game: 'Fighting games', openings: 1, engagement: 'Freelance', salary: 'Commission-based', payTerms: 'Commission is not guaranteed. Rates, commission basis, and rights are agreed in writing before work.', hours: 'Event-based, 2–4 hrs/event', schedule: 'Some weekends', location: 'Remote · Worldwide', eligibility: 'Adults 18+; spoken English', experience: 'Portfolio or recordings welcome', skills: 'Live commentary, accurate game knowledge, collaboration', responsibilities: 'Cast selected online community events and deliver recordings for review.', process: 'Platform application → discuss rates, commission basis, rights and schedule before accepting.', posted: 'Oct 19, 2026', expires: 'Nov 18, 2026', description: 'Community event casting opportunity. Commission is not guaranteed; ask for the event economics and written terms before deciding.' },
]
type AgePolicy = { game: string; minAge: number; note: string; source: string }
// Minimum ages come from each scene's competition rules, not from a platform-wide number.
// Guardian consent is required for every minor; organisation contracts for a minor also need a guardian's signature.
const gameAgePolicies: AgePolicy[] = [
  { game: 'Rocket League', minAge: 13, note: 'RLCS lowered its minimum to 13 in 2024, so a 14-year-old can sign with an org. A guardian must consent and accompany them at in-person events.', source: 'https://www.rocketleague.com/competitive/rules' },
  { game: 'Fortnite', minAge: 13, note: 'FNCS rules set 13+, with parent or guardian permission to compete.', source: 'https://www.fortnite.com/competitive/rules-guidelines/rules-library/fortnite-championship-series-fncs-2026-official-rules' },
  { game: 'Street Fighter 6', minAge: 13, note: 'Capcom Pro Tour requires 13+ and the local game rating, with guardian consent and accompaniment.', source: 'https://sf.esports.capcom.com/cpt/2025/rules/' },
  { game: 'Apex Legends', minAge: 16, note: 'ALGS requires 16+ (17 in Japan, 18 in South Korea) and guardian consent for minors.', source: 'https://algs.ea.com/year-6-rules.pdf' },
  { game: 'Counter-Strike 2', minAge: 16, note: 'ESL Pro League qualifiers list 16+; Valve leaves the Major age floor to event organisers.', source: 'https://pro.eslgaming.com/tour/2025/02/2025-rulebook-update-2/' },
  { game: 'EA SPORTS FC', minAge: 16, note: 'FC Pro uses 16+ (17 in Japan; 18 in Ghana, Kenya, Nigeria and South Korea).', source: 'https://www.ea.com/games/ea-sports-fc/fc-pro/ea-sports-fc-pro-26-official-rules' },
  { game: 'League of Legends', minAge: 17, note: 'LCS/LTA competition is 17+; the LEC requires players to have lived 18 years to play a match.', source: 'https://competitiveops.riotgames.com/library?GAME=lol' },
  { game: 'Overwatch 2', minAge: 17, note: 'OWCS requires players to be 17 by the first day of each tournament.', source: 'https://esports.overwatch.com/faq' },
  { game: 'VALORANT', minAge: 18, note: 'VCT Tier 1 is 18+. Challengers and regional qualifiers can set their own rules.', source: 'https://competitiveops.riotgames.com/library?GAME=val' },
  { game: 'Call of Duty / Warzone', minAge: 18, note: 'CDL Challengers and the World Series of Warzone are 18+.', source: 'https://callofdutyleague.com/en-us/challengers/how-to-compete' },
  { game: 'Rainbow Six Siege', minAge: 18, note: 'BLAST R6 requires players and team staff to be 18+ at their first match.', source: 'https://www.ubisoft.com/en-us/esports/rainbow-six' },
  { game: 'Tekken 8', minAge: 18, note: 'Tekken World Tour requires the local age of majority or explicit guardian permission.', source: 'https://www.bandainamcoent.com/legal/community-events/official-rules-twt' },
]
const defaultAgePolicy: AgePolicy = {
  game: 'Content & production roles',
  minAge: 16,
  note: 'Non-competition roles use the platform minimum of 16. A guardian must consent for anyone under 18.',
  source: '',
}
function agePolicyFor(game: string) {
  return gameAgePolicies.find((policy) => policy.game === game) ?? defaultAgePolicy
}
const statusOptions = ['Received', 'In review', 'Interview', 'Not selected', 'Withdrawn']

const seedConversations: Conversation[] = [
  { id: 'c1', org: 'Arcadia Collective', orgMark: 'A', playerId: 'me', playerName: 'You', playerMark: 'Y', subject: 'Casting two November events', messages: [
    { id: 'm1', from: 'org', body: 'Hi — we are booking casters for two online fighting-game events in November. Are you open to a 20-minute call this week to talk rates and format?', at: 'Mon 09:14' },
  ] },
  { id: 'c2', org: 'Northstar Esports', orgMark: 'N', playerId: 'me', playerName: 'You', playerMark: 'Y', subject: 'Rocket League analyst trial', messages: [
    { id: 'm2', from: 'player', body: 'Hi, I applied for the analyst role. Happy to walk through how I review a replay.', at: 'Sun 18:02' },
    { id: 'm3', from: 'org', body: 'Thanks for applying. Could you review one replay before Thursday and send two observations? This is an unpaid trial step, no fee involved.', at: 'Mon 08:40' },
  ] },
  { id: 'c3', org: 'Northstar Esports', orgMark: 'N', playerId: 'p1', playerName: 'Mika Sato', playerMark: 'M', subject: 'Rocket League · academy trial', messages: [
    { id: 'm4', from: 'org', body: 'Your profile stood out. Our academy roster scrims Tuesday and Thursday. Would your guardian be available for a short call before we confirm a trial?', at: 'Mon 10:05' },
  ] },
  { id: 'c4', org: 'Northstar Esports', orgMark: 'N', playerId: 'p6', playerName: 'Rafael Moreno', playerMark: 'R', subject: 'Overwatch 2 · flex support', messages: [
    { id: 'm5', from: 'player', body: 'I saw the analyst listing, but I play flex support. Do you have a roster spot opening for OWCS Open Division?', at: 'Sun 21:30' },
    { id: 'm6', from: 'org', body: 'Not yet, but we are finalising a roster for the next split. Sending your profile to the coach.', at: 'Mon 07:55' },
  ] },
]
function lastMessage(conversation: Conversation) {
  return conversation.messages[conversation.messages.length - 1]
}
const commandActions = [
  { page: 'Home', label: 'Home', description: 'Return to the landing page', keywords: 'start landing overview', icon: '⌂' },
  { page: 'Marketplace', label: 'Marketplace', description: 'Browse organizations looking for players', keywords: 'jobs roles listings search orgs', icon: '⌕' },
  { page: 'Players', label: 'Players seeking orgs', description: 'Browse players looking for an organization', keywords: 'talent candidates lft free agents players', icon: '◎' },
  { page: 'Messages', label: 'Messages', description: 'Open conversations with organizations and players', keywords: 'inbox chat contact replies dm', icon: '✉' },
  { page: 'Organizations', label: 'Organizations', description: 'Browse the organization directory', keywords: 'teams companies directory', icon: '◈' },
  { page: 'Resources', label: 'Resources', description: 'Open competitive and creator guides', keywords: 'guides articles learning', icon: '↗' },
  { page: 'Trust & safety', label: 'Trust & safety', description: 'Review safety guidance and reporting', keywords: 'privacy report safe support', icon: '◇' },
  { page: 'For organizations', label: 'For organizations', description: 'Open your organization workspace', keywords: 'recruiters inbox dashboard', icon: '▤' },
  { page: 'My profile', label: 'My profile', description: 'Edit your candidate profile', keywords: 'candidate settings visibility', icon: '◎' },
  { page: 'Applications', label: 'Applications', description: 'Review and withdraw applications', keywords: 'candidate status withdraw', icon: '↳' },
  { page: 'Moderation', label: 'Moderator dashboard', description: 'Review reports and cases', keywords: 'staff reports cases', icon: '▦' },
]

function App() {
  const [page, setPage] = useState('Home')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All roles')
  const [selected, setSelected] = useState<Listing | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notice, setNotice] = useState('')
  const [profileName, setProfileName] = useState('')
  const [age, setAge] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [activeThread, setActiveThread] = useState<string | null>(seedConversations[0].id)
  const [blocked, setBlocked] = useState<string[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandSelection, setCommandSelection] = useState(0)
  const categories = ['All roles', ...new Set(listings.map((item) => item.category))]
  useEffect(() => {
    const navigate = (event: Event) => { const next = (event as CustomEvent<string>).detail; setPage(next); setSelected(null); setSelectedOrg(null); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    window.addEventListener('navigate-page', navigate)
    return () => window.removeEventListener('navigate-page', navigate)
  }, [])
  useEffect(() => {
    const handleQuickNavigation = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
        setCommandQuery('')
        setCommandSelection(0)
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleQuickNavigation)
    return () => window.removeEventListener('keydown', handleQuickNavigation)
  }, [])
  const filtered = useMemo(() => listings.filter((item) => {
    const matchText = `${item.title} ${item.org} ${item.game} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    return matchText && (category === 'All roles' || item.category === category) && !blocked.includes(item.org)
  }), [query, category, blocked])
  const matchingCommands = useMemo(() => {
    const normalized = commandQuery.trim().toLowerCase()
    return commandActions.filter((action) => `${action.label} ${action.description} ${action.keywords}`.toLowerCase().includes(normalized))
  }, [commandQuery])
  function go(next: string) { setPage(next); setSelected(null); setSelectedOrg(null); setMobileMenu(false); setCommandOpen(false); setCommandQuery(''); setCommandSelection(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function apply(item: Listing, shared: string[]) {
    if (!applications.some((application) => application.listingId === item.id)) setApplications([...applications, { listingId: item.id, status: 'Received', shared }])
    setNotice(`Application recorded for ${item.title}. Track responses in Applications.`)
  }
  function updateStatus(id: string, status: string) { setApplications(applications.map((app) => app.listingId === id ? { ...app, status } : app)) }
  function showNotice(text: string) { setNotice(text); window.setTimeout(() => setNotice(''), 5000) }
  function ensureConversation(input: Omit<Conversation, 'id' | 'messages'> & { opener: string; from: 'org' | 'player' }) {
    const existing = conversations.find((conversation) => conversation.org === input.org && conversation.playerId === input.playerId)
    if (existing) return existing.id
    const id = `chat-${conversations.length + 1}-${input.org.slice(0, 3).toLowerCase()}`
    setConversations([{ id, org: input.org, orgMark: input.orgMark, playerId: input.playerId, playerName: input.playerName, playerMark: input.playerMark, subject: input.subject, messages: [{ id: `${id}-1`, from: input.from, body: input.opener, at: 'Just now' }] }, ...conversations])
    return id
  }
  function sendMessage(id: string, body: string, from: 'org' | 'player') {
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, messages: [...conversation.messages, { id: `${id}-${conversation.messages.length + 1}`, from, body, at: 'Just now' }] } : conversation))
  }
  function contactOrg(item: Listing) {
    const id = ensureConversation({ org: item.org, orgMark: item.mark, playerId: 'me', playerName: profileName || 'You', playerMark: (profileName || 'Y').slice(0, 1).toUpperCase(), subject: item.title, opener: `Hi ${item.org}, I am interested in the ${item.title} role. Could we talk through the process and the terms?`, from: 'player' })
    setActiveThread(id)
    go('Messages')
  }
  function contactPlayer(player: Player) {
    const id = ensureConversation({ org: 'Northstar Esports', orgMark: 'N', playerId: player.id, playerName: player.name, playerMark: player.mark, subject: `${player.game} · ${player.role}`, opener: `Hi ${player.name.split(' ')[0]}, your profile came up on VAYNTR Talent. Would you be open to a conversation about a trial with Northstar Esports?`, from: 'org' })
    setActiveThread(id)
    go('For organizations')
  }
  const playerThreads = conversations.filter((conversation) => conversation.playerId === 'me')
  const orgThreads = conversations.filter((conversation) => conversation.playerId !== 'me')
  const awaitingReply = playerThreads.filter((conversation) => lastMessage(conversation)?.from === 'org').length
  const pages = ['Marketplace', 'Players', 'Organizations', 'Resources', 'Trust & safety', 'Messages', 'For organizations', 'My profile', 'Applications']
  return <div className="app-shell">
    <header className="header">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); go('Home') }} aria-label="VAYNTR Talent home"><span className="brand-symbol">V<span>.</span></span><span className="brand-text">VAYNTR<span>TALENT</span></span></a>
      <button className="menu-button" aria-label="Toggle navigation" aria-expanded={mobileMenu} aria-controls="primary-nav" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
      <nav id="primary-nav" className={mobileMenu ? 'nav open' : 'nav'} aria-label="Main navigation">{pages.slice(0, 5).map((item) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => go(item)}>{item}</button>)}</nav>
      <button className="command-trigger" type="button" aria-label="Open quick navigation (Ctrl or Command plus K)" aria-keyshortcuts="Control+K Meta+K" onClick={() => { setCommandQuery(''); setCommandSelection(0); setCommandOpen(true) }}><span className="command-trigger-icon" aria-hidden="true">⌕</span><span className="command-trigger-label">Quick jump</span><kbd>Ctrl K</kbd></button>
      <div className="header-actions"><button className="inbox-link" onClick={() => go('Messages')}>Inbox{awaitingReply > 0 && <span className="inbox-badge">{awaitingReply}</span>}</button><button className="signin" onClick={() => go('My profile')}>Sign in</button><button className="button button-red button-small" onClick={() => go('Marketplace')}>Explore roles <span className="button-arrow" aria-hidden="true">↗</span></button></div>
    </header>
    {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
    {commandOpen && <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false) }}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><h2 id="command-title" className="sr-only">Quick navigation</h2><div className="command-search-row"><span className="command-search-icon" aria-hidden="true">⌕</span><input autoFocus aria-label="Search pages and actions" role="combobox" aria-controls="quick-nav-results" aria-expanded="true" value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandSelection(0) }} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setCommandSelection((current) => matchingCommands.length ? (current + 1) % matchingCommands.length : 0) } else if (event.key === 'ArrowUp') { event.preventDefault(); setCommandSelection((current) => matchingCommands.length ? (current - 1 + matchingCommands.length) % matchingCommands.length : 0) } else if (event.key === 'Enter') { event.preventDefault(); const action = matchingCommands[commandSelection]; if (action) go(action.page) } }} placeholder="Jump to a page or workspace…" /><kbd className="command-escape">ESC</kbd></div><div id="quick-nav-results" className="command-results" role="listbox" aria-label="Navigation results">{matchingCommands.map((action, index) => <button key={action.page} id={`quick-nav-option-${index}`} type="button" role="option" aria-selected={index === commandSelection} className={index === commandSelection ? 'command-option selected' : 'command-option'} onMouseEnter={() => setCommandSelection(index)} onClick={() => go(action.page)}><span className="command-option-icon" aria-hidden="true">{action.icon}</span><span className="command-option-copy"><strong>{action.label}</strong><small>{action.description}</small></span><kbd>↵</kbd></button>)}</div>{matchingCommands.length === 0 && <div className="command-empty">No matching page. Try a shorter search.</div>}<div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Move</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div></section></div>}
    {page === 'Home' && <HomePage go={go} />}
    {page === 'Marketplace' && <Marketplace query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} filtered={filtered} onSelect={setSelected} selected={selected} apply={apply} applications={applications} onReport={() => setReportOpen(true)} blocked={blocked} setBlocked={setBlocked} go={go} age={age} onEditProfile={() => go('My profile')} onMessageOrg={contactOrg} />}
    {page === 'Players' && <PlayersPage players={players} onMessage={contactPlayer} go={go} />}
    {page === 'Messages' && <MessagesPage conversations={playerThreads} activeId={activeThread} setActiveId={setActiveThread} onSend={(id, body) => sendMessage(id, body, 'player')} go={go} />}
    {page === 'Organizations' && <OrganizationsPage go={go} selectOrg={(name) => { setSelectedOrg(name); setPage('Organization detail') }} />}
    {page === 'Organization detail' && selectedOrg && <PublicOrganization name={selectedOrg} go={go} onSelect={(listing) => { setSelected(listing); setPage('Marketplace') }} />}
    {page === 'For organizations' && <OrganizationPage onNotice={showNotice} applications={applications} updateStatus={updateStatus} profileName={profileName} conversations={orgThreads} activeId={activeThread} setActiveId={setActiveThread} onSend={(id, body) => sendMessage(id, body, 'org')} />}
    {page === 'My profile' && <ProfilePage name={profileName} setName={setProfileName} visible={visible} setVisible={setVisible} onNotice={showNotice} age={age} setAge={setAge} onOpenTrust={() => go('Trust & safety')} />}
    {page === 'Applications' && <ApplicationsPage applications={applications} updateStatus={updateStatus} onNotice={showNotice} />}
    {page === 'Trust & safety' && <TrustPage onReport={() => setReportOpen(true)} onModeration={() => go('Moderation')} />}
    {page === 'Moderation' && <ModerationPage onNotice={showNotice} onReport={() => setReportOpen(true)} />}
    {page === 'Resources' && <ResourcesPage />}
    
    <footer className="footer"><div className="footer-main"><div><a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); go('Home') }}><span className="brand-symbol">V<span>.</span></span><span className="brand-text">VAYNTR<span>TALENT</span></span></a><p className="footer-tagline">Find your next team. Build with care.</p></div><div className="footer-nav"><button onClick={() => go('Marketplace')}>Marketplace</button><button onClick={() => go('Players')}>Players</button><button onClick={() => go('Organizations')}>Organizations</button><button onClick={() => go('Messages')}>Messages</button><button onClick={() => go('Resources')}>Resources</button><button onClick={() => go('Trust & safety')}>Trust &amp; safety</button><button onClick={() => go('For organizations')}>For organizations</button><button onClick={() => go('My profile')}>My profile</button><button onClick={() => go('Applications')}>Applications</button></div><div className="footer-contact"><strong>Need help?</strong><a href="mailto:support@vayntr.example">Contact support</a><span>Safety and moderation questions welcome</span></div></div><div className="footer-bottom"><span>© 2026 VAYNTR Talent</span><span>Recruitment is not guaranteed. Evaluate every opportunity carefully.</span><button onClick={() => go('Trust & safety')}>Privacy &amp; safety</button></div></footer>
    {reportOpen && <ReportDialog onClose={() => setReportOpen(false)} onSubmit={(reason) => { setReportOpen(false); showNotice(`Report received (${reason}).`) }} />}
    <FeedbackWidget onNotice={showNotice} open={feedbackOpen} setOpen={setFeedbackOpen} />
  </div>
}
function HomePage({ go }: { go: (page: string) => void }) {
  return <>
    <section className="hero wrap">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> TALENT, WITHOUT THE NOISE</div>
          <h1>Find your<br />place in the<br /><span>game.</span></h1>
          <p className="hero-lead">A more thoughtful way for esports organizations and creator teams to meet the people they need.</p>
          <div className="hero-actions">
            <button className="button button-red" onClick={() => go('Marketplace')}>Explore opportunities <span className="button-arrow" aria-hidden="true">↗</span></button>
            <button className="button button-outline" onClick={() => go('For organizations')}>I’m an organization</button>
          </div>
          <p className="hero-note"><span className="checkmark">✓</span> Free to create a candidate profile and apply. No pay-to-play.</p>
        </div>
        <div className="hero-visual" role="img" aria-label="Abstract VAYNTR graphic about finding your next opportunity">
          <div className="hero-art-meta"><span>VT / 001</span><span>INDEPENDENT TALENT NETWORK</span></div>
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="hero-orbit orbit-three" aria-hidden="true" />
          <div className="hero-slash slash-one" aria-hidden="true" />
          <div className="hero-slash slash-two" aria-hidden="true" />
          <div className="hero-core" aria-hidden="true">V<span>.</span></div>
          <div className="hero-art-signal"><span>FIND YOUR<br />NEXT PLAY</span><i aria-hidden="true">↗</i></div>
          <div className="float-card card-one"><span className="mini-icon" aria-hidden="true">⌁</span><div><b>Analyst · Northstar</b><small>Paid trial · 4–6 hrs/week</small></div></div>
          <div className="float-card card-two"><span className="mini-dot" aria-hidden="true" /><div><b>Editor · PixelForge</b><small>Paid · $25–35 / hour</small></div></div>
          <span className="hero-side-label">FIND&nbsp; / &nbsp;CONNECT&nbsp; / &nbsp;BUILD</span>
          <span className="visual-caption">BUILT FOR THE NEXT PLAY</span>
        </div>
      </div>
      <div className="hero-trust-row">
        <span><i>01</i> Apply on your terms</span>
        <span><i>02</i> Share only what you choose</span>
        <span><i>03</i> Ask questions. Verify independently.</span>
      </div>
      <div className="discipline-strip" aria-label="Who VAYNTR Talent is for">
        <div className="discipline-track">
          {[0, 1].map((copy) => <div className="discipline-group" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
            <span>PLAYERS</span><i aria-hidden="true">✳</i><span>CREATORS</span><i aria-hidden="true">✳</i><span>TEAMS</span><i aria-hidden="true">✳</i><span>PRODUCTION</span><i aria-hidden="true">✳</i><span>COMMUNITY</span><i aria-hidden="true">✳</i>
          </div>)}
        </div>
      </div>
    </section>
    <section className="dual-paths wrap" aria-label="Choose your side of the marketplace">
      <button className="path-card" onClick={() => go('Players')}>
        <span className="path-tag">I’M A PLAYER</span>
        <h2>Find an org<br />that fits.</h2>
        <p>Put your role, rank, and availability in front of organizations that are actually recruiting.</p>
        <span className="path-cta">Browse players looking for an org <span className="button-arrow" aria-hidden="true">↗</span></span>
      </button>
      <button className="path-card path-card-dark" onClick={() => go('Marketplace')}>
        <span className="path-tag">I’M AN ORGANIZATION</span>
        <h2>Find players<br />who fit.</h2>
        <p>Post the terms up front, browse opt-in players, and keep every conversation in one inbox.</p>
        <span className="path-cta">Browse orgs looking for players <span className="button-arrow" aria-hidden="true">↗</span></span>
      </button>
    </section>
    <section className="section wrap">
      <div className="section-heading">
        <div><div className="eyebrow">THE MARKETPLACE</div><h2>Good teams start<br className="mobile-break" /> with good people.</h2></div>
        <button className="text-link" onClick={() => go('Marketplace')}>Browse all opportunities <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
      <div className="feature-grid">
        <article className="feature-card">
          <span className="feature-index">01 / CANDIDATES</span>
          <div className="feature-icon" aria-hidden="true"><UserRound size={21} strokeWidth={1.7} /></div>
          <h3>Put your work first.</h3>
          <p>Build a profile around your skills, experience, and goals. Keep it private until you decide otherwise.</p>
          <button className="text-link" onClick={() => go('My profile')}>Create your profile <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>
        <article className="feature-card featured">
          <span className="feature-index">02 / OPPORTUNITIES</span>
          <div className="feature-icon" aria-hidden="true"><Search size={21} strokeWidth={1.7} /></div>
          <h3>Know what you’re applying for.</h3>
          <p>Browse roles with clear expectations on pay, hours, location, and how the process works.</p>
          <button className="text-link" onClick={() => go('Marketplace')}>Find a role <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>
        <article className="feature-card">
          <span className="feature-index">03 / TRUST</span>
          <div className="feature-icon" aria-hidden="true"><ShieldCheck size={21} strokeWidth={1.7} /></div>
          <h3>Take safety seriously.</h3>
          <p>Learn how to assess offers, protect your information, and report behavior that crosses a line.</p>
          <button className="text-link" onClick={() => go('Trust & safety')}>Our safety approach <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>
      </div>
    </section>
    <section className="section wrap home-roles-section">
      <div className="section-heading home-roles-heading">
        <div><div className="eyebrow">OPEN NOW / ROLES</div><h2>Roles worth<br className="mobile-break" /> a closer look.</h2></div>
        <button className="text-link" onClick={() => go('Marketplace')}>Browse all roles <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
      <div className="home-roles">
        {listings.slice(0, 3).map((item) => <article className="home-role" key={item.id}>
          <div className="home-role-top"><span className="org-mark">{item.mark}</span><span className="home-role-pay">{item.salary}</span></div>
          <h3>{item.title}</h3>
          <p>{item.org} · {item.location}</p>
          <div className="listing-tags"><span>{item.category}</span><span>{item.engagement}</span></div>
          <button className="home-role-action" onClick={() => go('Marketplace')}>View role <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>)}
      </div>
    </section>
    <section className="dark-band">
      <div className="wrap dark-band-inner">
        <div><div className="eyebrow">NO PROMISES. JUST A CLEARER PROCESS.</div><h2>Talent deserves<br />straight answers.</h2></div>
        <p>VAYNTR Talent is a place to discover opportunities—not a guarantee of a role, income, or a safe outcome. We want every listing to be clear and every person to feel in control. Always do your own due diligence.</p>
        <button className="button button-outline light-outline" onClick={() => go('Trust & safety')}>Understand the risks <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>
    <section className="section wrap resources-preview">
      <div className="section-heading">
        <div><div className="eyebrow">THE EXTRA ROUND</div><h2>Make your next move<br />a smarter one.</h2></div>
        <button className="text-link" onClick={() => go('Resources')}>Explore resources <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
      <div className="resource-cards">
        <article className="resource-card">
          <span>COMPETITIVE DEVELOPMENT</span><h3>Review the round, not just the result.</h3>
          <p>A practical VOD review starting point for players and teams.</p>
          <button onClick={() => go('Resources')}>Read the guide <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>
        <article className="resource-card red-card">
          <span>CREATOR WORKFLOW</span><h3>Plan a format you can sustain.</h3>
          <p>Turn a content idea into a simple, repeatable process.</p>
          <button onClick={() => go('Resources')}>Read the guide <span className="button-arrow" aria-hidden="true">↗</span></button>
        </article>
      </div>
    </section>
    <section className="bottom-cta">
      <div className="wrap bottom-cta-inner">
        <div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Ready when you are.</h2><p>Browse open roles, or put your own profile in front of organizations.</p></div>
        <button className="button button-red" onClick={() => go('Marketplace')}>Explore opportunities <span className="button-arrow" aria-hidden="true">↗</span></button>
      </div>
    </section>
  </>
}
function Marketplace({ query, setQuery, category, setCategory, categories, filtered, onSelect, selected, apply, applications, onReport, blocked, setBlocked, go, age, onEditProfile, onMessageOrg }: { query: string; setQuery: (x: string) => void; category: string; setCategory: (x: string) => void; categories: string[]; filtered: Listing[]; selected: Listing | null; onSelect: (x: Listing | null) => void; apply: (x: Listing, shared: string[]) => void; applications: Application[]; onReport: () => void; blocked: string[]; setBlocked: (x: string[]) => void; go: (x: string) => void; age: number | null; onEditProfile: () => void; onMessageOrg: (item: Listing) => void }) { return <section className="page-wrap wrap"><SectionSwitch active="orgs" onSelect={(view) => { if (view === 'players') go('Players') }} /><div className="page-heading"><div className="eyebrow">ORGS LOOKING FOR PLAYERS</div><h1>Find your next <span>role.</span></h1><p>Every role lists its terms up front. No listing is a promise of employment, income, or selection.</p></div><div className="market-layout"><div className="market-main"><div className="search-panel"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search roles, organizations, or games</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, organization, or game" /></label><label className="select-field"><span className="sr-only">Filter by role category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label><span className="result-count">{filtered.length} open roles</span></div>{selected ? <ListingDetail listing={selected} apply={(item, shared) => apply(item, shared)} applied={applications.some((a) => a.listingId === selected.id)} onBack={() => onSelect(null)} onReport={onReport} onBlock={() => setBlocked(blocked.includes(selected.org) ? blocked.filter((x) => x !== selected.org) : [...blocked, selected.org])} blocked={blocked.includes(selected.org)} age={age} onEditProfile={onEditProfile} onMessage={() => onMessageOrg(selected)} /> : <div className="listing-list">{filtered.length ? filtered.map((item) => <ListingCard key={item.id} item={item} onClick={() => onSelect(item)} selectOrg={() => go(`Org:${item.org}`)} />) : <div className="empty-state"><span>⌕</span><h2>No roles found</h2><p>Try another title, game, organization, or category.</p></div>}</div>}</div><aside className="market-sidebar"><div className="side-callout"><div className="eyebrow">CANDIDATE FIRST</div><h2>Your profile stays yours.</h2><p>Candidate discovery is off by default. You choose what each organization can see.</p><button className="button button-outline full-width" onClick={() => go('My profile')}>Profile &amp; visibility</button><button className="text-link" onClick={() => go('Messages')}>Open your inbox <span className="button-arrow" aria-hidden="true">↗</span></button></div><div className="safety-mini"><span>◇</span><div><strong>Take a closer look.</strong><p>Never pay an application fee. Verify organizations independently.</p><button onClick={() => go('Trust & safety')}>Safety checklist <span className="button-arrow" aria-hidden="true">↗</span></button></div></div></aside></div></section> }
function ListingCard({ item, onClick, selectOrg }: { item: Listing; onClick: () => void; selectOrg: () => void }) { return <article className="listing-card"><div className="listing-card-main"><div className="org-mark">{item.mark}</div><div className="listing-content"><button className="listing-meta org-link" onClick={selectOrg}>{item.org}</button><span className="meta-dot"> · </span><span className="listing-meta">{item.game}</span><button className="listing-title-button" onClick={onClick}><h2>{item.title}</h2></button><div className="listing-tags"><span>{item.category}</span><span>{item.engagement}</span><span>{item.location}</span><span className="age-tag">{agePolicyFor(item.game).minAge}+</span></div><div className="listing-pay"><span>SALARY</span><strong>{item.salary}</strong></div></div><button aria-label={`View ${item.title} details`} className="listing-arrow" onClick={onClick}><span className="button-arrow" aria-hidden="true">↗</span></button></div><div className="listing-bottom"><span>{item.openings} opening{item.openings === 1 ? '' : 's'} · Posted {item.posted}</span><button onClick={onClick}>View details</button></div></article> }
function ListingDetail({ listing: item, apply, applied, onBack, onReport, onBlock, blocked, age, onEditProfile, onMessage }: { listing: Listing; apply: (x: Listing, shared: string[]) => void; applied: boolean; onBack: () => void; onReport: () => void; onBlock: () => void; blocked: boolean; age: number | null; onEditProfile: () => void; onMessage: () => void }) { const [share, setShare] = useState({ name: true, role: true, skills: false, portfolio: false }); const policy = agePolicyFor(item.game); const eligible = age !== null && age >= policy.minAge; const underAge = age !== null && age < policy.minAge; return <article className="listing-detail"><button className="back-link" onClick={onBack}>← Back to roles</button><div className="detail-title-row"><div className="org-mark large-mark">{item.mark}</div><div><div className="listing-meta">{item.org} <span>·</span> {item.game}</div><h2>{item.title}</h2><div className="listing-tags"><span>{item.category}</span><span>{item.engagement}</span><span>{item.location}</span><span className="age-tag">{policy.minAge}+</span></div></div></div><div className="detail-highlight"><div><span>SALARY</span><strong>{item.salary}</strong></div><div><span>EXPECTED TIME</span><strong>{item.hours}</strong></div><div><span>OPENINGS</span><strong>{item.openings}</strong></div></div><p className="detail-description">{item.description}</p><p className="pay-note">Pay is set by the organization. Confirm currency, schedule, and contract terms in writing before you accept.</p><DetailSection title="What you’ll do">{item.responsibilities}</DetailSection><DetailSection title="Experience & skills">{item.experience} · {item.skills}</DetailSection><DetailSection title="Schedule & eligibility">{item.schedule} · {item.eligibility}</DetailSection><DetailSection title="Pay terms">{item.payTerms}</DetailSection><DetailSection title="Application / tryout process">{item.process}</DetailSection><DetailSection title="Listing dates">Posted {item.posted} · Expires {item.expires}</DetailSection><div className="warning-box"><strong>Before you apply</strong><p>Never pay to apply, buy equipment from a recruiter, or share financial credentials or sensitive documents. Confirm terms independently.</p></div><fieldset className="share-choice"><legend>Choose what to share with this application</legend>{Object.entries({ name: 'Display / chosen name', role: 'Desired role', skills: 'Skills and experience', portfolio: 'Portfolio links' }).map(([key, label]) => <label key={key}><input type="checkbox" checked={share[key as keyof typeof share]} onChange={(e) => setShare({ ...share, [key]: e.target.checked })} />{label}</label>)}</fieldset><div className="detail-actions"><button className="button button-red" disabled={applied || !eligible} onClick={() => apply(item, Object.entries(share).filter(([, checked]) => checked).map(([key]) => key === 'name' ? 'Display name' : key === 'role' ? 'Desired role' : key === 'skills' ? 'Skills and experience' : 'Portfolio links'))}>{applied ? 'Application sent' : !eligible ? `${policy.minAge}+ required` : 'Apply through platform'} <span className="button-arrow" aria-hidden="true">↗</span></button><button className="button button-outline" onClick={onMessage}>Message organization</button><button className="text-link" onClick={onReport}>Report listing</button><button className="text-link danger-link" onClick={onBlock}>{blocked ? 'Unblock organization' : 'Block organization'}</button></div><p className="age-requirement"><strong>{policy.minAge}+</strong> under {policy.game} rules. {policy.note} {policy.source ? <a href={policy.source} target="_blank" rel="noreferrer">Official rules ↗</a> : null}</p>{underAge && <p className="age-blocked">Your saved age ({age}) is below the {policy.minAge}+ minimum for {policy.game}. <button type="button" className="text-link" onClick={onEditProfile}>Update your age</button></p>}{age === null && <p className="age-blocked">Add your age to your profile before applying. <button type="button" className="text-link" onClick={onEditProfile}>Open profile</button></p>}<p className="demo-small">You can withdraw an application at any time.</p></article> }
function DetailSection({ title, children }: { title: string; children: ReactNode }) { return <div className="detail-section"><h3>{title}</h3><p>{children}</p></div> }
function SectionSwitch({ active, onSelect }: { active: 'orgs' | 'players'; onSelect: (view: 'orgs' | 'players') => void }) {
  return <div className="section-switch" role="tablist" aria-label="Choose which side of the marketplace to browse">
    <button type="button" role="tab" aria-selected={active === 'players'} className={active === 'players' ? 'switch-tab active' : 'switch-tab'} onClick={() => onSelect('players')}>
      <span className="switch-tab-icon" aria-hidden="true">◎</span>
      <span className="switch-tab-copy"><strong>Players looking for an org</strong><small>Players who opted into discovery</small></span>
      <span className="switch-tab-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" role="tab" aria-selected={active === 'orgs'} className={active === 'orgs' ? 'switch-tab active' : 'switch-tab'} onClick={() => onSelect('orgs')}>
      <span className="switch-tab-icon" aria-hidden="true">◈</span>
      <span className="switch-tab-copy"><strong>Orgs looking for players</strong><small>Open roles, trials, and staff</small></span>
      <span className="switch-tab-arrow" aria-hidden="true">↗</span>
    </button>
  </div>
}
function PlayersPage({ players: roster, onMessage, go }: { players: Player[]; onMessage: (player: Player) => void; go: (page: string) => void }) {
  const [query, setQuery] = useState('')
  const [game, setGame] = useState('All games')
  const games = ['All games', ...new Set(roster.map((player) => player.game))]
  const visible = roster.filter((player) => `${player.name} ${player.game} ${player.role} ${player.rank} ${player.region}`.toLowerCase().includes(query.toLowerCase()) && (game === 'All games' || player.game === game))
  return <section className="page-wrap wrap">
    <SectionSwitch active="players" onSelect={(view) => { if (view !== 'players') go('Marketplace') }} />
    <div className="page-heading"><div className="eyebrow">PLAYERS LOOKING FOR AN ORG</div><h1>Players open<br /><span>to offers.</span></h1><p>Every player here chose to be discoverable and picked the fields shown. Minimum ages follow each game’s competition rules, not one platform-wide number.</p></div><div className="age-strip"><span><strong>13+</strong> Rocket League · Fortnite</span><span><strong>16+</strong> Apex · CS2</span><span><strong>17+</strong> Overwatch · League</span><span><strong>18+</strong> Warzone · VALORANT · R6</span></div>
    <div className="search-panel"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search players, games, or roles</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Player, game, role, or region" /></label><label className="select-field"><span className="sr-only">Filter by game</span><select value={game} onChange={(event) => setGame(event.target.value)}>{games.map((option) => <option key={option}>{option}</option>)}</select></label><span className="result-count">{visible.length} player{visible.length === 1 ? '' : 's'}</span></div>
    {visible.length ? <div className="player-grid">{visible.map((player) => <PlayerCard key={player.id} player={player} onMessage={() => onMessage(player)} />)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><h2>No players found</h2><p>Try another name, game, role, or region.</p></div>}
    <div className="privacy-note"><strong>Opt-in only.</strong><p>Player cards appear here only when discovery is on. Contact stays inside the platform so both sides keep a record of what was agreed. Salary asks are self-reported by each player; org offers are set by the organization.</p><button className="text-link" onClick={() => go('Trust & safety')}>Read the age rules <span className="button-arrow" aria-hidden="true">↗</span></button></div>
  </section>
}
function PlayerCard({ player, onMessage }: { player: Player; onMessage: () => void }) {
  const policy = agePolicyFor(player.game)
  const eligible = player.age >= policy.minAge
  return <article className="player-card">
    <div className="player-head"><div className="org-mark">{player.mark}</div><div className="player-identity"><h2>{player.name}</h2><span>@{player.handle}</span></div><span className="player-age">{player.age} yrs</span></div>
    <div className="listing-tags"><span>{player.game}</span><span>{player.role}</span><span>{player.rank}</span></div>
    <div className="player-pay"><span>SALARY ASK</span><strong>{player.expecting}</strong></div>
    <p className="player-blurb">{player.blurb}</p>
    <div className="player-facts"><div><span>REGION</span><strong>{player.region}</strong></div><div><span>AVAILABILITY</span><strong>{player.availability}</strong></div><div><span>LOOKING FOR</span><strong>{player.lookingFor}</strong></div><div><span>LANGUAGES</span><strong>{player.languages}</strong></div></div>
    <div className={eligible ? 'player-age-rule ok' : 'player-age-rule blocked'}><span className="age-tag">{policy.minAge}+</span><span>{eligible ? policy.game + ' minimum met' : 'Below the ' + policy.game + ' minimum'}{eligible && player.age < 18 ? ' · guardian consent required' : ''}</span></div>
    <div className="player-actions"><button className="button button-red button-small" disabled={!eligible} onClick={onMessage}>Message player</button>{policy.source && <a className="text-link" href={policy.source} target="_blank" rel="noreferrer">Age rules ↗</a>}</div>
  </article>
}
function ConversationList({ conversations, activeId, setActiveId, side, label }: { conversations: Conversation[]; activeId: string | null; setActiveId: (id: string) => void; side: 'org' | 'player'; label: string }) {
  return <div className="thread-list" aria-label={label}>{conversations.map((conversation) => {
    const last = lastMessage(conversation)
    const awaiting = last && last.from !== side
    return <button type="button" key={conversation.id} className={conversation.id === activeId ? 'thread-item active' : 'thread-item'} onClick={() => setActiveId(conversation.id)}>
      <span className="org-mark small-mark" aria-hidden="true">{side === 'player' ? conversation.orgMark : conversation.playerMark}</span>
      <span className="thread-item-copy"><strong>{side === 'player' ? conversation.org : conversation.playerName}</strong><small>{conversation.subject}</small><em>{last ? last.body : 'No messages yet'}</em></span>
      {awaiting && <span className="thread-dot" aria-hidden="true" />}
    </button>
  })}</div>
}
function MessageThread({ conversation, side, onSend, onBack }: { conversation: Conversation; side: 'org' | 'player'; onSend: (id: string, body: string) => void; onBack?: () => void }) {
  const [draft, setDraft] = useState('')
  const peer = side === 'player' ? conversation.org : conversation.playerName
  function submit() {
    const body = draft.trim()
    if (!body) return
    onSend(conversation.id, body)
    setDraft('')
  }
  return <div className="thread-panel">
    <div className="thread-head">{onBack && <button type="button" className="back-link" onClick={onBack}>← Inbox</button>}<div className="thread-peer"><span className="org-mark">{side === 'player' ? conversation.orgMark : conversation.playerMark}</span><div><h2>{peer}</h2><span>{conversation.subject}</span></div></div></div>
    <div className="thread-body" role="log" aria-label={`Conversation with ${peer}`}>{conversation.messages.map((message) => <div key={message.id} className={message.from === side ? 'bubble mine' : 'bubble theirs'}><p>{message.body}</p><span>{message.at}</span></div>)}</div>
    <div className="thread-composer"><label className="sr-only" htmlFor="thread-draft">Message</label><textarea id="thread-draft" rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder={`Message ${peer}…`} /><button type="button" className="button button-red" disabled={!draft.trim()} onClick={submit}>Send <span className="button-arrow" aria-hidden="true">↗</span></button></div>
    <p className="thread-safety">Keep conversations on the platform. Never share passwords, payment details, or identity documents.</p>
  </div>
}
function MessagesPage({ conversations, activeId, setActiveId, onSend, go }: { conversations: Conversation[]; activeId: string | null; setActiveId: (id: string) => void; onSend: (id: string, body: string) => void; go: (page: string) => void }) {
  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]
  return <section className="page-wrap wrap">
    <div className="page-heading"><div className="eyebrow">MESSAGES / DIRECT</div><h1>Talk it<br /><span>through.</span></h1><p>Conversations with organizations stay tied to a role or a player profile, so both sides keep a record of what was discussed.</p></div>
    {conversations.length && active ? <div className="messages-layout"><ConversationList conversations={conversations} activeId={active.id} setActiveId={setActiveId} side="player" label="Your conversations" /><MessageThread key={active.id} conversation={active} side="player" onSend={onSend} /></div> : <div className="empty-state"><span aria-hidden="true">✉</span><h2>No conversations yet</h2><p>Open a role and choose “Message organization” to start one.</p><button className="button button-red" onClick={() => go('Marketplace')}>Browse roles <span className="button-arrow" aria-hidden="true">↗</span></button></div>}
    <div className="privacy-note"><strong>Safety in writing.</strong><p>Ask about pay, hours, and guardianship in the thread. Keep the record, and report pressure or requests for money.</p><button className="text-link" onClick={() => go('Trust & safety')}>How to spot a bad offer <span className="button-arrow" aria-hidden="true">↗</span></button></div>
  </section>
}
function OrganizationsPage({ go, selectOrg }: { go: (x: string) => void; selectOrg: (name: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">ORGANIZATIONS / DIRECTORY</div><h1>Meet the teams<br /><span>behind the roles.</span></h1><p>Organization profiles, their public details, and the roles they have open.</p></div><div className="org-directory">{orgs.map((org) => <article className="org-directory-card" key={org.name}><div className="org-directory-top"><div className="org-mark large-mark">{org.mark}</div></div><h2>{org.name}</h2><p>{org.summary}</p><div className="org-facts"><span>{org.location}</span><span>{org.focus}</span><span>{org.listings} open roles</span></div><button className="text-link" onClick={() => selectOrg(org.name)}>View public organization page <span className="button-arrow" aria-hidden="true">↗</span></button></article>)}</div><div className="privacy-note"><strong>No candidate profiles are indexed here.</strong><p>Public organization and role pages only. Candidate discovery is opt-in and controlled by each candidate.</p><button className="text-link" onClick={() => go('Trust & safety')}>Read trust &amp; safety guidance <span className="button-arrow" aria-hidden="true">↗</span></button></div></section> }
function PublicOrganization({ name, go, onSelect }: { name: string; go: (x: string) => void; onSelect: (listing: Listing | null) => void }) { const org = orgs.find((item) => item.name === name); const orgListings = listings.filter((item) => item.org === name); if (!org) return null; return <section className="page-wrap wrap"><button className="back-link" onClick={() => go('Organizations')}>← All organizations</button><div className="public-org-head"><div className="org-mark large-mark">{org.mark}</div><div><div className="eyebrow">ORGANIZATION PROFILE</div><h1>{org.name}</h1><p>{org.location} · {org.focus}</p></div></div><p className="public-org-summary">{org.summary}</p><div className="org-disclaimer">Details are supplied by the organization. Confirm compensation, hours, and who you are dealing with through independent channels before accepting a role.</div><h2 className="org-listing-heading">Open roles</h2><div className="listing-list">{orgListings.map((item) => <ListingCard key={item.id} item={item} onClick={() => onSelect(item)} selectOrg={() => {}} />)}</div><button className="text-link" onClick={() => go('Trust & safety')}>How to evaluate opportunities <span className="button-arrow" aria-hidden="true">↗</span></button></section> }
function OrganizationPage({ applications, updateStatus, onNotice, profileName, conversations, activeId, setActiveId, onSend }: { applications: Application[]; updateStatus: (id: string, status: string) => void; onNotice: (text: string) => void; profileName: string; conversations: Conversation[]; activeId: string | null; setActiveId: (id: string) => void; onSend: (id: string, body: string) => void }) { const orgApplications = applications.filter((app) => ['1', '4'].includes(app.listingId)); const activeThread = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]; return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">ORGANIZATION WORKSPACE</div><h1>Build your team.<br /><span>Responsibly.</span></h1><p>Set expectations up front. Treat applicants with respect. Keep all communication and decisions within a safe, accountable process.</p></div><div className="org-dashboard"><div className="dashboard-head"><div className="org-mark large-mark">N</div><div><div className="eyebrow">ORGANIZATION</div><h2>Northstar Esports</h2><p>Community esports organization · Remote · Americas</p></div></div><div className="dashboard-stats"><div><strong>2</strong><span>Open listings</span></div><div><strong>{orgApplications.length}</strong><span>Applications</span></div><div><strong>0</strong><span>Recruiters invited</span></div></div><div className="inbox-heading"><div><div className="eyebrow">MESSAGES</div><h3>Player conversations</h3></div><div className="header-actions"><button className="button button-outline" onClick={() => onNotice('Bulk messaging is rate-limited by design.')}>Message settings</button></div></div>{conversations.length && activeThread ? <div className="messages-layout compact"><ConversationList conversations={conversations} activeId={activeThread.id} setActiveId={setActiveId} side="org" label="Conversations with players" /><MessageThread key={activeThread.id} conversation={activeThread} side="org" onSend={onSend} /></div> : <div className="empty-state"><h3>No conversations yet</h3><p>Message a player from the players directory to start one.</p></div>}<div className="inbox-heading"><div><div className="eyebrow">APPLICATION INBOX</div><h3>Candidate applications</h3></div><div className="header-actions"><button className="button button-outline" onClick={() => onNotice('Listing management is not connected yet.')}>Manage listings</button><button className="button button-outline" onClick={() => onNotice('Recruiter invitations are not connected yet.')}>Invite recruiter</button></div></div><div className="inbox-notice">Applications are scoped to this organization and the recruiters assigned to it.</div>{orgApplications.map((app) => { const role = listings.find((x) => x.id === app.listingId); return <div className="application-row" key={app.listingId}><div className="candidate-avatar">A</div><div className="applicant-details"><strong>{profileName || 'Candidate'}</strong><span>{role?.title ?? 'Role'} · Shared: {app.shared.join(', ')}</span></div><label className="status-select">Application status<select value={app.status} onChange={(e) => updateStatus(app.listingId, e.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label></div> })}{!orgApplications.length && <div className="empty-state"><h3>No applications yet</h3><p>When someone applies to one of your listings, the application appears here.</p></div>}</div><div className="launch-callout"><strong>Before accepting applicants</strong><span>Establish recruiter permissions, written compensation terms, listing expiry, response timelines, and a clear report/escalation process.</span></div></section> }
function ProfilePage({ name, setName, visible, setVisible, onNotice, age, setAge, onOpenTrust }: { name: string; setName: (x: string) => void; visible: boolean; setVisible: (x: boolean) => void; onNotice: (x: string) => void; age: number | null; setAge: (x: number | null) => void; onOpenTrust: () => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">CANDIDATE PROFILE</div><h1>Your path.<br /><span>Your terms.</span></h1><p>Candidate profiles are private by default. Share only the information you choose with each application.</p></div><div className="profile-layout"><div className="profile-form card-panel"><div className="panel-top"><div><div className="eyebrow">YOUR CANDIDATE PROFILE</div><h2>Build your profile</h2></div><span className="private-chip">🔒 Private by default</span></div><div className="form-grid"><label className="form-field span-2">Display name / chosen name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. chosen name" /></label><label className="form-field">Region<input placeholder="e.g. North America" /></label><label className="form-field">Time zone<input placeholder="e.g. UTC−5" /></label><label className="form-field span-2">Languages<input placeholder="e.g. English, Spanish" /></label><label className="form-field span-2">Desired roles<input placeholder="e.g. Analyst, player, editor" /></label><label className="form-field span-2">Games / content areas<input placeholder="e.g. VALORANT, FPS analysis" /></label><label className="form-field span-2">Skills<textarea rows={3} placeholder="Skills you'd like to highlight" /></label><label className="form-field">Experience<select defaultValue=""><option value="" disabled>Select experience</option><option>Learning / aspiring</option><option>Some team or project experience</option><option>Experienced</option></select></label><label className="form-field">Availability<input placeholder="e.g. 5 hrs/week" /></label><label className="form-field span-2">Portfolio links<input placeholder="https://… (optional)" /></label><label className="form-field span-2">Optional gaming handles / achievements<input placeholder="Only add public handles you choose to share" /></label><label className="form-field">Compensation expectations<input placeholder="Optional; explain clearly" /></label><label className="form-field">Age<input type="number" min={13} max={99} value={age ?? ''} onChange={(event) => setAge(event.target.value ? Number(event.target.value) : null)} placeholder="e.g. 17" /></label></div><div className="visibility-control"><div><strong>Allow candidate discovery</strong><span>Off by default. Real discovery should be limited to authenticated, approved organizations.</span></div><button role="switch" aria-checked={visible} aria-label="Allow candidate discovery" className={visible ? 'switch on' : 'switch'} onClick={() => setVisible(!visible)}><span /></button></div><p className="age-profile-note">Your age decides which games you can be signed for. Rocket League 13+, Apex 16+, Overwatch 17+, VALORANT and Warzone 18+. Under 18 also needs guardian consent. <button type="button" className="text-link" onClick={onOpenTrust}>See every game</button></p><div className="form-actions"><button className="button button-red" onClick={() => onNotice(age === null ? 'Add your age so we can match you with eligible games.' : 'Profile saved. Only the details you choose are shared with an application.')}>Save profile</button><button className="text-link" onClick={() => onNotice('Profile export is not available yet.')}>Export my data</button><button className="text-link danger-link" onClick={() => { setName(''); setVisible(false); onNotice('Profile cleared.') }}>Delete profile</button></div><p className="demo-small">Share only what you are comfortable showing an organization. Never enter identity documents, home address, or financial details.</p><div className="form-actions"><button className="text-link danger-link" onClick={() => onNotice('Account deletion is not available in the app yet.')}>Delete account</button><button className="text-link" onClick={() => onNotice('Data export is not available yet.')}>Request data export</button></div></div><aside className="profile-sidebar"><div className="side-callout"><span className="feature-icon">◇</span><h3>You decide what travels.</h3><p>Review every field before sharing it with a specific application. Never share sensitive data just to prove your worth.</p></div><button className="button button-outline full-width" onClick={() => onNotice('Support and appeals are not connected yet.')}>Contact support / appeal</button></aside></div></section> }
function ApplicationsPage({ applications, updateStatus, onNotice }: { applications: Application[]; updateStatus: (id: string, status: string) => void; onNotice: (x: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">YOUR APPLICATIONS</div><h1>Your <span>applications.</span></h1><p>Track progress and withdraw whenever you choose.</p></div><div className="applications-panel card-panel">{applications.length ? applications.map((app) => { const role = listings.find((x) => x.id === app.listingId); return <div className="application-row candidate-app" key={app.listingId}><div className="org-mark">{role?.mark}</div><div className="applicant-details"><strong>{role?.title ?? 'Role'}</strong><span>{role?.org} · Shared: {app.shared.join(', ')}</span></div><div className="candidate-status"><span className={`status-label ${app.status.toLowerCase().replace(' ', '-')}`}>{app.status}</span>{app.status !== 'Withdrawn' && <button className="text-link danger-link" onClick={() => { updateStatus(app.listingId, 'Withdrawn'); onNotice('Application withdrawn.') }}>Withdraw</button>}</div></div> }) : <div className="empty-state"><span className="button-arrow" aria-hidden="true">↗</span><h2>No applications yet</h2><p>When you apply to a role, your status will appear here.</p></div>}</div><div className="privacy-note"><strong>Application privacy</strong><p>Choose the information you share per role. In production, applications are visible only to authorized recruiters for that listing’s organization.</p></div></section> }
function TrustPage({ onReport, onModeration }: { onReport: () => void; onModeration: () => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">SAFETY IS A SHARED PRACTICE</div><h1>Stay sharp.<br /><span>Stay in control.</span></h1><p>Verification can’t eliminate risk. No opportunity is worth compromising your safety or privacy.</p></div><div className="trust-grid"><article className="trust-card"><span className="trust-number">01</span><h2>Check the opportunity</h2><p>Look for a clear role, defined hours, location, and written compensation terms. Verify the organization through independent channels—not only a badge or listing.</p></article><article className="trust-card"><span className="trust-number">02</span><h2>Keep control of your data</h2><p>Never provide passwords, financial credentials, identity documents, exact birth dates, or home address for a recruitment application. Share only what you choose.</p></article><article className="trust-card"><span className="trust-number">03</span><h2>Never pay to apply</h2><p>VAYNTR Talent does not charge candidates to create profiles or apply. Be wary of application fees, required purchases, and pay-to-play promises.</p></article><article className="trust-card"><span className="trust-number">04</span><h2>Know the age boundary</h2><p>Minimum ages come from each scene’s competition rules, not from us. Rocket League starts at 13, Apex at 16, Overwatch at 17, WARZONE and VALORANT at 18. Anyone under 18 needs a guardian’s consent to be signed.</p></article></div><section className="age-policy" aria-labelledby="age-policy-title"><div className="age-policy-head"><div className="eyebrow">AGE &amp; ELIGIBILITY</div><h2 id="age-policy-title">Every scene sets<br />its own floor.</h2><p>We check each listing against the rules published by the competition. Where a rulebook sets a higher age—or a country does—the higher number applies. Guardian consent is required for every player under 18, and an organization signing a minor also needs a guardian’s signature.</p></div><div className="age-grid">{gameAgePolicies.map((policy) => <div className="age-row" key={policy.game}><div className="age-row-copy"><h3>{policy.game}</h3><p>{policy.note}</p></div><span className="age-number">{policy.minAge}+</span>{policy.source ? <a href={policy.source} target="_blank" rel="noreferrer">Rules ↗</a> : null}</div>)}</div><p className="age-policy-note">Checked against published competition rules in October 2026. Organizers can apply stricter limits to a specific qualifier or event. This is guidance, not legal advice.</p></section><div className="report-panel"><div><div className="eyebrow">SEE SOMETHING WRONG?</div><h2>Report it. Block it. Get help.</h2><p>Reports go to the moderation queue with the listing or account you were viewing. Include only what you are comfortable sharing.</p></div><div className="report-buttons"><button className="button button-red" onClick={onReport}>Report a listing or account</button><a href="mailto:support@vayntr.example" className="button button-outline">Contact support</a></div></div><div className="trust-footnote"><strong>Organization checked is not identity checked.</strong><p>Any future verification label must state the exact organization records checked and when. It must never imply that every role or individual is safe, legitimate, or endorsed by VAYNTR.</p><button className="text-link" onClick={onModeration}>Moderator review dashboard <span className="button-arrow" aria-hidden="true">↗</span></button></div></section> }
function ModerationPage({ onNotice, onReport }: { onNotice: (x: string) => void; onReport: () => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">STAFF AREA</div><h1>Review with care.<br /><span>Act with context.</span></h1><p>Review reports, assign cases, and record why a decision was made.</p></div><div className="moderation-warning"><strong>Staff only.</strong><span>Access must be role-limited, case-bound, audited, and prevent unnecessary exposure to private application or profile data.</span></div><div className="mod-case-list"><article className="mod-case"><div><span className="case-tag">REPORT · LISTING</span><h2>Compensation or process concern</h2><p>Awaiting moderator review.</p></div><span className="status-label">Needs review</span><div className="mod-case-actions"><button className="button button-outline" onClick={() => onNotice('Case assigned.')}>Assign case</button><button className="button button-outline" onClick={() => onNotice('Content removal recorded.')}>Remove content</button><button className="text-link" onClick={() => onNotice('Appeal received.')}>View appeal</button></div></article><article className="mod-case"><div><span className="case-tag">REPORT · ACCOUNT</span><h2>Potential unsolicited contact</h2><p>Escalated for safeguarding review.</p></div><span className="status-label in-review">Escalate</span><div className="mod-case-actions"><button className="button button-outline" onClick={() => onNotice('Escalation recorded.')}>Escalate safely</button><button className="button button-outline" onClick={onReport}>Open report flow</button></div></article></div><div className="trust-footnote"><strong>Moderation ownership must be assigned before launch.</strong><p>Define staffed hours, urgent-risk escalation, response times, evidence handling, retention, user notification, appeals, and audit review.</p></div></section> }
function ResourcesPage() { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">FIELD NOTES / PUBLIC EDUCATION</div><h1>Play with purpose.<br /><span>Create with intent.</span></h1><p>Practical starting points, not shortcuts. Evidence and platform guidance do not promise skill, career, audience, or income outcomes.</p></div><div className="resource-date">REVIEWED OCTOBER 22, 2026 · SOURCES LINKED BELOW EACH GUIDE</div><div className="guide-grid"><article className="guide-card"><div className="guide-visual guide-red"><span>01</span><span>REPLAY / REFLECT / REPEAT</span></div><div className="guide-body"><span className="guide-tag">COMPETITIVE DEVELOPMENT · ALL LEVELS</span><h2>A useful VOD review starts with a question.</h2><p>Pick one moment, not an entire match. Describe the situation, what you noticed, and one alternative you could try next time. Keep the review specific to the game and role.</p><h3>A simple review loop</h3><ol><li>Choose a moment tied to a goal.</li><li>Write what happened without judging yourself.</li><li>Ask what information was available at the time.</li><li>Pick one small adjustment to test in a future session.</li></ol><p className="guide-caveat">This is a reflective routine, not a proven guarantee of improvement. A small qualitative study of League of Legends players reported VOD review and focused goals as perceived training practices; it does not prove causation or apply to every game.</p><a href="https://journals.humankinetics.com/view/journals/jege/1/1/article-jege.2022-0011.xml" target="_blank" rel="noreferrer">Abbott, Watson &amp; Birch (2022), Journal of Electronic Gaming and Esports ↗</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7447068/" target="_blank" rel="noreferrer">Nagorsky &amp; Wiemeyer (2020), PLOS ONE ↗</a><a href="https://www.nzesports.org.nz/knowledge-base/how-to-effectively-train-in-esports/" target="_blank" rel="noreferrer">NZ Esports Federation: How to Effectively Train in Esports (updated Apr 4, 2025) ↗</a></div></article><article className="guide-card"><div className="guide-visual guide-dark"><span>02</span><span>PLAN / PUBLISH / LEARN</span></div><div className="guide-body"><span className="guide-tag">CREATOR WORKFLOW · ALL PLATFORMS</span><h2>Build a publishing rhythm you can sustain.</h2><p>Start with the time you actually have. Plan a small set of ideas, choose formats that fit your workflow, then review what you learned—not just the view count.</p><h3>Try this planning checklist</h3><ol><li>Write down one audience question you can address.</li><li>Draft a clear opening that matches the content.</li><li>Choose a format and a realistic schedule.</li><li>After publishing, review audience feedback and platform analytics as context—not a prediction.</li></ol><p className="guide-caveat">Platform documentation describes tools and metrics; it cannot tell you why every viewer behaved a certain way or guarantee future reach, income, or growth. Review date: October 22, 2026.</p><a href="https://www.youtube.com/creators/grow/optimize-your-content/" target="_blank" rel="noreferrer">YouTube for Creators: Optimize &amp; evolve your content ↗</a><a href="https://support.google.com/youtube/answer/9314415?hl=en&amp;co=GENIE.Platform%3DDesktop" target="_blank" rel="noreferrer">YouTube Help: Measure key moments for audience retention ↗</a></div></article></div><div className="future-resources"><strong>Other areas to explore</strong><span>Tactical shooters · Battle royale · MOBAs · Fighting games · RTS · Sports · Racing · Card games · YouTube · TikTok · Twitch · Instagram Reels</span><p>Future guides should be reviewed for accuracy, dated, sourced, and tailored to platform and game changes.</p></div></section> }
function FeedbackWidget({ onNotice, open, setOpen }: { onNotice: (message: string) => void; open: boolean; setOpen: (open: boolean) => void }) {
  const [kind, setKind] = useState('')
  const [details, setDetails] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [setOpen])
  function submitFeedback() {
    setSent(true)
    onNotice('Feedback received. Thank you.')
  }
  function startOver() {
    setSent(false)
    setKind('')
    setDetails('')
  }
  return <aside className="feedback-widget">
    {open && <section className="feedback-panel" role="dialog" aria-labelledby="feedback-title">
      <div className="feedback-panel-heading">
        <div><div className="eyebrow">QUICK FEEDBACK</div><h2 id="feedback-title">Help us improve.</h2></div>
        <button type="button" className="feedback-close" aria-label="Close feedback" onClick={() => setOpen(false)}>×</button>
      </div>
      {sent ? <div className="feedback-success"><span className="feedback-success-mark" aria-hidden="true">✓</span><h3>Got it. Thank you.</h3><p>Your note is attached to this page and goes to the product team.</p><div className="feedback-success-actions"><button type="button" className="button button-outline" onClick={startOver}>Send another</button><button type="button" className="button button-red" onClick={() => { setOpen(false); startOver() }}>Close</button></div></div> : <>
      <p className="feedback-prompt">What would you like us to know about VAYNTR Talent?</p>
      <div className="feedback-options" role="group" aria-label="Feedback type">
        <button type="button" aria-pressed={kind === 'Looks good'} className={kind === 'Looks good' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Looks good')}><span aria-hidden="true"><Check size={15} strokeWidth={2.4} /></span><span>Looks good</span></button>
        <button type="button" aria-pressed={kind === 'Something feels off'} className={kind === 'Something feels off' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Something feels off')}><span aria-hidden="true"><CircleAlert size={15} strokeWidth={2.1} /></span><span>Something feels off</span></button>
        <button type="button" aria-pressed={kind === 'Feature idea'} className={kind === 'Feature idea' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Feature idea')}><span aria-hidden="true"><Plus size={15} strokeWidth={2.4} /></span><span>Feature idea</span></button>
      </div>
      <label className="feedback-details"><span className="feedback-label">Details <em>(optional)</em></span>
        <textarea aria-label="Optional details" maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share a suggestion or describe what could be better. Please don't include private or sensitive information." rows={3} />
      </label>
      <button type="button" className="button button-red feedback-submit" disabled={!kind && !details.trim()} onClick={submitFeedback}>Submit feedback <span className="button-arrow" aria-hidden="true">↗</span></button>
      </>}
    </section>}
    <button type="button" className={open ? 'feedback-launch is-open' : 'feedback-launch'} aria-expanded={open} aria-haspopup="dialog" aria-label={open ? 'Close feedback panel' : 'Open feedback panel'} onClick={() => setOpen(!open)}><span className="feedback-launch-icon" aria-hidden="true">{open ? '×' : '✳'}</span><span>{open ? 'Close' : 'Feedback'}</span></button>
  </aside>
}
function ReportDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (reason: string) => void }) { const [reason, setReason] = useState('Misleading or suspicious listing'); const [description, setDescription] = useState(''); return <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="dialog-close" onClick={onClose} aria-label="Close report dialog">×</button><div className="eyebrow">REPORT</div><h2 id="report-title">Help us understand.</h2><p>Reports are reviewed by moderators. Include only what you are comfortable sharing.</p><label className="form-field">What are you reporting?<select value={reason} onChange={(e) => setReason(e.target.value)}><option>Misleading or suspicious listing</option><option>Request for fees or purchases</option><option>Harassment or unsafe contact</option><option>Privacy or personal data concern</option><option>Other concern</option></select></label><label className="form-field">Details (do not include sensitive personal information)<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the concern" /></label><div className="dialog-actions"><button className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-red" onClick={() => onSubmit(reason)}>Submit report</button></div><p className="demo-small">Need urgent help? Use an appropriate local emergency or safeguarding service.</p></section></div> }
export default App
