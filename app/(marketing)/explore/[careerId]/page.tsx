import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brain, ArrowRight, ArrowLeft } from "lucide-react";
import { WEAVE_CAREERS, WEAVE_RANGES } from "@/lib/data/weave-index.generated";
import {
  formatZar,
  formatZarShort,
  PROVINCE_NAME,
  confidenceLabel,
  SALARY_SOURCES,
} from "@/lib/data/salary-model";

/**
 * One page per career — 307 indexable URLs.
 *
 * This is the actual SEO argument for making the dataset public: somebody
 * searching "boilermaker salary south africa" should land on a page that
 * answers exactly that, in rands, rather than on a gated dashboard.
 *
 * Statically generated at build time; the data only changes when SA_CAREERS
 * does, which is quarterly.
 */

const SITE = "https://careerintelsa.co.za";

export function generateStaticParams() {
  return WEAVE_CAREERS.map((c) => ({ careerId: c.id }));
}

function find(id: string) {
  return WEAVE_CAREERS.find((c) => c.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ careerId: string }>;
}): Promise<Metadata> {
  const { careerId } = await params;
  const c = find(careerId);
  if (!c) return { title: "Career not found" };

  const title = `${c.title} Salary in South Africa — ${formatZar(c.avgSalaryZar)}/month`;
  const description = `What a ${c.title} earns in South Africa: ${formatZar(c.minSalaryZar)} to ${formatZar(
    c.maxSalaryZar
  )} per month, average ${formatZar(c.avgSalaryZar)}. Demand, required skills, NQF level and related careers. Free on CareerIntel SA.`;
  const image = `${SITE}/api/og/salary?role=${encodeURIComponent(c.title)}&avg=${c.avgSalaryZar}`;

  return {
    title,
    description,
    keywords: [
      `${c.title} salary South Africa`,
      `${c.title} jobs SA`,
      `how much does a ${c.title} earn`,
      `${c.sector} careers South Africa`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE}/explore/${c.id}`,
      siteName: "CareerIntel SA",
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    alternates: { canonical: `${SITE}/explore/${c.id}` },
  };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ careerId: string }>;
}) {
  const { careerId } = await params;
  const c = find(careerId);
  if (!c) notFound();

  const related = c.related.map(find).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const demandPct = Math.round(
    ((c.demandScore - WEAVE_RANGES.demand.min) /
      (WEAVE_RANGES.demand.max - WEAVE_RANGES.demand.min)) * 100
  );
  const autoPct = Math.round(
    ((c.automationRisk - WEAVE_RANGES.automation.min) /
      (WEAVE_RANGES.automation.max - WEAVE_RANGES.automation.min)) * 100
  );

  // Google rich results: an occupation with a real ZAR salary range.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: c.title,
    occupationLocation: { "@type": "Country", name: "South Africa" },
    industry: c.sector,
    estimatedSalary: {
      "@type": "MonetaryAmountDistribution",
      name: "base",
      currency: "ZAR",
      unitText: "MONTH",
      median: c.avgSalaryZar,
      percentile10: c.minSalaryZar,
      percentile90: c.maxSalaryZar,
    },
    skills: c.topSkills.join(", "),
  };

  return (
    <div className="min-h-screen text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-shweshwe to-seal flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold text-sm">
            Career<span className="text-shweshwe-light">Intel</span>
            <span className="text-amber-400 text-xs ml-1">SA</span>
          </span>
        </Link>
        <Link
          href="/sign-up"
          className="text-sm bg-shweshwe hover:bg-shweshwe-light text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Get started free
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All careers
        </Link>

        <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.14em] text-shweshwe-light">
          {c.sector}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {c.title}
        </h1>
        <p className="mt-3 text-white/60 leading-relaxed">
          A {c.title} in South Africa earns between {formatZar(c.minSalaryZar)} and{" "}
          {formatZar(c.maxSalaryZar)} per month, with a market average of{" "}
          <strong className="text-white">{formatZar(c.avgSalaryZar)}</strong>.
          {c.nqfLevel ? ` The role typically sits at NQF level ${c.nqfLevel}.` : ""}
          {c.remoteFriendly ? " It is commonly done remotely." : ""}
          {c.internationalDemand ? " It is also in demand outside South Africa." : ""}
        </p>

        {/* Pay */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#141833]/55 p-5 sm:p-6">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/40">
            Monthly pay
          </h2>
          <p className="mt-2 text-4xl font-bold tabular-nums">{formatZar(c.avgSalaryZar)}</p>
          <div className="mt-4 relative h-2 rounded-full bg-white/8 overflow-hidden">
            <span className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-shweshwe/30 via-shweshwe to-seal/60" />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-white/40">
            <span>{formatZarShort(c.minSalaryZar)} entry</span>
            <span>{formatZarShort(c.maxSalaryZar)} senior</span>
          </div>
          <p className="mt-3 text-[11px] text-white/30 leading-relaxed">
            {confidenceLabel(c.dataConfidence)}. {SALARY_SOURCES}
          </p>
        </section>

        {/* Market */}
        <section className="mt-5 grid grid-cols-2 gap-px rounded-2xl border border-white/10 overflow-hidden bg-white/10">
          {[
            ["Market demand", `${c.demandScore} / 100`, `${demandPct}% of the range we track`],
            ["Automation risk", `${c.automationRisk}%`, autoPct <= 33 ? "Low, relative to other SA roles" : autoPct <= 66 ? "Moderate" : "High — worth planning around"],
            ["NQF level", c.nqfLevel ? `NQF ${c.nqfLevel}` : "Varies", "South African qualifications framework"],
            ["Hires most in", PROVINCE_NAME[c.topProvinces[0]] ?? "Nationwide", c.topProvinces.slice(1, 3).map((p) => PROVINCE_NAME[p] ?? p).join(" · ") || "—"],
          ].map(([k, v, sub]) => (
            <div key={k} className="bg-[#0e1224] p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-white/40">{k}</p>
              <p className="mt-1 font-mono text-lg tabular-nums text-white">{v}</p>
              <p className="mt-0.5 text-[11px] text-white/35 leading-snug">{sub}</p>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Skills employers ask for</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.topSkills.map((s) => (
              <span
                key={s}
                className="text-sm px-3 py-1.5 rounded-full bg-shweshwe/15 border border-shweshwe/30 text-shweshwe-pale"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Careers one step away</h2>
            <div className="mt-3 flex flex-col rounded-xl border border-white/10 overflow-hidden">
              {related.map((r) => {
                const diff = r.avgSalaryZar - c.avgSalaryZar;
                return (
                  <Link
                    key={r.id}
                    href={`/explore/${r.id}`}
                    className="group flex items-center justify-between gap-3 border-b border-white/6 bg-[#0e1224] px-4 py-3 last:border-0 hover:bg-shweshwe/8 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{r.title}</span>
                      <span className="block text-[11px] text-white/35">{r.sector}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-sm tabular-nums">
                        {formatZarShort(r.avgSalaryZar)}
                      </span>
                      <span
                        className={`block font-mono text-[11px] ${
                          diff > 0 ? "text-emerald-400" : "text-white/35"
                        }`}
                      >
                        {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                        {formatZarShort(Math.abs(diff))}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-shweshwe/25 bg-shweshwe/5 p-6 text-center">
          <h2 className="text-lg font-semibold">Are you being paid this?</h2>
          <p className="mt-1.5 text-sm text-white/60">
            Check your own salary against the market for {c.title} — free, no sign-up.
          </p>
          <Link
            href="/salary-check"
            className="group mt-4 inline-flex items-center gap-2 rounded-lg bg-shweshwe hover:bg-shweshwe-light px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Check my salary
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </section>
      </main>
    </div>
  );
}
