"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, ArrowRight, DollarSign, Clock, TrendingUp, Award, ChevronDown, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

// ── SA Degree dataset ─────────────────────────────────────────────────────────

const DEGREE_DATA = [
  {
    field: "Software Engineering / Computer Science",
    category: "Technology",
    degreeType: "BSc / BEng",
    duration: 4,
    costPublicPerYear: 52000,
    costPrivatePerYear: 95000,
    startingSalary: 28000,
    salary3yr: 48000,
    salary5yr: 72000,
    salary10yr: 110000,
    employmentRate: 92,
    tvet: { name: "National Diploma IT (N6)", duration: 2, costPerYear: 12000, startingSalary: 18000, salary5yr: 38000 },
  },
  {
    field: "Chartered Accountancy / BCom Accounting",
    category: "Finance",
    degreeType: "BCom + CTA + Board exams",
    duration: 5,
    costPublicPerYear: 48000,
    costPrivatePerYear: 88000,
    startingSalary: 24000,
    salary3yr: 42000,
    salary5yr: 68000,
    salary10yr: 130000,
    employmentRate: 94,
    tvet: { name: "Financial Management (N6)", duration: 2, costPerYear: 10000, startingSalary: 15000, salary5yr: 32000 },
  },
  {
    field: "Medicine (MBChB)",
    category: "Healthcare",
    degreeType: "MBChB",
    duration: 6,
    costPublicPerYear: 72000,
    costPrivatePerYear: 140000,
    startingSalary: 38000,
    salary3yr: 55000,
    salary5yr: 90000,
    salary10yr: 180000,
    employmentRate: 99,
    tvet: { name: "Enrolled Nursing (2-yr)", duration: 2, costPerYear: 18000, startingSalary: 20000, salary5yr: 36000 },
  },
  {
    field: "Electrical Engineering",
    category: "Engineering",
    degreeType: "BEng / BSc(Eng)",
    duration: 4,
    costPublicPerYear: 58000,
    costPrivatePerYear: 105000,
    startingSalary: 30000,
    salary3yr: 50000,
    salary5yr: 72000,
    salary10yr: 115000,
    employmentRate: 88,
    tvet: { name: "Electrical Engineering (N6)", duration: 3, costPerYear: 14000, startingSalary: 22000, salary5yr: 45000 },
  },
  {
    field: "Civil Engineering",
    category: "Engineering",
    degreeType: "BEng / BSc(Eng)",
    duration: 4,
    costPublicPerYear: 56000,
    costPrivatePerYear: 100000,
    startingSalary: 28000,
    salary3yr: 46000,
    salary5yr: 68000,
    salary10yr: 105000,
    employmentRate: 85,
    tvet: { name: "Civil Engineering & Building (N6)", duration: 3, costPerYear: 13000, startingSalary: 20000, salary5yr: 40000 },
  },
  {
    field: "Data Science / Analytics",
    category: "Technology",
    degreeType: "BSc / BComSc",
    duration: 3,
    costPublicPerYear: 50000,
    costPrivatePerYear: 90000,
    startingSalary: 32000,
    salary3yr: 55000,
    salary5yr: 82000,
    salary10yr: 130000,
    employmentRate: 91,
    tvet: { name: "National Diploma IT (Data Focus)", duration: 2, costPerYear: 12000, startingSalary: 20000, salary5yr: 42000 },
  },
  {
    field: "Law (LLB)",
    category: "Legal",
    degreeType: "LLB (4-year)",
    duration: 4,
    costPublicPerYear: 45000,
    costPrivatePerYear: 80000,
    startingSalary: 22000,
    salary3yr: 38000,
    salary5yr: 62000,
    salary10yr: 110000,
    employmentRate: 78,
    tvet: { name: "Legal Secretary (N6)", duration: 2, costPerYear: 10000, startingSalary: 14000, salary5yr: 26000 },
  },
  {
    field: "Teaching (BEd)",
    category: "Education",
    degreeType: "BEd",
    duration: 4,
    costPublicPerYear: 35000,
    costPrivatePerYear: 65000,
    startingSalary: 18000,
    salary3yr: 28000,
    salary5yr: 38000,
    salary10yr: 58000,
    employmentRate: 82,
    tvet: { name: "N/A — BEd is required for teaching", duration: 4, costPerYear: 35000, startingSalary: 18000, salary5yr: 38000 },
  },
  {
    field: "Nursing (BNurs)",
    category: "Healthcare",
    degreeType: "BNurs (4-year)",
    duration: 4,
    costPublicPerYear: 42000,
    costPrivatePerYear: 78000,
    startingSalary: 22000,
    salary3yr: 32000,
    salary5yr: 45000,
    salary10yr: 72000,
    employmentRate: 97,
    tvet: { name: "Enrolled Nursing Aid", duration: 1, costPerYear: 12000, startingSalary: 14000, salary5yr: 24000 },
  },
  {
    field: "BCom Finance / Investment",
    category: "Finance",
    degreeType: "BCom",
    duration: 3,
    costPublicPerYear: 44000,
    costPrivatePerYear: 82000,
    startingSalary: 22000,
    salary3yr: 40000,
    salary5yr: 65000,
    salary10yr: 105000,
    employmentRate: 83,
    tvet: { name: "Financial Management (N6)", duration: 2, costPerYear: 10000, startingSalary: 15000, salary5yr: 32000 },
  },
  {
    field: "Mechanical Engineering",
    category: "Engineering",
    degreeType: "BEng / BSc(Eng)",
    duration: 4,
    costPublicPerYear: 56000,
    costPrivatePerYear: 100000,
    startingSalary: 28000,
    salary3yr: 46000,
    salary5yr: 68000,
    salary10yr: 105000,
    employmentRate: 86,
    tvet: { name: "Fitting & Turning / Millwright", duration: 3, costPerYear: 8000, startingSalary: 22000, salary5yr: 48000 },
  },
  {
    field: "Pharmacy (BPharm)",
    category: "Healthcare",
    degreeType: "BPharm (4-year)",
    duration: 4,
    costPublicPerYear: 55000,
    costPrivatePerYear: 100000,
    startingSalary: 28000,
    salary3yr: 42000,
    salary5yr: 58000,
    salary10yr: 90000,
    employmentRate: 95,
    tvet: { name: "Pharmacy Assistant (NQF 4)", duration: 1, costPerYear: 15000, startingSalary: 12000, salary5yr: 22000 },
  },
];

const CATEGORIES = ["All", ...new Set(DEGREE_DATA.map(d => d.category))].sort();

function fmt(n: number) {
  return `R${n.toLocaleString("en-ZA")}`;
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-1">Year {label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {fmt(p.value)}/mo</div>
      ))}
    </div>
  );
}

export default function DegreeROIPage() {
  const [selectedField, setSelectedField] = useState<typeof DEGREE_DATA[0] | null>(null);
  const [institution, setInstitution] = useState<"public" | "private">("public");
  const [category, setCategory] = useState("All");
  const [showResults, setShowResults] = useState(false);

  const filtered = useMemo(() =>
    DEGREE_DATA.filter(d => category === "All" || d.category === category),
    [category]
  );

  const roi = useMemo(() => {
    if (!selectedField) return null;
    const annualCost = institution === "public" ? selectedField.costPublicPerYear : selectedField.costPrivatePerYear;
    const totalCost = annualCost * selectedField.duration;
    const tvetTotalCost = selectedField.tvet.costPerYear * selectedField.tvet.duration;

    // Build salary timeline for both paths
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const degreeTimeline = years.map(yr => {
      if (yr < selectedField.duration) return { year: yr, degree: 0, tvet: 0 };
      const yearsWorking = yr - selectedField.duration;
      const tvetYearsWorking = yr - (yr < selectedField.tvet.duration ? yr : selectedField.tvet.duration);

      const degSalary = yearsWorking <= 0 ? 0
        : yearsWorking <= 2 ? selectedField.startingSalary
        : yearsWorking <= 4 ? Math.round((selectedField.startingSalary + selectedField.salary3yr) / 2)
        : yearsWorking <= 6 ? selectedField.salary3yr
        : yearsWorking <= 8 ? Math.round((selectedField.salary3yr + selectedField.salary5yr) / 2)
        : selectedField.salary5yr;

      const tvetSalary = tvetYearsWorking <= 0 ? 0
        : tvetYearsWorking <= 2 ? selectedField.tvet.startingSalary
        : tvetYearsWorking <= 4 ? Math.round((selectedField.tvet.startingSalary + selectedField.tvet.salary5yr) / 2)
        : selectedField.tvet.salary5yr;

      return { year: yr, degree: degSalary, tvet: tvetSalary };
    });

    // Break-even: when cumulative degree earnings > tvet earnings + cost difference
    const costDiff = totalCost - tvetTotalCost;
    let cumulativeDegreeEarnings = -totalCost;
    let cumulativeTvetEarnings = -tvetTotalCost;
    let breakEvenYear = null;
    for (let yr = 1; yr <= 10; yr++) {
      const d = degreeTimeline[yr];
      cumulativeDegreeEarnings += (d.degree * 12);
      cumulativeTvetEarnings += (d.tvet * 12);
      if (breakEvenYear === null && cumulativeDegreeEarnings >= cumulativeTvetEarnings) {
        breakEvenYear = yr;
      }
    }

    const lifetimeEarningsDegree = degreeTimeline.reduce((s, d) => s + d.degree * 12, 0);
    const roi10yr = Math.round(((lifetimeEarningsDegree - totalCost) / totalCost) * 100);

    return { annualCost, totalCost, tvetTotalCost, costDiff, degreeTimeline, breakEvenYear, roi10yr, lifetimeEarningsDegree };
  }, [selectedField, institution]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Career<span className="text-indigo-400">Intel</span><span className="text-amber-400 text-xs ml-1">SA</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
          <Link href="/sign-up" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">Get started free</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <DollarSign className="w-3.5 h-3.5" />
            Free SA Degree ROI Calculator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Is your degree<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">worth the investment?</span>
          </h1>
          <p className="text-white/50 text-lg">See the real cost, salary timeline, and break-even point for any SA degree — vs the TVET alternative.</p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-5 justify-center">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setSelectedField(null); setShowResults(false); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                category === c ? "border-violet-500/60 bg-violet-500/20 text-violet-300" : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Degree grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {filtered.map(d => (
            <button key={d.field} onClick={() => { setSelectedField(d); setShowResults(false); }}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedField?.field === d.field
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}>
              <div className="text-sm font-semibold text-white mb-0.5">{d.field}</div>
              <div className="text-xs text-white/40">{d.degreeType} · {d.duration} years</div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-violet-400 font-semibold">From R{Math.round(d.costPublicPerYear/1000)}k/yr</span>
                <span className="text-emerald-400">Avg: R{Math.round(d.salary5yr/1000)}k/mo at 5yrs</span>
              </div>
            </button>
          ))}
        </div>

        {/* Institution type */}
        {selectedField && (
          <div className="flex gap-3 mb-5">
            {(["public", "private"] as const).map(opt => (
              <button key={opt} onClick={() => { setInstitution(opt); setShowResults(false); }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all capitalize ${
                  institution === opt ? "border-violet-500/50 bg-violet-500/15 text-violet-300" : "border-white/10 text-white/50 hover:text-white"
                }`}>
                {opt === "public" ? "🎓 Public University (UCT, Wits, UKZN…)" : "🏫 Private Institution"}
              </button>
            ))}
          </div>
        )}

        {selectedField && (
          <button onClick={() => setShowResults(true)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all mb-6">
            Calculate ROI <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Results */}
        <AnimatePresence>
          {showResults && roi && selectedField && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Cost summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total degree cost",  value: fmt(roi.totalCost),                  icon: DollarSign,  color: "text-red-400"     },
                  { label: "Duration",            value: `${selectedField.duration} years`,   icon: Clock,       color: "text-amber-400"   },
                  { label: "Starting salary",     value: `${fmt(selectedField.startingSalary)}/mo`, icon: TrendingUp, color: "text-emerald-400" },
                  { label: "10yr ROI",            value: `${roi.roi10yr}%`,                   icon: Award,       color: "text-violet-400"  },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                    <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                    <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Salary timeline chart */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Salary trajectory over 10 years</h3>
                <p className="text-xs text-white/40 mb-4">
                  Degree path vs TVET alternative — {roi.breakEvenYear ? `degree overtakes TVET route at year ${roi.breakEvenYear}` : "degree stays ahead throughout"}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={roi.degreeTimeline} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="degGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="tvetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} label={{ value: "Year", position: "insideBottom", offset: -2, fill: "#6b7280", fontSize: 10 }} />
                    <YAxis tickFormatter={v => `R${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="degree" name="Degree" stroke="#8b5cf6" fill="url(#degGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="tvet"   name="TVET"   stroke="#10b981" fill="url(#tvetGrad)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 justify-center text-xs text-white/40">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-violet-500 rounded" /> Degree path</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" /> TVET / trade path</div>
                </div>
              </div>

              {/* TVET comparison */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  TVET / Trade Alternative: {selectedField.tvet.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Duration",      value: `${selectedField.tvet.duration} years`,             color: "text-white" },
                    { label: "Total cost",    value: fmt(selectedField.tvet.costPerYear * selectedField.tvet.duration), color: "text-emerald-400" },
                    { label: "Starting",      value: `${fmt(selectedField.tvet.startingSalary)}/mo`,     color: "text-white" },
                    { label: "At 5 years",    value: `${fmt(selectedField.tvet.salary5yr)}/mo`,          color: "text-indigo-300" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-xl py-3">
                      <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/40 mt-3 text-center">
                  Cost saving vs degree: <strong className="text-emerald-400">{fmt(roi.totalCost - selectedField.tvet.costPerYear * selectedField.tvet.duration)}</strong>
                  {roi.breakEvenYear ? ` — degree earns more from year ${roi.breakEvenYear} onwards` : " — both paths have similar long-term earnings"}
                </p>
              </div>

              {/* Verdict */}
              <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" /> Verdict
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {roi.roi10yr > 300
                    ? `${selectedField.field} has an exceptional ROI of ${roi.roi10yr}% over 10 years. The degree cost is fully recovered and then some — this is one of SA's highest-return qualifications.`
                    : roi.roi10yr > 100
                    ? `${selectedField.field} is a solid investment with a ${roi.roi10yr}% ROI over 10 years. ${roi.breakEvenYear ? `You break even at year ${roi.breakEvenYear}.` : ""}`
                    : `${selectedField.field} takes longer to deliver returns. Consider whether the TVET route (starting work sooner) might suit your situation better.`}
                </p>
              </div>

              {/* CTA */}
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-6 text-center">
                <p className="text-sm text-white/60 mb-4">
                  <strong className="text-white">Get a personalised career plan</strong> — bursary matches, skills gaps, and a step-by-step roadmap to your target role. Free on CareerIntel SA.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
