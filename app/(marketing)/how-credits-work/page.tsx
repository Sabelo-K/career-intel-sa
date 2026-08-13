import Link from "next/link";
import {
  Brain, Coins, MessageCircle, Target, GitBranch, CheckCircle2,
  ArrowRight, Infinity as InfinityIcon,
} from "lucide-react";
import { CREDIT_COSTS, CREDIT_PACKS } from "@/lib/credits";
import { FREE_LIMITS } from "@/lib/plan-gate";

// Costs and limits are read from the SAME constants the platform enforces, so
// this page can never drift out of sync with what users are actually charged.

const CREDIT_ACTIONS = [
  {
    icon: MessageCircle,
    colour: "text-violet-400",
    name: "AI Career Coach message",
    cost: CREDIT_COSTS["chat-message"],
    freePerMonth: FREE_LIMITS.chatMessages,
    detail: "One message to the AI coach — career advice, interview prep, salary negotiation.",
  },
  {
    icon: Target,
    colour: "text-emerald-400",
    name: "Skills Gap analysis",
    cost: CREDIT_COSTS["skills-gap"],
    freePerMonth: FREE_LIMITS.skillsGapAnalyses,
    detail: "Compares your skills against a target role and builds a learning roadmap.",
  },
  {
    icon: GitBranch,
    colour: "text-amber-400",
    name: "Career Path simulation",
    cost: CREDIT_COSTS["career-path"],
    freePerMonth: FREE_LIMITS.careerSimulations,
    detail: "Projects your career 5–10 years ahead with ZAR salary estimates.",
  },
];

const ALWAYS_FREE = [
  "CV Builder — upload, ATS score, recruiter rating and AI rewrite",
  "Job Market — 249+ SA careers, demand scores and ZAR salary ranges",
  "Interview Prep — SA-specific questions and voice mock interviews",
  "Bursaries and Graduate Programmes directories",
  "Salary Checker, Matric Career Matcher and Degree ROI Calculator",
  "Your profile, dashboard and employability score",
];

export default function HowCreditsWorkPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">
            Career<span className="text-indigo-400">Intel</span>
            <span className="text-amber-400 text-xs ml-1">SA</span>
          </span>
        </Link>
        <Link
          href="/buy-credits"
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Buy Credits
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">

        {/* Header */}
        <header className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
            <Coins className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">How credits work</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Exactly what each action costs, and when credits are used at all.
            No surprises.
          </p>
        </header>

        {/* The rule */}
        <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">The one rule</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every account gets a <strong className="text-foreground">free allowance each month</strong>.
            Credits are a top-up — they are only used <strong className="text-foreground">after</strong> that
            free allowance is finished.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            So if your balance isn&apos;t going down, it&apos;s because you still have free usage left.
            Credits <strong className="text-foreground">never expire</strong>, so nothing is wasted while they wait.
          </p>
        </section>

        {/* Cost table */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">What each action costs</h2>
          <div className="space-y-3">
            {CREDIT_ACTIONS.map((a) => (
              <div key={a.name} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <a.icon className={`w-4 h-4 ${a.colour} flex-shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.detail}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground whitespace-nowrap">
                      {a.cost} credit{a.cost !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-emerald-400 whitespace-nowrap mt-0.5">
                      {a.freePerMonth} free/month
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Free-plan allowances shown. Paid plans include higher or unlimited allowances —
            see <Link href="/upgrade" className="text-indigo-400 hover:underline">plans</Link>.
          </p>
        </section>

        {/* Always free */}
        <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <InfinityIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">Always free — never costs credits</h2>
          </div>
          <ul className="space-y-2">
            {ALWAYS_FREE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Packs */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Credit packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(CREDIT_PACKS).map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground">{p.name}</p>
                <p className="text-2xl font-bold text-foreground mt-1">R{p.amountRands}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.credits} credits</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  R{(p.amountRands / p.credits).toFixed(2)} per credit
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            One-off payment, no subscription. Credits never expire and roll over indefinitely.
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/buy-credits"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Buy credits <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/upgrade"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-semibold transition-colors hover:text-foreground"
          >
            Compare plans
          </Link>
        </section>

        <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
          Prices in South African Rand. Payments processed securely via PayFast.
        </p>
      </div>
    </div>
  );
}
