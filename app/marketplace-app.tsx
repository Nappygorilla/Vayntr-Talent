'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
type Listing = {
  id: string; title: string; org: string; mark: string; category: string; game: string; openings: number
  engagement: string; compensation: string; hours: string; schedule: string; location: string; eligibility: string
  experience: string; skills: string; responsibilities: string; process: string; posted: string; expires: string; description: string
}
type Application = { listingId: string; status: string; shared: string[] }
const orgs = [
  { name: 'Northstar Esports', mark: 'N', location: 'Remote · Americas', focus: 'VALORANT · Rocket League', summary: 'Community esports organization focused on structured, respectful competition.', listings: 2 },
  { name: 'PixelForge Studio', mark: 'P', location: 'Remote · Worldwide', focus: 'Gaming & creator content', summary: 'A small creator production team looking for thoughtful collaborators.', listings: 1 },
  { name: 'Arcadia Collective', mark: 'A', location: 'Remote · Europe / Africa', focus: 'Multi-game community · Fighting games', summary: 'An independent community project supporting events and creator work.', listings: 2 },
]
const listings: Listing[] = [
  { id: '1', title: 'Valorant Controller Player', org: 'Northstar Esports', mark: 'N', category: 'Player', game: 'VALORANT', openings: 1, engagement: 'Trial', compensation: 'Unpaid trial; compensation discussed before any paid engagement', hours: '8–12 hrs/week', schedule: 'Evenings, UTC−5 to UTC−3', location: 'Remote · Americas', eligibility: 'Adults 18+ for marketplace participation; reliable internet in Americas', experience: 'Competitive team experience preferred', skills: 'Controller agent pool, clear comms, review mindset', responsibilities: 'Attend scheduled scrims, communicate availability, review match VODs with the team.', process: 'Platform application → team review → mutually agreed trial details. No purchase or fee required.', posted: 'Oct 18, 2026', expires: 'Nov 17, 2026', description: 'Looking for a dependable controller player who enjoys structured practice and constructive communication. Share only the profile details you choose.' },
  { id: '2', title: 'Short-form Video Editor', org: 'PixelForge Studio', mark: 'P', category: 'Editor', game: 'Gaming & creator content', openings: 2, engagement: 'Freelance', compensation: 'Paid · $25–35 USD / hour', hours: '4–8 hrs/week', schedule: 'Flexible; async', location: 'Remote · Worldwide', eligibility: 'Adults 18+; able to invoice in your region', experience: 'Portfolio demonstrating short-form edits', skills: 'Premiere Pro or DaVinci Resolve, captions, pacing', responsibilities: 'Edit supplied gameplay and creator footage into vertical short videos; deliver project files.', process: 'Platform application with portfolio → paid test edit with agreed scope and rate.', posted: 'Oct 20, 2026', expires: 'Nov 19, 2026', description: 'Small creator team looking for an editor to help package existing long-form footage into vertical clips. No guaranteed volume; test work is paid.' },
  { id: '3', title: 'Community & Social Coordinator', org: 'Arcadia Collective', mark: 'A', category: 'Community/social', game: 'Multi-game community', openings: 1, engagement: 'Contract', compensation: 'Paid · $400–600 USD / month', hours: '6 hrs/week', schedule: 'Flexible; weekly sync', location: 'Remote · Europe / Africa', eligibility: 'Adults 18+; Europe/Africa time zones', experience: 'Community moderation or social publishing experience', skills: 'Clear writing, conflict de-escalation, scheduling', responsibilities: 'Help plan community posts, maintain event calendar, escalate safety concerns to owner.', process: 'Platform application → structured conversation on platform → written scope.', posted: 'Oct 21, 2026', expires: 'Nov 20, 2026', description: 'A small community project seeking a thoughtful coordinator. This is a defined part-time contract; exact deliverables are agreed before work begins.' },
  { id: '4', title: 'Rocket League Analyst', org: 'Northstar Esports', mark: 'N', category: 'Analyst', game: 'Rocket League', openings: 1, engagement: 'Volunteer', compensation: 'Volunteer · unpaid', hours: '3–5 hrs/week', schedule: 'Weekends, UTC−5 to UTC−3', location: 'Remote · Americas', eligibility: 'Adults 18+ for marketplace participation; Americas', experience: 'Experience reviewing competitive matches', skills: 'Replay analysis, concise written feedback, rotation fundamentals', responsibilities: 'Review agreed match replays, identify a small number of actionable patterns.', process: 'Platform application → sample analysis discussion. No fees, purchases, or guaranteed future paid role.', posted: 'Oct 16, 2026', expires: 'Nov 15, 2026', description: 'Volunteer community development role with clear hours and scope. Please apply only if unpaid work fits your circumstances.' },
  { id: '5', title: 'Creator & Caster', org: 'Arcadia Collective', mark: 'A', category: 'Caster', game: 'Fighting games', openings: 1, engagement: 'Freelance', compensation: 'Commission-based · written terms before work', hours: 'Event-based, 2–4 hrs/event', schedule: 'Some weekends', location: 'Remote · Worldwide', eligibility: 'Adults 18+; spoken English', experience: 'Portfolio or recordings welcome', skills: 'Live commentary, accurate game knowledge, collaboration', responsibilities: 'Cast selected online community events and deliver recordings for review.', process: 'Platform application → discuss rates, commission basis, rights and schedule before accepting.', posted: 'Oct 19, 2026', expires: 'Nov 18, 2026', description: 'Community event casting opportunity. Commission is not guaranteed; ask for the event economics and written terms before deciding.' },
]
const statusOptions = ['Received', 'In review', 'Interview', 'Not selected', 'Withdrawn']

const commandActions = [
  { page: 'Home', label: 'Home', description: 'Return to the landing page', keywords: 'start landing overview', icon: '⌂' },
  { page: 'Marketplace', label: 'Marketplace', description: 'Search sample roles and opportunities', keywords: 'jobs roles listings search', icon: '⌕' },
  { page: 'Organizations', label: 'Organizations', description: 'Browse the sample organization directory', keywords: 'teams companies directory', icon: '◈' },
  { page: 'Resources', label: 'Resources', description: 'Open competitive and creator guides', keywords: 'guides articles learning', icon: '↗' },
  { page: 'Trust & safety', label: 'Trust & safety', description: 'Review safety guidance and reporting', keywords: 'privacy report safe support', icon: '◇' },
  { page: 'For organizations', label: 'For organizations', description: 'View the organization workspace demo', keywords: 'recruiters inbox dashboard', icon: '▤' },
  { page: 'My profile', label: 'My profile', description: 'Edit your local demo profile', keywords: 'candidate settings visibility', icon: '◎' },
  { page: 'Applications', label: 'Applications', description: 'Review and withdraw demo applications', keywords: 'candidate status withdraw', icon: '↳' },
  { page: 'Moderation', label: 'Moderator dashboard', description: 'View the moderation interface mockup', keywords: 'staff reports cases', icon: '▦' },
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
  const [visible, setVisible] = useState(false)
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
    setNotice(`Demo application recorded for ${item.title}. This is local sample state only; no organization was contacted.`)
  }
  function updateStatus(id: string, status: string) { setApplications(applications.map((app) => app.listingId === id ? { ...app, status } : app)) }
  function showNotice(text: string) { setNotice(text); window.setTimeout(() => setNotice(''), 5000) }
  const pages = ['Marketplace', 'Organizations', 'Resources', 'Trust & safety', 'For organizations', 'My profile', 'Applications']
  return <div className="app-shell">
    <div className="demo-strip"><span className="demo-pulse" /> DEMO ENVIRONMENT <span className="strip-copy">Sample listings and local-only interactions · Not connected to an account or database</span></div>
    <header className="header">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); go('Home') }} aria-label="VAYNTR Talent home"><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 28 28" focusable="false"><path d="M4 4 L14 24 L24 4" /><circle cx="23.5" cy="23.5" r="1.8" /></svg></span><span className="brand-text">VAYNTR<span>TALENT</span></span></a>
      <button className="menu-button" aria-label="Toggle navigation" aria-expanded={mobileMenu} aria-controls="primary-nav" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
      <nav id="primary-nav" className={mobileMenu ? 'nav open' : 'nav'} aria-label="Main navigation">{pages.slice(0, 4).map((item) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => go(item)}>{item}</button>)}</nav>
      <button className="command-trigger" type="button" aria-label="Open quick navigation (Ctrl or Command plus K)" aria-keyshortcuts="Control+K Meta+K" onClick={() => { setCommandQuery(''); setCommandSelection(0); setCommandOpen(true) }}><span className="command-trigger-icon" aria-hidden="true">⌕</span><span className="command-trigger-label">Quick jump</span><kbd>Ctrl K</kbd></button>
      <div className="header-actions"><button className="signin" onClick={() => go('My profile')}>Sign in <span className="demo-tag">DEMO</span></button><button className="button button-red button-small" onClick={() => go('Marketplace')}>Explore roles <span className="button-arrow" aria-hidden="true">↗</span></button></div>
    </header>
    {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
    {commandOpen && <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false) }}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><h2 id="command-title" className="sr-only">Quick navigation</h2><div className="command-search-row"><span className="command-search-icon" aria-hidden="true">⌕</span><input autoFocus aria-label="Search pages and actions" role="combobox" aria-controls="quick-nav-results" aria-expanded="true" value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandSelection(0) }} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setCommandSelection((current) => matchingCommands.length ? (current + 1) % matchingCommands.length : 0) } else if (event.key === 'ArrowUp') { event.preventDefault(); setCommandSelection((current) => matchingCommands.length ? (current - 1 + matchingCommands.length) % matchingCommands.length : 0) } else if (event.key === 'Enter') { event.preventDefault(); const action = matchingCommands[commandSelection]; if (action) go(action.page) } }} placeholder="Jump to a page or workspace…" /><kbd className="command-escape">ESC</kbd></div><div id="quick-nav-results" className="command-results" role="listbox" aria-label="Navigation results">{matchingCommands.map((action, index) => <button key={action.page} id={`quick-nav-option-${index}`} type="button" role="option" aria-selected={index === commandSelection} className={index === commandSelection ? 'command-option selected' : 'command-option'} onMouseEnter={() => setCommandSelection(index)} onClick={() => go(action.page)}><span className="command-option-icon" aria-hidden="true">{action.icon}</span><span className="command-option-copy"><strong>{action.label}</strong><small>{action.description}</small></span><kbd>↵</kbd></button>)}</div>{matchingCommands.length === 0 && <div className="command-empty">No matching page. Try a shorter search.</div>}<div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Move</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div></section></div>}
    {page === 'Home' && <HomePage go={go} />}
    {page === 'Marketplace' && <Marketplace query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} filtered={filtered} onSelect={setSelected} selected={selected} apply={apply} applications={applications} onReport={() => setReportOpen(true)} blocked={blocked} setBlocked={setBlocked} go={go} />}
    {page === 'Organizations' && <OrganizationsPage go={go} selectOrg={(name) => { setSelectedOrg(name); setPage('Organization detail') }} />}
    {page === 'Organization detail' && selectedOrg && <PublicOrganization name={selectedOrg} go={go} onSelect={(listing) => { setSelected(listing); setPage('Marketplace') }} />}
    {page === 'For organizations' && <OrganizationPage onNotice={showNotice} applications={applications} updateStatus={updateStatus} profileName={profileName} />}
    {page === 'My profile' && <ProfilePage name={profileName} setName={setProfileName} visible={visible} setVisible={setVisible} onNotice={showNotice} />}
    {page === 'Applications' && <ApplicationsPage applications={applications} updateStatus={updateStatus} onNotice={showNotice} />}
    {page === 'Trust & safety' && <TrustPage onReport={() => setReportOpen(true)} onModeration={() => go('Moderation')} />}
    {page === 'Moderation' && <ModerationPage onNotice={showNotice} onReport={() => setReportOpen(true)} />}
    {page === 'Resources' && <ResourcesPage />}
    
    <footer className="footer"><div className="footer-main"><div><a className="brand footer-brand" href="#home" onClick={(event) => { event.preventDefault(); go('Home') }}><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 28 28" focusable="false"><path d="M4 4 L14 24 L24 4" /><circle cx="23.5" cy="23.5" r="1.8" /></svg></span><span className="brand-text">VAYNTR<span>TALENT</span></span></a><p className="footer-tagline">Find your next team. Build with care.</p></div><div className="footer-nav"><button onClick={() => go('Marketplace')}>Marketplace</button><button onClick={() => go('Organizations')}>Organizations</button><button onClick={() => go('Resources')}>Resources</button><button onClick={() => go('Trust & safety')}>Trust &amp; safety</button><button onClick={() => go('For organizations')}>For organizations</button><button onClick={() => go('My profile')}>My profile</button><button onClick={() => go('Applications')}>Applications</button></div><div className="footer-contact"><strong>Need help?</strong><a href="mailto:support@vayntr.example">Contact support</a><span>Demo contact: replace before launch</span></div></div><div className="footer-bottom"><span>© 2026 VAYNTR Talent · Demo build</span><span>Recruitment is not guaranteed. Evaluate every opportunity carefully.</span><button onClick={() => go('Trust & safety')}>Privacy &amp; safety</button></div></footer>
    {reportOpen && <ReportDialog onClose={() => setReportOpen(false)} onSubmit={(reason) => { setReportOpen(false); showNotice(`Demo report submitted (${reason}). No real moderation queue is connected.`) }} />}
    <FeedbackWidget onNotice={showNotice} open={feedbackOpen} setOpen={setFeedbackOpen} />
  </div>
}
function HomePage({ go }: { go: (page: string) => void }) {
  return <>
    <main className="home-page">
      <section className="home-stage">
        <div className="wrap home-stage-inner">
          <div className="home-stage-topline">
            <span><i /> VAYNTR / TALENT NETWORK</span>
            <span>OPEN INDEX — 001</span>
          </div>
          <div className="home-stage-body">
            <div className="home-stage-index" aria-hidden="true">01 / PLAYERS<br />02 / CREATORS<br />03 / TEAMS</div>
            <svg className="home-stage-v" viewBox="0 0 600 500" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="home-v-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff606a" />
                  <stop offset="52%" stopColor="#d91f2c" />
                  <stop offset="100%" stopColor="#68101a" />
                </linearGradient>
              </defs>
              <path d="M70 70 H210 L300 300 L390 70 H530 L338 430 H262 Z" fill="url(#home-v-gradient)" />
              <path d="M133 96 H188 L300 370 L412 96 H467" fill="none" stroke="#ff8b92" strokeWidth="7" strokeOpacity=".48" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="home-stage-kicker">FOR THE PEOPLE BEHIND THE NEXT GREAT PLAY</p>
            <h1>Find your<br /><span>next move.</span></h1>
            <div className="home-stage-lower">
              <div className="home-stage-explain">
                <span>PLAY / CREATE / CONNECT</span>
                <p>Meet the right people, discover opportunities with clear expectations, and build what comes next — on the player side, the creator side, or behind the scenes.</p>
              </div>
              <div className="home-stage-actions">
                <button className="button button-red" onClick={() => go('Marketplace')}>Explore opportunities <span className="button-arrow" aria-hidden="true">↗</span></button>
                <button className="button button-outline" onClick={() => go('For organizations')}>For organizations</button>
              </div>
            </div>
          </div>
          <div className="home-stage-baseline">
            <span><b>01</b> LOOK AROUND FIRST</span>
            <span><b>02</b> CHECK THE DETAILS</span>
            <span><b>03</b> CHOOSE YOUR NEXT STEP</span>
          </div>
        </div>
      </section>

      <section className="home-lanes">
        <div className="wrap">
          <div className="home-lanes-heading">
            <div>
              <div className="eyebrow">START FROM YOUR SIDE OF THE GAME</div>
              <h2>Different paths.<br /><span>Shared ambition.</span></h2>
            </div>
            <p>There is more to gaming than a leaderboard. Find a place for your skill, your craft, or your team.</p>
          </div>
          <div className="home-lane-list">
            <button className="home-lane" onClick={() => go('Marketplace')}>
              <span className="home-lane-number">01</span>
              <span className="home-lane-copy"><strong>Players</strong><small>Find a roster, trial, or competitive support role.</small></span>
              <i aria-hidden="true">↗</i>
            </button>
            <button className="home-lane" onClick={() => go('Resources')}>
              <span className="home-lane-number">02</span>
              <span className="home-lane-copy"><strong>Creators</strong><small>Connect your craft to editors, producers, and new work.</small></span>
              <i aria-hidden="true">↗</i>
            </button>
            <button className="home-lane" onClick={() => go('For organizations')}>
              <span className="home-lane-number">03</span>
              <span className="home-lane-copy"><strong>Teams &amp; operators</strong><small>Explore collaborators and learn what good briefs include.</small></span>
              <i aria-hidden="true">↗</i>
            </button>
          </div>
        </div>
      </section>

      <section className="home-openings">
        <div className="wrap">
          <div className="home-section-top">
            <div>
              <div className="eyebrow">THE OPEN INDEX / SAMPLE DATA</div>
              <h2>Find the work.<br /><span>Know the terms.</span></h2>
            </div>
            <p>These are illustrative listings for the demo. Every role should explain its scope, schedule, and compensation before you commit.</p>
          </div>
          <div className="home-opening-list">
            {listings.slice(0, 4).map((item, index) => <button className="home-opening-row" key={item.id} onClick={() => go('Marketplace')}>
              <span className="home-opening-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="home-opening-main"><span className="home-opening-org">{item.org} <i> / </i> {item.game}</span><strong>{item.title}</strong><span className="home-opening-sub">{item.category} <i>·</i> {item.engagement} <i>·</i> {item.location}</span></span>
              <span className="home-opening-pay">{item.compensation}</span>
              <span className="home-opening-arrow" aria-hidden="true">↗</span>
            </button>)}
          </div>
          <div className="home-opening-footer"><span>DEMO LISTINGS · SAMPLE DATA ONLY</span><button className="text-link" onClick={() => go('Marketplace')}>Browse all sample roles <span className="button-arrow" aria-hidden="true">↗</span></button></div>
        </div>
      </section>

      <section className="home-process">
        <div className="wrap home-process-inner">
          <div className="home-process-heading">
            <div>
              <div className="eyebrow">A BETTER WAY TO BEGIN</div>
              <h2>Big goals need<br /><span>good information.</span></h2>
            </div>
            <p>No hype, pressure, or mystery terms. Take time to understand the opportunity and decide whether it fits the work you want to do.</p>
          </div>
          <div className="home-process-steps">
            <article className="home-process-step"><span>01</span><div><h3>Find your lane.</h3><p>Start with roles, teams, and creator opportunities that match what you want to build.</p></div><i aria-hidden="true">↗</i></article>
            <article className="home-process-step"><span>02</span><div><h3>Read the full brief.</h3><p>Look for responsibilities, hours, compensation, rights, and who is making the offer.</p></div><i aria-hidden="true">↗</i></article>
            <article className="home-process-step"><span>03</span><div><h3>Make the call yourself.</h3><p>Share only what you choose, ask questions, and walk away from terms that do not work for you.</p></div><i aria-hidden="true">✓</i></article>
          </div>
          <button className="text-link home-process-link" onClick={() => go('Trust & safety')}>Read the trust &amp; safety guide <span className="button-arrow" aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section className="home-field-notes">
        <div className="wrap">
          <div className="home-field-header">
            <div>
              <div className="eyebrow">FIELD NOTES / THE WORK BETWEEN THE HIGHLIGHTS</div>
              <h2>Better questions.<br /><span>Stronger moves.</span></h2>
            </div>
            <p>Practical starting points for improving, publishing, and working together — without promises of overnight success.</p>
          </div>
          <div className="home-notes-list">
            <button className="home-note-row" onClick={() => go('Resources')}><span>PLAYER NOTE / 001</span><strong>Review the round, not just the result.</strong><small>A practical VOD review starting point for players and teams.</small><i aria-hidden="true">↗</i></button>
            <button className="home-note-row" onClick={() => go('Resources')}><span>CREATOR NOTE / 002</span><strong>Build a format you can sustain.</strong><small>Turn an idea into a repeatable, realistic publishing workflow.</small><i aria-hidden="true">↗</i></button>
            <button className="home-note-row" onClick={() => go('Trust & safety')}><span>SAFETY NOTE / 003</span><strong>Look beyond the pitch.</strong><small>Questions to ask before trusting a team, deal, or opportunity.</small><i aria-hidden="true">↗</i></button>
          </div>
          <div className="home-notes-footer"><span>LEARN BEFORE YOU LEAP.</span><button className="text-link" onClick={() => go('Resources')}>All resources <span className="button-arrow" aria-hidden="true">↗</span></button></div>
        </div>
      </section>

      <section className="home-finale">
        <div className="home-finale-art" aria-hidden="true">V<span>.</span></div>
        <div className="wrap home-finale-inner">
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>Make the<br /><span>next move.</span></h2>
          <div className="home-finale-bottom"><p>Start by looking around. A good opportunity should make sense before you share a thing.</p><button className="button button-red" onClick={() => go('Marketplace')}>Explore opportunities <span className="button-arrow" aria-hidden="true">↗</span></button></div>
        </div>
      </section>
    </main>
  </>
}
function Marketplace({ query, setQuery, category, setCategory, categories, filtered, onSelect, selected, apply, applications, onReport, blocked, setBlocked, go }: { query: string; setQuery: (x: string) => void; category: string; setCategory: (x: string) => void; categories: string[]; filtered: Listing[]; selected: Listing | null; onSelect: (x: Listing | null) => void; apply: (x: Listing, shared: string[]) => void; applications: Application[]; onReport: () => void; blocked: string[]; setBlocked: (x: string[]) => void; go: (x: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">OPPORTUNITIES / DEMO LISTINGS</div><h1>Find your next <span>role.</span></h1><p>Explore sample listings with clear terms. No listing is a promise of employment, income, or selection.</p></div><div className="market-layout"><div className="market-main"><div className="search-panel"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search roles, organizations, or games</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, organization, or game" /></label><label className="select-field"><span className="sr-only">Filter by role category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label><span className="result-count">{filtered.length} sample roles</span></div>{selected ? <ListingDetail listing={selected} apply={(item, shared) => apply(item, shared)} applied={applications.some((a) => a.listingId === selected.id)} onBack={() => onSelect(null)} onReport={onReport} onBlock={() => setBlocked(blocked.includes(selected.org) ? blocked.filter((x) => x !== selected.org) : [...blocked, selected.org])} blocked={blocked.includes(selected.org)} /> : <div className="listing-list">{filtered.length ? filtered.map((item) => <ListingCard key={item.id} item={item} onClick={() => onSelect(item)} selectOrg={() => go(`Org:${item.org}`)} />) : <div className="empty-state"><span>⌕</span><h2>No roles found</h2><p>Try another title, game, organization, or category.</p></div>}</div>}</div><aside className="market-sidebar"><div className="side-callout"><div className="eyebrow">CANDIDATE FIRST</div><h2>Your profile stays yours.</h2><p>Candidate discovery is off by default. In this demo, all candidate features use local sample state only.</p><button className="button button-outline full-width" onClick={() => go('My profile')}>Profile &amp; visibility</button></div><div className="safety-mini"><span>◇</span><div><strong>Take a closer look.</strong><p>Never pay an application fee. Verify organizations independently.</p><button onClick={() => go('Trust & safety')}>Safety checklist <span className="button-arrow" aria-hidden="true">↗</span></button></div></div></aside></div></section> }
function ListingCard({ item, onClick, selectOrg }: { item: Listing; onClick: () => void; selectOrg: () => void }) { return <article className="listing-card"><div className="listing-card-main"><div className="org-mark">{item.mark}</div><div className="listing-content"><button className="listing-meta org-link" onClick={selectOrg}>{item.org}</button><span className="meta-dot"> · </span><span className="listing-meta">{item.game}</span><button className="listing-title-button" onClick={onClick}><h2>{item.title}</h2></button><div className="listing-tags"><span>{item.category}</span><span>{item.engagement}</span><span>{item.location}</span></div><div className="listing-pay">{item.compensation}</div></div><button aria-label={`View ${item.title} details`} className="listing-arrow" onClick={onClick}><span className="button-arrow" aria-hidden="true">↗</span></button></div><div className="listing-bottom"><span>{item.openings} opening{item.openings === 1 ? '' : 's'} · Posted {item.posted}</span><button onClick={onClick}>View details</button></div></article> }
function ListingDetail({ listing: item, apply, applied, onBack, onReport, onBlock, blocked }: { listing: Listing; apply: (x: Listing, shared: string[]) => void; applied: boolean; onBack: () => void; onReport: () => void; onBlock: () => void; blocked: boolean }) { const [share, setShare] = useState({ name: true, role: true, skills: false, portfolio: false }); return <article className="listing-detail"><button className="back-link" onClick={onBack}>← Back to roles</button><div className="detail-title-row"><div className="org-mark large-mark">{item.mark}</div><div><div className="listing-meta">{item.org} <span>·</span> {item.game}</div><h2>{item.title}</h2><div className="listing-tags"><span>{item.category}</span><span>{item.engagement}</span><span>{item.location}</span></div></div></div><div className="detail-highlight"><div><span>COMPENSATION</span><strong>{item.compensation}</strong></div><div><span>EXPECTED TIME</span><strong>{item.hours}</strong></div><div><span>OPENINGS</span><strong>{item.openings}</strong></div></div><p className="detail-description">{item.description}</p><DetailSection title="What you’ll do">{item.responsibilities}</DetailSection><DetailSection title="Experience & skills">{item.experience} · {item.skills}</DetailSection><DetailSection title="Schedule & eligibility">{item.schedule} · {item.eligibility}</DetailSection><DetailSection title="Application / tryout process">{item.process}</DetailSection><DetailSection title="Listing dates">Posted {item.posted} · Expires {item.expires}</DetailSection><div className="warning-box"><strong>Before you apply</strong><p>Never pay to apply, buy equipment from a recruiter, or share financial credentials or sensitive documents. Confirm terms independently.</p></div><fieldset className="share-choice"><legend>Choose what to share with this application</legend>{Object.entries({ name: 'Display / chosen name', role: 'Desired role', skills: 'Skills and experience', portfolio: 'Portfolio links' }).map(([key, label]) => <label key={key}><input type="checkbox" checked={share[key as keyof typeof share]} onChange={(e) => setShare({ ...share, [key]: e.target.checked })} />{label}</label>)}</fieldset><div className="detail-actions"><button className="button button-red" disabled={applied} onClick={() => apply(item, Object.entries(share).filter(([, checked]) => checked).map(([key]) => key === 'name' ? 'Display name' : key === 'role' ? 'Desired role' : key === 'skills' ? 'Skills and experience' : 'Portfolio links'))}>{applied ? 'Applied in demo' : 'Apply through platform'} <span className="button-arrow" aria-hidden="true">↗</span></button><button className="text-link" onClick={onReport}>Report listing</button><button className="text-link danger-link" onClick={onBlock}>{blocked ? 'Unblock organization' : 'Block organization'}</button></div><p className="demo-small">Demo interaction only. No organization is contacted and no real application is stored.</p></article> }
function DetailSection({ title, children }: { title: string; children: ReactNode }) { return <div className="detail-section"><h3>{title}</h3><p>{children}</p></div> }
function OrganizationsPage({ go, selectOrg }: { go: (x: string) => void; selectOrg: (name: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">ORGANIZATIONS / SAMPLE DIRECTORY</div><h1>Meet the teams<br /><span>behind the roles.</span></h1><p>Public demo pages. These fictional organizations are examples only, not verified businesses or endorsements.</p></div><div className="org-directory">{orgs.map((org) => <article className="org-directory-card" key={org.name}><div className="org-directory-top"><div className="org-mark large-mark">{org.mark}</div><span className="sample-label">SAMPLE ONLY</span></div><h2>{org.name}</h2><p>{org.summary}</p><div className="org-facts"><span>{org.location}</span><span>{org.focus}</span><span>{org.listings} demo listings</span></div><button className="text-link" onClick={() => selectOrg(org.name)}>View public organization page <span className="button-arrow" aria-hidden="true">↗</span></button></article>)}</div><div className="privacy-note"><strong>No candidate profiles are indexed here.</strong><p>Public organization and role pages only. Candidate discovery is opt-in in the intended product and is not available in this demo.</p><button className="text-link" onClick={() => go('Trust & safety')}>Read trust &amp; safety guidance <span className="button-arrow" aria-hidden="true">↗</span></button></div></section> }
function PublicOrganization({ name, go, onSelect }: { name: string; go: (x: string) => void; onSelect: (listing: Listing | null) => void }) { const org = orgs.find((item) => item.name === name); const orgListings = listings.filter((item) => item.org === name); if (!org) return null; return <section className="page-wrap wrap"><button className="back-link" onClick={() => go('Organizations')}>← All organizations</button><div className="public-org-head"><div className="org-mark large-mark">{org.mark}</div><div><div className="eyebrow">PUBLIC ORGANIZATION / DEMO</div><h1>{org.name}</h1><p>{org.location} · {org.focus}</p></div><span className="sample-label">SAMPLE ONLY · NOT VERIFIED</span></div><p className="public-org-summary">{org.summary}</p><div className="org-disclaimer">This fictional demo organization has not been checked. A real verification badge must explain the exact organization records checked and the date; verification does not verify individual identities, endorse a role, or guarantee safety.</div><h2 className="org-listing-heading">Open sample roles</h2><div className="listing-list">{orgListings.map((item) => <ListingCard key={item.id} item={item} onClick={() => onSelect(item)} selectOrg={() => {}} />)}</div><button className="text-link" onClick={() => go('Trust & safety')}>How to evaluate opportunities <span className="button-arrow" aria-hidden="true">↗</span></button></section> }
function OrganizationPage({ applications, updateStatus, onNotice, profileName }: { applications: Application[]; updateStatus: (id: string, status: string) => void; onNotice: (text: string) => void; profileName: string }) { const orgApplications = applications.filter((app) => ['1', '4'].includes(app.listingId)); return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">ORGANIZATION SPACE / DEMO</div><h1>Build your team.<br /><span>Responsibly.</span></h1><p>Set expectations up front. Treat applicants with respect. Keep all communication and decisions within a safe, accountable process.</p></div><div className="org-dashboard"><div className="dashboard-head"><div className="org-mark large-mark">N</div><div><div className="eyebrow">SAMPLE ORGANIZATION</div><h2>Northstar Esports</h2><p>Community esports organization · Remote · Americas</p></div><span className="status-pill">Organization checked*</span></div><p className="org-disclaimer">*Demo-only label. No verification has been performed. In a real product, the page must state precisely what records were checked; this would not verify individuals, guarantee role safety, or represent VAYNTR endorsement.</p><div className="dashboard-stats"><div><strong>2</strong><span>Sample listings</span></div><div><strong>{orgApplications.length}</strong><span>Demo applications</span></div><div><strong>0</strong><span>Recruiters invited</span></div></div><div className="inbox-heading"><div><div className="eyebrow">APPLICATION INBOX</div><h3>Candidate applications</h3></div><div className="header-actions"><button className="button button-outline" onClick={() => onNotice('Listing creation/renewal is not connected in this demo.')}>Manage listings</button><button className="button button-outline" onClick={() => onNotice('Recruiter invitations are not connected in this demo.')}>Invite recruiter</button></div></div><div className="inbox-notice">This is a local demo inbox. Real organization scoping, authentication and audit logs are not configured.</div>{orgApplications.map((app) => { const role = listings.find((x) => x.id === app.listingId); return <div className="application-row" key={app.listingId}><div className="candidate-avatar">A</div><div className="applicant-details"><strong>{profileName || 'Sample candidate'}</strong><span>{role?.title ?? 'Sample role'} · Shared: {app.shared.join(', ')}</span></div><label className="status-select">Application status<select value={app.status} onChange={(e) => updateStatus(app.listingId, e.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label></div> })}{!orgApplications.length && <div className="empty-state"><h3>No applications yet</h3><p>When an application is submitted to this organization, it appears here in the demo.</p></div>}</div><div className="launch-callout"><strong>Before accepting applicants</strong><span>Establish recruiter permissions, written compensation terms, listing expiry, response timelines, and a clear report/escalation process.</span></div></section> }
function ProfilePage({ name, setName, visible, setVisible, onNotice }: { name: string; setName: (x: string) => void; visible: boolean; setVisible: (x: boolean) => void; onNotice: (x: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">CANDIDATE SPACE / DEMO</div><h1>Your path.<br /><span>Your terms.</span></h1><p>Candidate profiles are private by default. Share only the information you choose with each application.</p></div><div className="profile-layout"><div className="profile-form card-panel"><div className="panel-top"><div><div className="eyebrow">YOUR CANDIDATE PROFILE</div><h2>Build your profile</h2></div><span className="private-chip">🔒 Private by default</span></div><div className="form-grid"><label className="form-field span-2">Display name / chosen name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. chosen name" /></label><label className="form-field">Region<input placeholder="e.g. North America" /></label><label className="form-field">Time zone<input placeholder="e.g. UTC−5" /></label><label className="form-field span-2">Languages<input placeholder="e.g. English, Spanish" /></label><label className="form-field span-2">Desired roles<input placeholder="e.g. Analyst, player, editor" /></label><label className="form-field span-2">Games / content areas<input placeholder="e.g. VALORANT, FPS analysis" /></label><label className="form-field span-2">Skills<textarea rows={3} placeholder="Skills you'd like to highlight" /></label><label className="form-field">Experience<select defaultValue=""><option value="" disabled>Select experience</option><option>Learning / aspiring</option><option>Some team or project experience</option><option>Experienced</option></select></label><label className="form-field">Availability<input placeholder="e.g. 5 hrs/week" /></label><label className="form-field span-2">Portfolio links<input placeholder="https://… (optional)" /></label><label className="form-field span-2">Optional gaming handles / achievements<input placeholder="Only add public handles you choose to share" /></label><label className="form-field">Compensation expectations<input placeholder="Optional; explain clearly" /></label><label className="form-field">Age eligibility confirmation<select defaultValue=""><option value="" disabled>Marketplace is 18+ in this demo</option><option>I am 18 or older</option></select></label></div><div className="visibility-control"><div><strong>Allow candidate discovery</strong><span>Off by default. Real discovery should be limited to authenticated, approved organizations.</span></div><button role="switch" aria-checked={visible} aria-label="Allow candidate discovery" className={visible ? 'switch on' : 'switch'} onClick={() => setVisible(!visible)}><span /></button></div><div className="form-actions"><button className="button button-red" onClick={() => onNotice('Demo profile changes saved in page memory only. Do not enter sensitive details.')}>Save demo profile</button><button className="text-link" onClick={() => onNotice('Demo export: no server-side profile exists to export.')}>Export my data</button><button className="text-link danger-link" onClick={() => { setName(''); setVisible(false); onNotice('Demo profile cleared from this page state.') }}>Delete demo profile</button></div><p className="demo-small">Do not enter legal name, birth date, home address, personal contact, identity documents, or financial information.</p><div className="form-actions"><button className="text-link danger-link" onClick={() => onNotice('Demo account deletion: local page state only. Real deletion and retention are not implemented.')}>Delete account</button><button className="text-link" onClick={() => onNotice('Demo data export is empty. Server-side export is not implemented.')}>Request data export</button></div></div><aside className="profile-sidebar"><div className="side-callout"><span className="feature-icon">◇</span><h3>You decide what travels.</h3><p>Review every field before sharing it with a specific application. Never share sensitive data just to prove your worth.</p></div><button className="button button-outline full-width" onClick={() => onNotice('Support and appeals are demo placeholders; replace with staffed, monitored paths before launch.')}>Contact support / appeal</button></aside></div></section> }
function ApplicationsPage({ applications, updateStatus, onNotice }: { applications: Application[]; updateStatus: (id: string, status: string) => void; onNotice: (x: string) => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">CANDIDATE SPACE / DEMO</div><h1>Your <span>applications.</span></h1><p>Track progress and withdraw whenever you choose. Sample application state is not sent to an organization.</p></div><div className="applications-panel card-panel">{applications.length ? applications.map((app) => { const role = listings.find((x) => x.id === app.listingId); return <div className="application-row candidate-app" key={app.listingId}><div className="org-mark">{role?.mark}</div><div className="applicant-details"><strong>{role?.title ?? 'Sample role'}</strong><span>{role?.org} · Shared: {app.shared.join(', ')}</span></div><div className="candidate-status"><span className={`status-label ${app.status.toLowerCase().replace(' ', '-')}`}>{app.status}</span>{app.status !== 'Withdrawn' && <button className="text-link danger-link" onClick={() => { updateStatus(app.listingId, 'Withdrawn'); onNotice('Demo application withdrawn locally. The organization was not notified.') }}>Withdraw</button>}</div></div> }) : <div className="empty-state"><span className="button-arrow" aria-hidden="true">↗</span><h2>No applications yet</h2><p>When you apply to a role, your status will appear here.</p></div>}</div><div className="privacy-note"><strong>Application privacy</strong><p>Choose the information you share per role. In production, applications are visible only to authorized recruiters for that listing’s organization.</p></div></section> }
function TrustPage({ onReport, onModeration }: { onReport: () => void; onModeration: () => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">SAFETY IS A SHARED PRACTICE</div><h1>Stay sharp.<br /><span>Stay in control.</span></h1><p>Verification can’t eliminate risk. No opportunity is worth compromising your safety or privacy.</p></div><div className="trust-grid"><article className="trust-card"><span className="trust-number">01</span><h2>Check the opportunity</h2><p>Look for a clear role, defined hours, location, and written compensation terms. Verify the organization through independent channels—not only a badge or listing.</p></article><article className="trust-card"><span className="trust-number">02</span><h2>Keep control of your data</h2><p>Never provide passwords, financial credentials, identity documents, exact birth dates, or home address for a recruitment application. Share only what you choose.</p></article><article className="trust-card"><span className="trust-number">03</span><h2>Never pay to apply</h2><p>VAYNTR Talent does not charge candidates to create profiles or apply. Be wary of application fees, required purchases, and pay-to-play promises.</p></article><article className="trust-card"><span className="trust-number">04</span><h2>Know the age boundary</h2><p>This demo models an adults-only marketplace. Public educational pages may be read by everyone, but accounts and recruitment applications should not include minors until dedicated safeguards and review exist.</p></article></div><div className="report-panel"><div><div className="eyebrow">SEE SOMETHING WRONG?</div><h2>Report it. Block it. Get help.</h2><p>Use this demo report form to preview the flow. A real product needs a staffed moderation queue, audit trail, response targets, and appeals owner.</p></div><div className="report-buttons"><button className="button button-red" onClick={onReport}>Report a listing or account</button><a href="mailto:support@vayntr.example" className="button button-outline">Contact support</a></div></div><div className="trust-footnote"><strong>Organization checked is not identity checked.</strong><p>Any future verification label must state the exact organization records checked and when. It must never imply that every role or individual is safe, legitimate, or endorsed by VAYNTR.</p><button className="text-link" onClick={onModeration}>Moderator review dashboard (demo) <span className="button-arrow" aria-hidden="true">↗</span></button></div></section> }
function ModerationPage({ onNotice, onReport }: { onNotice: (x: string) => void; onReport: () => void }) { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">STAFF AREA / DEMO ONLY</div><h1>Review with care.<br /><span>Act with context.</span></h1><p>This non-authenticated mockup demonstrates intended moderation surfaces only. It is not a real case queue and grants no moderator access.</p></div><div className="moderation-warning"><strong>Restricted access is not configured.</strong><span>Production moderator access must be role-limited, case-bound, audited, and prevent unnecessary exposure to private application/profile data.</span></div><div className="mod-case-list"><article className="mod-case"><div><span className="case-tag">DEMO REPORT · LISTING</span><h2>Compensation or process concern</h2><p>Example report placeholder · no real user or listing implicated.</p></div><span className="status-label">Needs review</span><div className="mod-case-actions"><button className="button button-outline" onClick={() => onNotice('Demo case assigned. No moderation record was written.')}>Assign case</button><button className="button button-outline" onClick={() => onNotice('Demo removal action. No listing was removed.')}>Remove content</button><button className="text-link" onClick={() => onNotice('Appeal received: demo placeholder only.')}>View appeal</button></div></article><article className="mod-case"><div><span className="case-tag">DEMO REPORT · ACCOUNT</span><h2>Potential unsolicited contact</h2><p>Example report placeholder · do not treat as a live safeguarding incident.</p></div><span className="status-label in-review">Escalate</span><div className="mod-case-actions"><button className="button button-outline" onClick={() => onNotice('Escalation logged in local demo only.')}>Escalate safely</button><button className="button button-outline" onClick={onReport}>Open report flow</button></div></article></div><div className="trust-footnote"><strong>Moderation ownership must be assigned before launch.</strong><p>Define staffed hours, urgent-risk escalation, response times, evidence handling, retention, user notification, appeals, and audit review.</p></div></section> }
function ResourcesPage() { return <section className="page-wrap wrap"><div className="page-heading"><div className="eyebrow">FIELD NOTES / PUBLIC EDUCATION</div><h1>Play with purpose.<br /><span>Create with intent.</span></h1><p>Practical starting points, not shortcuts. Evidence and platform guidance do not promise skill, career, audience, or income outcomes.</p></div><div className="resource-date">REVIEWED OCTOBER 22, 2026 · SOURCES LINKED BELOW EACH GUIDE</div><div className="guide-grid"><article className="guide-card"><div className="guide-visual guide-red"><span>01</span><span>REPLAY / REFLECT / REPEAT</span></div><div className="guide-body"><span className="guide-tag">COMPETITIVE DEVELOPMENT · ALL LEVELS</span><h2>A useful VOD review starts with a question.</h2><p>Pick one moment, not an entire match. Describe the situation, what you noticed, and one alternative you could try next time. Keep the review specific to the game and role.</p><h3>A simple review loop</h3><ol><li>Choose a moment tied to a goal.</li><li>Write what happened without judging yourself.</li><li>Ask what information was available at the time.</li><li>Pick one small adjustment to test in a future session.</li></ol><p className="guide-caveat">This is a reflective routine, not a proven guarantee of improvement. A small qualitative study of League of Legends players reported VOD review and focused goals as perceived training practices; it does not prove causation or apply to every game.</p><a href="https://journals.humankinetics.com/view/journals/jege/1/1/article-jege.2022-0011.xml" target="_blank" rel="noreferrer">Abbott, Watson &amp; Birch (2022), Journal of Electronic Gaming and Esports ↗</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7447068/" target="_blank" rel="noreferrer">Nagorsky &amp; Wiemeyer (2020), PLOS ONE ↗</a><a href="https://www.nzesports.org.nz/knowledge-base/how-to-effectively-train-in-esports/" target="_blank" rel="noreferrer">NZ Esports Federation: How to Effectively Train in Esports (updated Apr 4, 2025) ↗</a></div></article><article className="guide-card"><div className="guide-visual guide-dark"><span>02</span><span>PLAN / PUBLISH / LEARN</span></div><div className="guide-body"><span className="guide-tag">CREATOR WORKFLOW · ALL PLATFORMS</span><h2>Build a publishing rhythm you can sustain.</h2><p>Start with the time you actually have. Plan a small set of ideas, choose formats that fit your workflow, then review what you learned—not just the view count.</p><h3>Try this planning checklist</h3><ol><li>Write down one audience question you can address.</li><li>Draft a clear opening that matches the content.</li><li>Choose a format and a realistic schedule.</li><li>After publishing, review audience feedback and platform analytics as context—not a prediction.</li></ol><p className="guide-caveat">Platform documentation describes tools and metrics; it cannot tell you why every viewer behaved a certain way or guarantee future reach, income, or growth. Review date: October 22, 2026.</p><a href="https://www.youtube.com/creators/grow/optimize-your-content/" target="_blank" rel="noreferrer">YouTube for Creators: Optimize &amp; evolve your content ↗</a><a href="https://support.google.com/youtube/answer/9314415?hl=en&amp;co=GENIE.Platform%3DDesktop" target="_blank" rel="noreferrer">YouTube Help: Measure key moments for audience retention ↗</a></div></article></div><div className="future-resources"><strong>Other areas to explore</strong><span>Tactical shooters · Battle royale · MOBAs · Fighting games · RTS · Sports · Racing · Card games · YouTube · TikTok · Twitch · Instagram Reels</span><p>Future guides should be reviewed for accuracy, dated, sourced, and tailored to platform and game changes.</p></div></section> }
function FeedbackWidget({ onNotice, open, setOpen }: { onNotice: (message: string) => void; open: boolean; setOpen: (open: boolean) => void }) {
  const [kind, setKind] = useState('')
  const [details, setDetails] = useState('')
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [setOpen])
  function submitFeedback() {
    setOpen(false)
    setKind('')
    setDetails('')
    onNotice('Thanks for the feedback. This demo did not send or save your response.')
  }
  return <aside className="feedback-widget">
    {open && <section className="feedback-panel" role="dialog" aria-labelledby="feedback-title">
      <div className="feedback-panel-heading">
        <div><div className="eyebrow">QUICK FEEDBACK</div><h2 id="feedback-title">Help us improve.</h2></div>
        <button type="button" className="feedback-close" aria-label="Close feedback" onClick={() => setOpen(false)}>×</button>
      </div>
      <p className="feedback-prompt">What would you like us to know about VAYNTR Talent?</p>
      <div className="feedback-options" role="group" aria-label="Feedback type">
        <button type="button" aria-pressed={kind === 'Looks good'} className={kind === 'Looks good' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Looks good')}><span aria-hidden="true">✓</span><span>Looks good</span></button>
        <button type="button" aria-pressed={kind === 'Something feels off'} className={kind === 'Something feels off' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Something feels off')}><span aria-hidden="true">!</span><span>Something feels off</span></button>
        <button type="button" aria-pressed={kind === 'Feature idea'} className={kind === 'Feature idea' ? 'feedback-option chosen' : 'feedback-option'} onClick={() => setKind('Feature idea')}><span aria-hidden="true">＋</span><span>Feature idea</span></button>
      </div>
      <label className="feedback-details">Details <span>(optional)</span>
        <textarea aria-label="Optional details" maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share a suggestion or describe what could be better. Please don't include private or sensitive information." rows={3} />
      </label>
      <div className="feedback-demo-note"><span aria-hidden="true">◇</span> Demo only — feedback isn't sent or saved.</div>
      <button type="button" className="button button-red feedback-submit" disabled={!kind && !details.trim()} onClick={submitFeedback}>Submit feedback <span className="button-arrow" aria-hidden="true">↗</span></button>
    </section>}
    <button type="button" className={open ? 'feedback-launch is-open' : 'feedback-launch'} aria-expanded={open} aria-haspopup="dialog" aria-label={open ? 'Close feedback panel' : 'Open feedback panel'} onClick={() => setOpen(!open)}><span className="feedback-launch-icon" aria-hidden="true">{open ? '×' : '✳'}</span><span>{open ? 'Close' : 'Feedback'}</span></button>
  </aside>
}
function ReportDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (reason: string) => void }) { const [reason, setReason] = useState('Misleading or suspicious listing'); const [description, setDescription] = useState(''); return <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="dialog-close" onClick={onClose} aria-label="Close report dialog">×</button><div className="eyebrow">REPORT / DEMO ONLY</div><h2 id="report-title">Help us understand.</h2><p>Reports should be handled by trained moderators. This demo does not send or store your report.</p><label className="form-field">What are you reporting?<select value={reason} onChange={(e) => setReason(e.target.value)}><option>Misleading or suspicious listing</option><option>Request for fees or purchases</option><option>Harassment or unsafe contact</option><option>Privacy or personal data concern</option><option>Other concern</option></select></label><label className="form-field">Details (do not include sensitive personal information)<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the concern" /></label><div className="dialog-actions"><button className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-red" onClick={() => onSubmit(reason)}>Submit demo report</button></div><p className="demo-small">Need urgent help? Use an appropriate local emergency or safeguarding service.</p></section></div> }
export default App
