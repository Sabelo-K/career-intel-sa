"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  DollarSign, MapPin, TrendingUp, ArrowRight, Brain,
  Share2, CheckCircle, AlertCircle, ChevronDown, Search,
} from "lucide-react";
import { SA_CAREERS } from "@/lib/data/sa-careers";

const PROVINCES = [
  { code: "GAUTENG",       name: "Gauteng"        },
  { code: "WESTERN_CAPE",  name: "Western Cape"   },
  { code: "KWAZULU_NATAL", name: "KwaZulu-Natal"  },
  { code: "EASTERN_CAPE",  name: "Eastern Cape"   },
  { code: "FREE_STATE",    name: "Free State"     },
  { code: "LIMPOPO",       name: "Limpopo"        },
  { code: "MPUMALANGA",    name: "Mpumalanga"     },
  { code: "NORTH_WEST",    name: "North West"     },
  { code: "NORTHERN_CAPE", name: "Northern Cape"  },
];

const EXPERIENCE_BANDS = [
  { value: "0-2",  label: "0 – 2 years",  multiplier: 0.72 },
  { value: "3-5",  label: "3 – 5 years",  multiplier: 0.97 },
  { value: "6-10", label: "6 – 10 years", multiplier: 1.18 },
  { value: "10+",  label: "10+ years",    multiplier: 1.38 },
];

// Province premium: top hiring provinces pay more
const PROVINCE_PREMIUM: Record<string, number> = {
  GAUTENG:        1.08,
  WESTERN_CAPE:   1.05,
  KWAZULU_NATAL:  0.97,
  EASTERN_CAPE:   0.93,
  FREE_STATE:     0.90,
  LIMPOPO:        0.88,
  MPUMALANGA:     0.91,
  NORTH_WEST:     0.89,
  NORTHERN_CAPE:  0.87,
};

function fmt(n: number) {
  return `R${Math.round(n / 1000) * 1000 < 10000
    ? n.toLocaleString("en-ZA")
    : (Math.round(n / 500) * 500).toLocaleString("en-ZA")}`;
}

export default function SalaryCheckPage() {
  const [search, setSearch]         = useState("");
  const [selectedRole, setSelectedRole] = useState<typeof SA_CAREERS[0] | null>(null);
  const [province, setProvince]     = useState("GAUTENG");
  const [experience, setExperience] = useState("3-5");
  const [currentSalary, setCurrentSalary] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied]         = useState(false);

  const filtered = useMemo(() =>
    search.length > 1
      ? SA_CAREERS.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
      : [],
    [search]
  );

  const result = useMemo(() => {
    if (!selectedRole) return null;
    const band = EXPERIENCE_BANDS.find(b => b.value === experience)!;
    const prem = PROVINCE_PREMIUM[province] ?? 1;
    const min = Math.round(selectedRole.minSalaryZar * band.multiplier * prem / 500) * 500;
    const avg = Math.round(selectedRole.avgSalaryZar * band.multiplier * prem / 500) * 500;
    const max = Math.round(selectedRole.maxSalaryZar * band.multiplier * prem / 500) * 500;
    const cur = currentSalary ? parseInt(currentSalary.replace(/\D/g, "")) : null;
    const pctOfAvg = cur ? Math.round((cur / avg) * 100) : null;
    const gap = cur ? avg - cur : null;
    const verdict: "underpaid" | "fair" | "overpaid" | null =
      pctOfAvg === null ? null
      : pctOfAvg < 82  ? "underpaid"
      : pctOfAvg > 115 ? "overpaid"
      : "fair";
    return { min, avg, max, cur, pctOfAvg, gap, verdict };
  }, [selectedRole, experience, province, currentSalary]);

  const topProvinces = useMemo(() => {
    if (!selectedRole) return [];
    return [...PROVINCES]
      .filter(p => selectedRole.topProvinces.includes(p.code))
      .map(p => ({
        ...p,
        avg: Math.round(selectedRole.avgSalaryZar * (PROVINCE_PREMIUM[p.code] ?? 1) / 500) * 500,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);
  }, [selectedRole]);

  function handleCheck() {
    if (!selectedRole) return;
    setShowResults(true);
  }

  async function handleCopy() {
    if (!selectedRole || !result) return;
    const provName = PROVINCES.find(p => p.code === province)?.name ?? province;
    const suffix =
      result.verdict === "underpaid" ? " — I might be underpaid!" :
      result.verdict === "fair"      ? " — I'm earning market rate" :
                                       " — I'm above market rate";
    const text = `I just checked my salary on CareerIntel SA\n${selectedRole.title} in ${provName}: market avg is ${fmt(result.avg)}/month${suffix}\nCheck yours: https://careerintelsa.co.za/salary-check`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

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
          <Link href="/sign-up" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <DollarSign className="w-3.5 h-3.5" />
            Free SA Salary Benchmark — No sign-up required
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Am I being<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">underpaid?</span>
          </h1>
          <p className="text-white/50 text-lg">
            Check your salary against the SA market in 30 seconds.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5">

          {/* Role search */}
          <div className="relative">
            <label className="block text-xs font-medium text-white/60 mb-2">Your Job Role</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={selectedRole ? selectedRole.title : search}
                onChange={e => {
                  if (selectedRole) { setSelectedRole(null); setShowResults(false); }
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search your role, e.g. Software Engineer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {selectedRole && (
                <button onClick={() => { setSelectedRole(null); setSearch(""); setShowResults(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-lg leading-none">×</button>
              )}
            </div>
            <AnimatePresence>
              {showDropdown && filtered.length > 0 && !selectedRole && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute z-20 w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {filtered.map(c => (
                    <button key={c.id} onClick={() => { setSelectedRole(c); setSearch(c.title); setShowDropdown(false); setShowResults(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-white">{c.title}</div>
                        <div className="text-xs text-white/40">{c.sector}</div>
                      </div>
                      <span className="text-xs text-indigo-400 font-mono">{fmt(c.avgSalaryZar)}/mo avg</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Province + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Province</label>
              <div className="relative">
                <select value={province} onChange={e => { setProvince(e.target.value); setShowResults(false); }}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors pr-8">
                  {PROVINCES.map(p => <option key={p.code} value={p.code} className="bg-zinc-900">{p.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Experience</label>
              <div className="relative">
                <select value={experience} onChange={e => { setExperience(e.target.value); setShowResults(false); }}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors pr-8">
                  {EXPERIENCE_BANDS.map(b => <option key={b.value} value={b.value} className="bg-zinc-900">{b.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Optional: current salary */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">
              Your Current Salary/month <span className="text-white/30 font-normal">(optional — to see if you&apos;re underpaid)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">R</span>
              <input
                value={currentSalary}
                onChange={e => { setCurrentSalary(e.target.value.replace(/\D/g, "")); setShowResults(false); }}
                placeholder="e.g. 45000"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!selectedRole}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2"
          >
            Check My Salary <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && result && selectedRole && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 space-y-4">

              {/* Verdict banner */}
              {result.verdict && (
                <div className={`rounded-2xl p-5 border ${
                  result.verdict === "underpaid" ? "bg-red-500/10 border-red-500/25" :
                  result.verdict === "fair"      ? "bg-emerald-500/10 border-emerald-500/25" :
                                                   "bg-indigo-500/10 border-indigo-500/25"
                }`}>
                  <div className="flex items-center gap-3 mb-1">
                    {result.verdict === "underpaid"
                      ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      : <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    <span className={`font-bold text-lg ${
                      result.verdict === "underpaid" ? "text-red-300" :
                      result.verdict === "fair"      ? "text-emerald-300" : "text-indigo-300"
                    }`}>
                      {result.verdict === "underpaid" ? "You may be underpaid" :
                       result.verdict === "fair"      ? "You're earning market rate" :
                                                        "You're above market rate"}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 ml-8">
                    {result.verdict === "underpaid" && result.gap
                      ? `The SA market average for your role is ${fmt(result.avg)}/mo — that's ${fmt(Math.abs(result.gap))} more than your current salary.`
                      : result.verdict === "fair"
                      ? `Your salary is within the normal range for a ${selectedRole.title} in ${PROVINCES.find(p=>p.code===province)?.name}.`
                      : `You're earning above the SA average for your role — well done! 🎉`
                    }
                  </p>
                </div>
              )}

              {/* Salary range card */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">{selectedRole.title} · {PROVINCES.find(p=>p.code===province)?.name} · {EXPERIENCE_BANDS.find(b=>b.value===experience)?.label}</span>
                </div>
                <p className="text-xs text-white/40 mb-5">SA market salary range (monthly, gross)</p>

                {/* Range bar */}
                <div className="relative mb-6">
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: "100%" }} />
                  </div>
                  {result.cur && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-lg"
                      style={{ left: `${Math.min(95, Math.max(2, ((result.cur - result.min) / (result.max - result.min)) * 100))}%` }}
                      title="Your salary"
                    />
                  )}
                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>{fmt(result.min)}</span>
                    <span className="text-white/70 font-semibold">Avg: {fmt(result.avg)}</span>
                    <span>{fmt(result.max)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Entry",   value: fmt(result.min), color: "text-white/60" },
                    { label: "Average", value: fmt(result.avg), color: "text-emerald-400" },
                    { label: "Senior",  value: fmt(result.max), color: "text-indigo-300" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-xl py-3">
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">/month</div>
                      <div className="text-[10px] text-white/40">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top provinces */}
              {topProvinces.length > 0 && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">Highest-paying provinces for this role</span>
                  </div>
                  <div className="space-y-2">
                    {topProvinces.map((p, i) => (
                      <div key={p.code} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 font-mono text-xs w-4">{i+1}</span>
                          <span className="text-white/80">{p.name}</span>
                        </div>
                        <span className="font-semibold text-emerald-400">{fmt(p.avg)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share + CTA */}
              <div className="flex gap-3">
                <button onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all">
                  <Share2 className="w-4 h-4" />
                  {copied ? "Copied!" : "Share result"}
                </button>
                <Link href="/sign-up"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-all">
                  Full salary report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Upsell teaser */}
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-5 text-center">
                <p className="text-sm text-white/60 mb-3">
                  <strong className="text-white">Sign up free</strong> to get your full Employability Score, personalised salary negotiation tips, CV analysis, and more.
                </p>
                <Link href="/sign-up"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
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
