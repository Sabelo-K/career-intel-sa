"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, ChevronRight, Brain, Gift, Filter, CheckCircle2, BookOpen } from "lucide-react";
import Link from "next/link";
import { BURSARIES, BURSARY_FIELDS, FUNDER_TYPES, matchesBursaryField, type Bursary, type BursaryStatus, type FunderType } from "@/lib/data/bursaries";

const STATUS_CONFIG: Record<BursaryStatus, { label: string; color: string; dot: string }> = {
  open:         { label: "Open",         color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  opening_soon: { label: "Opening Soon", color: "bg-amber-500/15 text-amber-300 border-amber-500/30",    dot: "bg-amber-400"   },
  closed:       { label: "Closed",       color: "bg-white/5 text-white/40 border-white/10",              dot: "bg-white/20"    },
};

const TYPE_COLORS: Record<FunderType, string> = {
  government: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
  corporate:  "bg-violet-500/10 text-violet-300 border-violet-500/25",
  ngo:        "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
};
const TYPE_LABELS: Record<FunderType, string> = {
  government: "Government",
  corporate:  "Corporate",
  ngo:        "NGO",
};

function StatusBadge({ status }: { status: BursaryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function BursaryCard({ bursary }: { bursary: Bursary }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-xl p-5 transition-colors ${
        bursary.status === "open"
          ? "border-emerald-500/25 hover:border-emerald-500/40"
          : bursary.status === "opening_soon"
          ? "border-amber-500/20 hover:border-amber-500/35"
          : "border-border hover:border-white/15"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-lg flex-shrink-0">
            {bursary.emoji}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">{bursary.funder}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{bursary.name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={bursary.status} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${TYPE_COLORS[bursary.type]}`}>
            {TYPE_LABELS[bursary.type]}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
        <p className="text-xs text-muted-foreground">Value <span className="text-[10px] font-normal">(est.)</span></p>
        <p className="text-sm font-semibold text-emerald-300">{bursary.value}</p>
      </div>

      {/* Fields */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {bursary.fields.slice(0, expanded ? undefined : 3).map((f) => (
          <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            {f}
          </span>
        ))}
        {!expanded && bursary.fields.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground"
          >
            +{bursary.fields.length - 3} more
          </button>
        )}
      </div>

      {/* Deadline */}
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-muted-foreground">Application period:</span>
        <span className="font-semibold text-foreground">{bursary.deadline}</span>
      </div>

      {/* Expanded eligibility + highlights */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 space-y-3"
        >
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Eligibility</p>
            <div className="space-y-1">
              {bursary.eligibility.map((e) => (
                <div key={e} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {e}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Highlights</p>
            <div className="space-y-1">
              {bursary.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : "View eligibility"}
        </button>
        <div className="flex-1" />
        {bursary.applyUrl && (
          <a
            href={bursary.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              bursary.status === "open"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : bursary.status === "opening_soon"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {bursary.status === "closed" ? "Visit Website" : "Apply Now"}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function BursariesPage() {
  const [search, setSearch]   = useState("");
  const [field, setField]     = useState("all");
  const [type, setType]       = useState<FunderType | "all">("all");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = useMemo(() => {
    return BURSARIES.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.funder.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.fields.some((f) => f.toLowerCase().includes(q));
      const matchesField  = matchesBursaryField(b, field);
      const matchesType   = type === "all" || b.type === type;
      const matchesOpen   = !onlyOpen || b.status === "open" || b.status === "opening_soon";
      return matchesSearch && matchesField && matchesType && matchesOpen;
    }).sort((a, b) => {
      const order: Record<BursaryStatus, number> = { open: 0, opening_soon: 1, closed: 2 };
      return order[a.status] - order[b.status];
    });
  }, [search, field, type, onlyOpen]);

  const openCount = BURSARIES.filter((b) => b.status === "open").length;
  const soonCount = BURSARIES.filter((b) => b.status === "opening_soon").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-4 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">
            Career<span className="text-indigo-400">Intel</span>
            <span className="text-amber-400 text-xs ml-1">SA</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/graduate-programmes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Graduate Programmes</Link>
          <Link href="/salary-check" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Salary Check</Link>
          <Link href="/sign-in" className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">Sign In</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
            <Gift className="w-3.5 h-3.5" />
            SA Bursary Directory 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Find Funding for Your Studies
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {openCount} bursaries currently open · {soonCount} opening soon.
            From NSFAS to corporate bursaries — one place to find them all.
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by funder, field, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-secondary border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              <option value="all">All fields</option>
              {BURSARY_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FunderType | "all")}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-secondary border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              {FUNDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="rounded border-border accent-indigo-500"
            />
            <span className="text-sm text-muted-foreground">Show only open / opening soon</span>
          </label>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{filtered.length} bursari{filtered.length !== 1 ? "es" : "y"} found</span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => <BursaryCard key={b.id} bursary={b} />)}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bursaries match your filters.</p>
              <button onClick={() => { setSearch(""); setField("all"); setType("all"); setOnlyOpen(false); }} className="mt-2 text-xs text-indigo-400 hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-xl bg-secondary border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> Bursary values, stipend amounts, eligibility criteria, and deadlines change annually. Values shown are market estimates — actual amounts vary by funder and year. Always verify on the official funder website before applying. CareerIntel SA is not affiliated with any listed funders.
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 text-center">
          <h2 className="text-base font-semibold text-foreground mb-1">Preparing to apply? Stand out from the start.</h2>
          <p className="text-sm text-muted-foreground mb-4">Use CareerIntel SA to build your CV, identify your skills gaps, and practice mock interviews before your application.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
            Get Started Free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
