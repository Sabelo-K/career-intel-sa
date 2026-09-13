import { MemberActionLink } from "@/components/journey/account-controls";
import { JourneyHeader } from "@/components/journey/chrome";
import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { CareerWeave } from "@/components/explore/career-weave";
import { WEAVE_CAREERS, WEAVE_SECTORS } from "@/lib/data/weave-index.generated";

/**
 * /explore — the Weave.
 *
 * Public and indexable on purpose. The 307-career dataset is the thing no other
 * SA career site has, and it used to sit entirely behind Clerk on /job-market,
 * which robots.ts also blocks. Nobody could see it without an account, and
 * Google could not see it at all.
 *
 * Each career also gets its own page at /explore/[careerId], which is where the
 * long-tail search traffic actually lands.
 */
export default function ExplorePage() {
  return (
    <div className="min-h-screen text-foreground">
      <JourneyHeader />

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            Free · no sign-up · {WEAVE_CAREERS.length} careers · {WEAVE_SECTORS.length} sectors
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            Every South African career, <span className="gradient-text">on one cloth</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Each stamp is a career. The closer to the centre, the more the market wants it.
            The bigger the stamp, the more it pays. The colour is how much of the job a
            machine can already do — and the threads join roles that are one step from each
            other. Pay figures are monthly, in rands, for the South African market.
          </p>
        </header>

        <CareerWeave />

        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-lg font-semibold mb-1">Browse every career</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Each one has its own page with pay range, demand, skills and the roles it leads to.
          </p>
          {WEAVE_SECTORS.map((sector) => (
            <div key={sector} className="mb-6">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.14em] text-primary mb-2">
                {sector}
              </h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {WEAVE_CAREERS.filter((c) => c.sector === sector).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/explore/${c.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-shweshwe/25 bg-shweshwe/5 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Where do you sit on this map?</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Check your salary against the market in about thirty seconds, or get a full
            career report with a skills gap and a five-year projection.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/salary-check"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              Am I underpaid?
            </Link>
            <MemberActionLink signedInHref="/dashboard" signedInLabel="Open my career plan"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-shweshwe hover:bg-shweshwe-light text-primary-foreground text-sm font-semibold transition-colors"
            >
              Get my career report
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </MemberActionLink>
          </div>
        </section>
      </main>
    </div>
  );
}
