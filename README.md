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
- **Free signup and log in for everyone 13 and older**, with no invitation, approval queue or payment. A four-step flow asks first whether you are a player, a content creator or an esports organization, then account details, role-specific questions, and a consent step. Accounts work on this device: sign up, log out, and sign back in with the same email and password, including after a reload.
- **Credential handling you can inspect.** Passwords are never stored as text: each account keeps a random 16-byte salt and a PBKDF2-HMAC-SHA-256 hash at 600,000 iterations, compared in constant time. Sessions expire after seven days, "keep me signed in" can be turned off so the session ends with the tab, five failed attempts pause sign-in for 30 seconds, and unknown emails cost the same derivation time so response timing does not reveal who has an account.
- **Account management that matches the privacy notice.** The profile page exports the account and profile as JSON, deletes the account after an explicit confirmation (removing its hash and session), and signs out cleanly. Profile edits are written back to the account.
- Candidate profile form with private-by-default visibility toggle, per-application sharing summary, and sensitive-data warnings. Every field (region, time zone, languages, desired roles, games, skills, experience, availability, portfolio, handles, compensation) and the discovery switch are written to the signed-in account and return after a reload. Without an account the fields live only in the tab, and the page says so.
- **Sign-up answers become profile data.** The game, role, rank, availability, salary ask, creator focus, platforms, organization type and hiring needs collected in step three are stored on the account, shown back on the profile page and included in the data export. They used to be discarded at registration.
- Organization workspace requires a real organization account; a signed-in organization gets its own workspace header, and without one the page says so instead of rendering a mock dashboard.
- A US privacy notice covering what is collected, the no-sale/no-tracking position, retention, minors, and the access, correction, deletion, opt-out, limited-use, non-discrimination, authorized-agent and appeal rights of CCPA/CPRA and other state laws.
- **Reports and feedback are actually stored.** Submitting either writes a record (reason, details, target, reporter, timestamp) to device storage, reads it back to confirm, and only then shows a confirmation. If the browser blocks storage the interface says nothing was saved. The moderator page renders those reports and notes, and its warning states that it is a local preview rather than a staffed, access-controlled queue. Nothing is delivered to moderators or the product team yet, and the copy says exactly that.
- Reserved future ad inventory. **No ad network, ad scripts, tracking, sponsored placements, or ad targeting are installed.** Keep ads out of applications, private profiles, candidate data, and audience targeting. Establish audience age policy, consent and privacy reviews before any future advertising.
- **No third-party requests.** Bricolage Grotesque, Manrope and DM Mono are downloaded at build time and served from this origin, so no visitor IP reaches a font provider and there is no external stylesheet request.
- **A weak magnetic pull on the primary buttons.** With a mouse or trackpad, each button leans a few pixels toward the cursor — proportional to how far the pointer is from its center and hard-capped at 6px in any direction — then settles back when the pointer leaves. It is delegated, so buttons that appear after a click move too. Disabled buttons never move, and the whole effect is skipped for touch input and for anyone whose system asks for reduced motion.
- Responsive semantic controls, labels, keyboard focus treatment, reduced-motion support, and empty states.

## Critical implementation limits

This is a **front-end-only build**, not a live or launch-ready recruitment marketplace:

- **Authentication is client-side only.** There is no server, database, email delivery or authorization. Credentials live in this browser's storage, so anyone with access to the device or its developer tools can read or edit the account list. The PBKDF2 hash protects a password from casual inspection; it cannot enforce access control, rate limits across sessions, or account recovery. Move authentication to the API before real use.
- Organization, listing, player and conversation data is empty until the API fills it. Applications, reports and feedback persist in this browser's storage, so "saved on this device" is literally true, but they reach no organization or moderator, and clearing site data removes them. The browser and UI enforce no access control: do not put real recruitment data into this build.
- **Guardian consent is not verified.** A 13–17 account records a guardian email, a guardian consent checkbox and a consent timestamp. No email is sent, so the account stays under a hold: applying to roles, messaging organizations and turning on candidate discovery are blocked, and saving the profile cannot switch discovery on. Browsing stays open. Lifting the hold needs a real guardian-confirmation flow on the server.
- Apply, withdraw, reporting, blocking, status changes, exports/deletion, recruiter invites, moderation actions, appeals and support are not connected to a backend. They do not contact an organization, delete/export server records, alert a moderator, or create an audit trail, and the interface no longer suggests otherwise.
- No real organization or individual has been verified. A future verification label must state exact checks and dates; neither org nor identity verification guarantees role safety, legitimacy, or VAYNTR endorsement.
- **No support address is wired.** The "Contact support" control opens the feedback panel until a monitored support owner and escalation process are assigned.
- There are no real listings, testimonials, endorsements, users, or performance claims. Educational guidance is cautiously framed, reviewed October 22, 2026, and linked to its sources. Platform-specific guidance may change; re-review sources before launch.
- Age is a **launch decision**. Floor ages follow each scene's published competition rules (Rocket League, Fortnite and Street Fighter 13+; Apex, CS2 and EA SPORTS FC 16+; League of Legends and Overwatch 17+; VALORANT, Warzone, Rainbow Six and Tekken 18+), and a stored age gates applying and contacting. Game labels are matched through an alias table, so `valorant`, `Warzone` or `CS2` resolve to the right rule. A label that matches no verified rule now fails closed: it is treated as 18+ and flagged for review rather than inheriting the former 16+ default. An age input is still not robust age assurance.
- **Signup enforces a 13+ minimum** and refuses under-13 accounts, which is what COPPA requires without verifiable parental consent; organization accounts require an adult 18 or older. Ages 13–17 must supply a guardian email and a guardian consent checkbox, and their account is marked “guardian confirmation pending”. **No guardian email is sent yet**, so a production release needs verifiable parental or guardian consent delivery, contact protections, limited visibility and counsel review before minors can be onboarded at scale.
- Password reset, email verification, multi-factor authentication and guardian-confirmation email are not implemented. "Forgot password?" explains that reset needs email delivery rather than pretending to send a link.
- Candidate discovery is off by default in the demo, but the form toggle is not a privacy boundary. A production system must only expose opted-in profiles to authenticated/approved organizations and let candidates turn discovery off promptly.
- Future listing forms must enforce all role, compensation, hours, location, eligibility, experience, responsibilities, application process, posting and expiry fields; prohibit fees, required purchases, misleading compensation and requests for credentials/sensitive documents. Applications must be initiated by the candidate and communicate through a controlled platform flow.

## Security and launch audit follow-up (October 22, 2026)

Findings raised against this repository and what changed here. Items marked **open** need a server and remain launch gates.

| Finding | Status in this build |
| --- | --- |
| Reports and feedback were discarded while claiming a save | **Fixed.** Records are written, read back, listed in the moderator view and survive a reload; failures are reported instead of confirmed. |
| Sign-up answers were thrown away at registration | **Fixed.** Answers, consent timestamps and guardian state are stored with the account, shown on the profile and included in the export. |
| Most profile fields and the discovery switch were not persisted | **Fixed.** Every field is account state and returns after a reload. |
| Unknown game labels silently fell back to 16+ | **Fixed.** Alias-aware matching; unverified labels are 18+ and flagged. |
| Guardian consent was recorded but not enforced | **Partially fixed.** A minor account is held: no applying, messaging or discovery until a guardian confirms. Guardian confirmation itself — **open**. |
| Moderator page was reachable from public navigation | **Reduced.** It is out of the quick-jump list and reachable only from Trust & safety, and it states that it is an unprotected local preview. Server-side staff authorization — **open**. |
| Pages requested Google Fonts from a third party | **Fixed.** Fonts are self-hosted at build time; no third-party request remains. |
| Deployment did not run lint, tests or a dependency audit | **Fixed.** The workflow now gates on `oxlint`, `npm audit --omit=dev --audit-level=high` and the Playwright suite before publishing. |
| `main` has no branch protection, and the workflow commits builds back to `main` | **Open.** Repository settings, not code: require reviewed changes and passing checks. |
| No backend, server authentication or authorization; no terms of service; no monitored privacy or support contact | **Open.** See the launch gates below. |

What this build still cannot claim: server-enforced authentication or authorization, verified guardian consent, delivered reports, password reset, email verification, or a monitored privacy/support channel. Treat it as a labelled preview, not a service accepting real recruitment data.

## Minimum production architecture

Before real use, implement a server-backed identity and persistent datastore selected for the actual hosting environment. Keep candidate profiles, applications, reports, memberships and moderation records server-side. Enforce authorization on every private route: candidate owns their records; recruiters can only access assigned listings and the corresponding organization's applications; owners administer only their organization; moderation is case-scoped and audited. Never trust client-supplied owner/user/org IDs. Scope database queries server-side, protect mutations against cross-origin requests, use private/no-store responses, and exclude private records from static HTML, search indexes, analytics, logs and ads. Keep secrets in a server-side secret store.

Implement per-application disclosure, controlled communications, block/report/moderation/removal/appeal, listing expiry, account export and deletion, retention schedules, and logs that avoid secrets and unnecessary sensitive data. Define incident response and response ownership. Core candidate profile/apply features must remain free; do not sell verification or consideration. Do not add payment or ads until separately reviewed and transparently disclosed.

## Launch gates (not passed)

1. Approve and document age scope, terms, privacy notice, prohibited conduct, support/escalation and moderation ownership.
2. Assign a monitored privacy contact and a request-handling process for access, correction, deletion, opt-out and appeal requests, and have counsel review the draft privacy notice.
3. Deliver real guardian confirmation by email before any under-18 account is activated.
4. Replace browser-held credentials with server authentication, email verification, password reset and session revocation.
5. Add authorization tests proving candidates cannot read another candidate's records and recruiters cannot read another organization's data.
6. Prove private content never appears in public HTML, search indexes, analytics, logs or ad systems.
7. Implement and test report, block, moderation, removal, appeal and support flows.
8. Define verification criteria, compensation disclosures, expiry and scam response.
9. Implement/test account export, deletion and record retention.
10. Keep candidate fees/pay-to-apply absent and label any future sponsored roles.
11. Test keyboard, screen-reader, mobile and accessibility for recruitment/application flows.
12. Run a limited pilot reviewed by candidates and organizations before broad rollout.

Do not describe this build as a real marketplace or publicly launch it until these gates and the relevant legal/security reviews are complete.
