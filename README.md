# VAYNTR Talent

A Next.js App Router + React + TypeScript frontend for a black-and-red esports and creator talent marketplace. Every organization, role, player and conversation is meant to come from the API: the app ships no seeded accounts, listings, messages or support address, so each surface renders an empty state until the backend is connected. The app can run as a standard Next.js server or export as a static site for GitHub Pages.

## Run locally

Node.js 22 or newer is recommended.

```sh
npm install
npm run dev
```

Build and checks:

```sh
npm run build
npm run lint
npm run test:e2e
```

## Deployment

- **GitHub Pages static export:** the Actions workflow sets `GITHUB_PAGES=true`, builds a static export into `out/`, and publishes that directory under `/Vayntr-Talent/`.
- **Server deployment:** omit `GITHUB_PAGES=true`, then use `npm run build` and `npm start` on a Next.js-capable host such as Render.
- Keep GitHub Pages' publishing source set to **GitHub Actions** for the static export workflow to own deployment.

## What this build includes

- Responsive public landing, role marketplace with search/category filters, listing detail, organization directory, player directory, messages, trust and safety page, and dated educational resources with source links.
- Two-sided marketplace: **players looking for an org** and **orgs looking for players**, each gated by that game's own competition age floor. Salary is stated on both sides — a player's ask and the organization's offer with its pay terms.
- **No invented records.** Organizations, roles, players and conversations are typed empty stores in the client until the API fills them. Empty states say plainly that nothing is loaded on this device instead of showing sample people or companies.
- **Free signup for everyone 13 and older**, with no invitation, approval queue or payment. A four-step flow asks first whether you are a player, a content creator or an esports organization, then account details, role-specific questions, and a consent step. Accounts exist on the device only until the API lands.
- Candidate profile form with private-by-default visibility toggle, per-application sharing summary, and sensitive-data warnings. Saves stay in page memory and reset on reload.
- Organization workspace requires a real organization account; a signed-in organization gets its own workspace header, and without one the page says so instead of rendering a mock dashboard.
- A US privacy notice covering what is collected, the no-sale/no-tracking position, retention, minors, and the access, correction, deletion, opt-out, limited-use, non-discrimination, authorized-agent and appeal rights of CCPA/CPRA and other state laws.
- Report dialog, feedback panel and moderator queue exist as UI. Their copy states that a report or note is saved on this device — it does not claim to have reached moderators or the product team.
- Reserved future ad inventory. **No ad network, ad scripts, tracking, sponsored placements, or ad targeting are installed.** Keep ads out of applications, private profiles, candidate data, and audience targeting. Establish audience age policy, consent and privacy reviews before any future advertising.
- Responsive semantic controls, labels, keyboard focus treatment, reduced-motion support, and empty states.

## Critical implementation limits

This is a **front-end-only build**, not a live or launch-ready recruitment marketplace:

- There is no authentication, server, database, account system, authorization, secure session, persistence, or organization membership. Candidate, organization, message and application state is held only in page memory. It resets on reload. The browser and UI do not enforce access controls; do not put real profile or application data into this demo.
- Apply, withdraw, reporting, blocking, status changes, exports/deletion, recruiter invites, moderation actions, appeals and support are not connected to a backend. They do not contact an organization, delete/export server records, alert a moderator, or create an audit trail, and the interface no longer suggests otherwise.
- No real organization or individual has been verified. A future verification label must state exact checks and dates; neither org nor identity verification guarantees role safety, legitimacy, or VAYNTR endorsement.
- **No support address is wired.** The "Contact support" control opens the feedback panel until a monitored support owner and escalation process are assigned.
- There are no real listings, testimonials, endorsements, users, or performance claims. Educational guidance is cautiously framed, reviewed October 22, 2026, and linked to its sources. Platform-specific guidance may change; re-review sources before launch.
- Age is a **launch decision**. Floor ages follow each scene's published competition rules (Rocket League, Fortnite and Street Fighter 13+; Apex, CS2 and EA SPORTS FC 16+; League of Legends and Overwatch 17+; VALORANT, Warzone, Rainbow Six and Tekken 18+), and a stored age gates applying and contacting. An age input is not robust age assurance.
- **Signup enforces a 13+ minimum** and refuses under-13 accounts, which is what COPPA requires without verifiable parental consent; organization accounts require an adult 18 or older. Ages 13–17 must supply a guardian email and a guardian consent checkbox, and their account is marked “guardian confirmation pending”. **No guardian email is sent yet**, so a production release needs verifiable parental or guardian consent delivery, contact protections, limited visibility and counsel review before minors can be onboarded at scale.
- Signup itself is not persistent: there is no server, so the password is checked and discarded (never stored in the browser), and the account resets on reload.
- Candidate discovery is off by default in the demo, but the form toggle is not a privacy boundary. A production system must only expose opted-in profiles to authenticated/approved organizations and let candidates turn discovery off promptly.
- Future listing forms must enforce all role, compensation, hours, location, eligibility, experience, responsibilities, application process, posting and expiry fields; prohibit fees, required purchases, misleading compensation and requests for credentials/sensitive documents. Applications must be initiated by the candidate and communicate through a controlled platform flow.

## Minimum production architecture

Before real use, implement a server-backed identity and persistent datastore selected for the actual hosting environment. Keep candidate profiles, applications, reports, memberships and moderation records server-side. Enforce authorization on every private route: candidate owns their records; recruiters can only access assigned listings and the corresponding organization's applications; owners administer only their organization; moderation is case-scoped and audited. Never trust client-supplied owner/user/org IDs. Scope database queries server-side, protect mutations against cross-origin requests, use private/no-store responses, and exclude private records from static HTML, search indexes, analytics, logs and ads. Keep secrets in a server-side secret store.

Implement per-application disclosure, controlled communications, block/report/moderation/removal/appeal, listing expiry, account export and deletion, retention schedules, and logs that avoid secrets and unnecessary sensitive data. Define incident response and response ownership. Core candidate profile/apply features must remain free; do not sell verification or consideration. Do not add payment or ads until separately reviewed and transparently disclosed.

## Launch gates (not passed)

1. Approve and document age scope, terms, privacy notice, prohibited conduct, support/escalation and moderation ownership.
2. Assign a monitored privacy contact and a request-handling process for access, correction, deletion, opt-out and appeal requests, and have counsel review the draft privacy notice.
3. Deliver real guardian confirmation by email before any under-18 account is activated.
4. Add authorization tests proving candidates cannot read another candidate's records and recruiters cannot read another organization's data.
5. Prove private content never appears in public HTML, search indexes, analytics, logs or ad systems.
6. Implement and test report, block, moderation, removal, appeal and support flows.
7. Define verification criteria, compensation disclosures, expiry and scam response.
8. Implement/test account export, deletion and record retention.
9. Keep candidate fees/pay-to-apply absent and label any future sponsored roles.
10. Test keyboard, screen-reader, mobile and accessibility for recruitment/application flows.
11. Run a limited pilot reviewed by candidates and organizations before broad rollout.

Do not describe this build as a real marketplace or publicly launch it until these gates and the relevant legal/security reviews are complete.
