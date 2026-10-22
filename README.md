# VAYNTR Talent

A Next.js App Router + React + TypeScript demo for a black-and-red esports and creator talent marketplace. The UI preserves the existing VAYNTR Talent demo flows and styling. The app can run as a standard Next.js server or export as a static site for GitHub Pages.

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

- **GitHub Pages demo:** the Actions workflow sets `GITHUB_PAGES=true`, builds a static export into `out/`, and publishes that directory under `/Vayntr-Talent/`.
- **Server deployment:** omit `GITHUB_PAGES=true`, then use `npm run build` and `npm start` on a Next.js-capable host such as Render.
- Keep GitHub Pages' publishing source set to **GitHub Actions** for the static export workflow to own deployment.

## What this demo includes

- Responsive public landing, role marketplace with search/category filters, full sample listing details, organization profile, trust and safety page, and dated educational resources with source links.
- Clearly labeled **sample/demo listings**. The fictional sample organizations and roles are not real opportunities. The demo-only "Organization checked" badge is an explanation example, not verification.
- Candidate profile form with private-by-default visibility toggle, application sharing summary, local apply/status/withdraw interactions, export/delete placeholders, and sensitive-data warnings.
- Organization inbox with local status changes and mocked recruiter/listing-management actions.
- Listing report dialog, organization block control, and moderator dashboard mockup, with demo-only disclaimers.
- Clearly reserved future ad inventory areas. **No ad network, ad scripts, tracking, sponsored placements, or ad targeting are installed.** Keep ads out of applications, private profiles, candidate data, and audience targeting. Establish audience age policy, consent and privacy reviews before any future advertising.
- Responsive semantic controls, labels, keyboard focus treatment, reduced-motion support, and empty states.

## Critical implementation limits

This is a **front-end-only demonstration**, not a live or launch-ready recruitment marketplace:

- There is no authentication, server, database, account system, authorization, secure session, persistence, or organization membership. Candidate and organization demo state is held only in page memory. It resets on reload. The browser and UI do not enforce access controls; do not put real profile or application data into this demo.
- Apply, withdraw, reporting, blocking, status changes, exports/deletion, recruiter invites, moderation actions, appeals and support are simulated. They do not contact an organization, delete/export server records, alert a moderator, or create an audit trail.
- No real organization or individual has been verified. A future verification label must state exact checks and dates; neither org nor identity verification guarantees role safety, legitimacy, or VAYNTR endorsement.
- Support address is a placeholder (`support@vayntr.example`). Replace only after assigning a monitored support owner and escalation process.
- There are no real listings, testimonials, endorsements, users, or performance claims. Educational guidance is cautiously framed, reviewed October 22, 2026, and linked to its sources. Platform-specific guidance may change; re-review sources before launch.
- Age is a **launch decision**. This demo models an adults-only marketplace (18+) while public educational pages may be viewed by anyone. An age dropdown is not robust age assurance. Do not allow minors to create marketplace accounts/apply until a separate guardian-involved process, contact protections, limited visibility, and legal/privacy review are implemented. Do not collect personal data through the marketplace from children under 13.
- Candidate discovery is off by default in the demo, but the form toggle is not a privacy boundary. A production system must only expose opted-in profiles to authenticated/approved organizations and let candidates turn discovery off promptly.
- Future listing forms must enforce all role, compensation, hours, location, eligibility, experience, responsibilities, application process, posting and expiry fields; prohibit fees, required purchases, misleading compensation and requests for credentials/sensitive documents. Applications must be initiated by the candidate and communicate through a controlled platform flow.

## Minimum production architecture

Before real use, implement a server-backed identity and persistent datastore selected for the actual hosting environment. Keep candidate profiles, applications, reports, memberships and moderation records server-side. Enforce authorization on every private route: candidate owns their records; recruiters can only access assigned listings and the corresponding organization's applications; owners administer only their organization; moderation is case-scoped and audited. Never trust client-supplied owner/user/org IDs. Scope database queries server-side, protect mutations against cross-origin requests, use private/no-store responses, and exclude private records from static HTML, search indexes, analytics, logs and ads. Keep secrets in a server-side secret store.

Implement per-application disclosure, controlled communications, block/report/moderation/removal/appeal, listing expiry, account export and deletion, retention schedules, and logs that avoid secrets and unnecessary sensitive data. Define incident response and response ownership. Core candidate profile/apply features must remain free; do not sell verification or consideration. Do not add payment or ads until separately reviewed and transparently disclosed.

## Launch gates (not passed)

1. Approve and document age scope, terms, privacy notice, prohibited conduct, support/escalation and moderation ownership.
2. Add authorization tests proving candidates cannot read another candidate's records and recruiters cannot read another organization's data.
3. Prove private content never appears in public HTML, search indexes, analytics, logs or ad systems.
4. Implement and test report, block, moderation, removal, appeal and support flows.
5. Define verification criteria, compensation disclosures, expiry and scam response.
6. Implement/test account export, deletion and record retention.
7. Keep candidate fees/pay-to-apply absent and label any future sponsored roles.
8. Test keyboard, screen-reader, mobile and accessibility for recruitment/application flows.
9. Run a limited pilot reviewed by candidates and organizations before broad rollout.

Do not describe this build as a real marketplace or publicly launch it until these gates and the relevant legal/security reviews are complete.
