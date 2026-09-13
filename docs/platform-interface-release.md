# Platform-wide interface release

The CareerIntel light design now applies to the entire application, including dashboard tools, public calculators and guidance pages, onboarding, profiles, admin pages, authentication, and error screens.

## Changes
- Replaced the legacy dark root palette and per-tool dark wrapper with shared ivory, white, ink, and indigo tokens.
- Migrated hard-coded text, panels, borders, statuses, inputs, charts, and canvas colors.
- Unified public navigation and standalone branding with the journey design.
- Removed the obsolete dark/system appearance control and its saved-theme override; settings describes the active light design.
- Kept the homepage horizon animation and reduced-motion behavior.
- Added `node scripts/audit-interface.cjs` to catch reintroduced legacy dark surfaces.

## Verification
- Production build and TypeScript validation.
- Six saved-journey regression tests.
- Interface source audit across 92 page/component files.
- Isolated browser fixtures using the actual client components and synthetic account data: Job Market search and career-detail drawer, CV Builder tab/form switching, Settings appearance, and desktop/mobile course and calculator layouts.

Fixtures live in ignored `.interface-preview/`, bind only to localhost, and never change production authentication. These checks verify presentation and local interactions; they do not claim live account, AI-provider, or payment end-to-end verification. No database migration or billing changes are part of this release.
