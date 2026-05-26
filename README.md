# CareerIntel SA — AI Career Intelligence Platform

> South Africa's first AI-powered career intelligence engine. Built to solve graduate unemployment, skills mismatch, and the lack of accessible labour market intelligence.

---

## Quick Start

```bash
# 1. Clone & install
cd career-intel
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your keys (see Environment Variables section)

# 3. Set up database
npx prisma db push
npm run db:seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CareerIntel SA                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15 App Router)                          │
│  ├── Landing Page (public)                                 │
│  ├── Dashboard (auth protected)                            │
│  │   ├── Main Dashboard (stats, charts, insights)         │
│  │   ├── CV Builder (upload → parse → analyse → improve)  │
│  │   ├── AI Career Coach (chat interface)                 │
│  │   ├── Career Path Simulator (5-10yr projection)        │
│  │   ├── Skills Gap Analysis (gap → roadmap)              │
│  │   ├── Job Market Analytics (demand data, heatmaps)     │
│  │   ├── Course Intelligence (curated recommendations)    │
│  │   └── Interview Prep (mock questions + tips)           │
│  └── Admin Panel                                           │
├─────────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes)                              │
│  ├── /api/chat                 → AI career coach          │
│  ├── /api/cv/analyze           → CV parsing + scoring     │
│  ├── /api/career/demand        → Career demand data       │
│  ├── /api/career/paths         → Career path simulation   │
│  ├── /api/skills/gap           → Skills gap analysis      │
│  └── /api/analytics            → Market analytics         │
├─────────────────────────────────────────────────────────────┤
│  AI Layer (Anthropic Claude claude-sonnet-4-6)                     │
│  ├── Career Coach     → Conversational SA career guidance │
│  ├── CV Parser        → Structure extraction from CVs     │
│  ├── CV Analyser      → ATS + recruiter scoring           │
│  ├── Skills Gap AI    → Gap identification + roadmaps     │
│  ├── Path Simulator   → Career trajectory modelling       │
│  └── Interview Gen    → SA-specific question generation   │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── PostgreSQL (Supabase)  → Users, CVs, chats, paths    │
│  ├── Prisma ORM             → Type-safe database client   │
│  └── Static SA Data         → 20+ careers, 9 provinces    │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

Create `.env` from `.env.example`:

```env
# PostgreSQL (Supabase recommended)
DATABASE_URL="postgresql://user:pass@host:5432/career_intel"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Tech Stack

| Layer        | Technology                              |
|-------------|----------------------------------------|
| Framework    | Next.js 15 (App Router)                |
| Language     | TypeScript                             |
| Styling      | TailwindCSS + tailwindcss-animate      |
| Components   | Radix UI + custom design system        |
| Animations   | Framer Motion                          |
| Charts       | Recharts                               |
| Auth         | Clerk                                  |
| Database     | PostgreSQL via Supabase                |
| ORM          | Prisma                                 |
| AI           | Anthropic Claude claude-sonnet-4-6             |
| PDF Parsing  | pdf-parse                              |
| Validation   | Zod                                    |
| State        | Zustand + React hooks                  |
| Hosting      | Vercel (frontend) + Supabase (DB)      |

---

## Database Schema

Key models:

- **User** — Clerk-linked user with plan (FREE/PREMIUM/RECRUITER)
- **Profile** — Career profile: current role, target, skills, province, employability score
- **CV** — Uploaded CVs with ATS scores, parsed data, AI improvements
- **ChatSession / ChatMessage** — Career coach conversation history
- **CareerPath** — Simulated career trajectories with salary projections
- **SkillsGap** — Gap analysis results with learning paths
- **CareerDemand** — SA career demand data (seeded from sa-careers.ts)
- **CourseProgress** — User course tracking

---

## Deployment Guide

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add ANTHROPIC_API_KEY
vercel env add DATABASE_URL
# ... (all vars from .env.example)
```

### Supabase Database Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy the `DATABASE_URL` from Settings → Database
3. Run: `npx prisma db push`
4. Run: `npm run db:seed`

### Clerk Authentication Setup

1. Create app at [clerk.com](https://clerk.com)
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Configure redirect URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`

### Anthropic API

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `ANTHROPIC_API_KEY`
3. The platform uses `claude-sonnet-4-6` for all AI features

---

## MVP Roadmap

### Phase 1 — Core MVP (Weeks 1-8) ✅
- [x] Landing page
- [x] Authentication (Clerk)
- [x] Main dashboard
- [x] AI CV Builder (upload + ATS score)
- [x] AI Career Coach (chat)
- [x] Career Demand Engine (SA data)
- [x] Skills Gap Analysis
- [x] Career Path Simulator
- [x] Course Recommendations
- [x] Interview Prep
- [x] Database schema + seed data

### Phase 2 — Growth (Weeks 9-16)
- [ ] Real SA job board integration (PNet API, CareerJunction)
- [ ] Premium subscription (PayFast / Stripe)
- [ ] Email notifications (Resend)
- [ ] CV PDF generation (React PDF)
- [ ] LinkedIn profile generator
- [ ] Advanced salary prediction model
- [ ] Mobile app (React Native / PWA)
- [ ] Recruiter portal

### Phase 3 — Scale (Months 5-12)
- [ ] SETA learnership matching engine
- [ ] University partnership integrations
- [ ] B-BBEE skills development tracking
- [ ] Corporate HR dashboard
- [ ] Government / DHET data integration
- [ ] ML-based job matching algorithm
- [ ] WhatsApp career coach bot
- [ ] Afrikaans + isiZulu language support

---

## Monetisation Strategy

### Revenue Streams

| Tier        | Price      | Features                                    |
|------------|-----------|---------------------------------------------|
| Free        | R0/mo     | Basic CV, 10 AI messages, demand data       |
| Premium     | R199/mo   | Unlimited AI, simulations, salary intel     |
| Recruiter   | R1,499/mo | Talent search, candidate ranking, reports   |
| Enterprise  | Custom    | API access, white-label, government deals   |

### Revenue Projections (Year 1)
- 10,000 registered users × 5% premium conversion = 500 premium users
- 500 × R199 = **R99,500/month** from premium
- 20 recruiter accounts × R1,499 = **R29,980/month**
- **Total MRR Target: ~R130k/month** (~$7,000 USD)

### B2B Opportunities
- SETA partnerships (subsidised training allocation)
- University career services integration
- Government employment programmes
- Corporate L&D departments (skills gap analytics)

---

## Scaling Architecture (Future)

```
Current (MVP): Vercel + Supabase + Claude API
                ↓
Scale (10k users): Add Redis caching, CDN, Supabase Pro
                ↓
Enterprise (100k+ users):
├── Microservices (separate AI service)
├── Vector database (Pinecone) for semantic job matching
├── Background jobs (Inngest / BullMQ)
├── Real-time updates (Supabase Realtime)
├── Analytics (Mixpanel / PostHog)
└── Multi-region deployment
```

---

## Folder Structure

```
career-intel/
├── app/
│   ├── (auth)/           # Sign in/up pages
│   ├── (dashboard)/      # All authenticated pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── cv-builder/   # AI CV builder
│   │   ├── career-coach/ # AI chat
│   │   ├── career-paths/ # Simulator
│   │   ├── skills-gap/   # Gap analysis
│   │   ├── job-market/   # Analytics
│   │   ├── courses/      # Recommendations
│   │   ├── interview-prep/
│   │   └── profile/
│   ├── (admin)/          # Admin panel
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Design system (Button, Card, Badge...)
│   └── layout/           # Sidebar, Navbar
├── lib/
│   ├── ai/               # Claude integration + prompts
│   ├── data/             # SA careers, provinces, courses
│   ├── db.ts             # Prisma client
│   ├── utils.ts          # Helpers
│   └── types.ts          # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── middleware.ts          # Clerk auth middleware
└── public/               # Static assets
```

---

## Key Design Principles

1. **South African First** — All data, salaries, qualifications, and context are SA-specific
2. **AI-Native** — Every feature is enhanced by Claude AI
3. **Mobile First** — Responsive design that works on low-end Android devices
4. **Data-Driven** — Every recommendation is backed by market data
5. **Inclusive** — Accessible to matric graduates, not just degree holders
6. **POPIA Compliant** — South African data privacy law adherence

---

## Contributing

This is a startup-grade codebase. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push and create a PR

---

## License

MIT — Built for South Africa's future workforce 🇿🇦
