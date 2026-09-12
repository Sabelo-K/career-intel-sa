# Career journeys production release — 12 September 2026

## Product behavior

The home page and /start offer school, first-work and working-adult journeys. /explore supports public search, sector filters, three-career comparison and authenticated shortlists. All 307 career URLs remain available; the earlier visual map lives at /career-map.

/dashboard uses private, database-backed career plans. Users choose a goal, weekly learning time, monthly budget and review date. Completion is explicitly self-reported. Changing audience or goal resets the checklist while preserving the shortlist. Selecting a catalogue career as the goal updates the existing profile target role in the same transaction, so other guidance tools can use it.

The existing CV, coaching, course, interview, funding, job alert and payment flows remain accessible through grouped navigation. The dashboard no longer presents the former illustrative charts or fixed market claims as personal progress. Core exploration and plans do not consume AI credits.

## Data and migration

Run `npx dotenv -e .env.local -- tsx scripts/migrate-journeys.ts` against the intended database before deploying this release. The reviewed, idempotent SQL creates career_journeys and adds profiles.recruiterVisible with a false default. Existing account, payment and subscription values are not modified.

Public profiles and score pages require explicit stored visibility consent. The settings screen saves that choice through /api/profile and reports failures. Users who previously had a share link must opt in to make it public. Profile fetches bypass caches so disabling visibility is respected.

Career plans are included in the existing account data export and deleted by the user relation cascade when the account is deleted. The plan-only text download is local and contains no account identifiers.

## Verification commands

- `npx tsx --test tests/journey.test.ts`
- `npx tsc --noEmit --pretty false`
- `npm run build`
- `npx dotenv -e .env.local -- tsx scripts/verify-journey-db.ts`

The database verification uses a transaction and deliberately rolls back all test accounts and plans. It checks owner-scoped writes, optimistic version checking, saved completion and private defaults.

## Deployment and rollback

The existing repository auto-deploys master to Vercel. Confirm the deployment status for the exact release commit and check /, /start, /explore and a career detail page on the production domain. Authenticated plan APIs must reject anonymous access.

Keep the additive schema if a code rollback is required; do not drop tables or delete saved plans. Reverting to the old code also reintroduces its unenforced public-profile visibility logic, so prefer a forward fix or a rollback retaining the privacy endpoint fixes.

## Operational dependencies

Clerk, the database, PayFast and the AI provider use the deployment's existing configuration. GROQ_API_KEY is required when AI tools run; it is no longer needed merely to import modules during a build. The chat endpoint returns 503 before credit deductions if its key is missing. Do not replace unavailable AI responses with fabricated output.

Career figures remain indicative catalogue data, refreshed August 2026, rather than live salary or vacancy measurements. Verify requirements and eligibility with the relevant institution or employer. Review date is a plan field, not an automatic email reminder.
