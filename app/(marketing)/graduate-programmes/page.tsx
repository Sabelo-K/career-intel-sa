"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Clock, ExternalLink, Award,
  ChevronRight, Brain, Briefcase, GraduationCap, Filter,
} from "lucide-react";
import Link from "next/link";
import { GRADUATE_PROGRAMMES, SECTORS, type GraduateProgramme, type ProgrammeStatus } from "@/lib/data/graduate-programmes";

const STATUS_CONFIG: Record<ProgrammeStatus, { label: string; color: string; dot: string }> = {
  open:          { label: "Applications Open",    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  opening_soon:  { label: "Opening Soon",         color: "bg-amber-500/15 text-amber-300 border-amber-500/30",    dot: "bg-amber-400"   },
  closed:        { label: "Applications Closed",  color: "bg-white/5 text-white/40 border-white/10",              dot: "bg-white/20"    },
};

function StatusBadge({ status }: { status: ProgrammeStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ProgrammeCard({ prog }: { prog: GraduateProgramme }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-xl p-5 transition-colors ${
        prog.status === "open"
          ? "border-emerald-500/25 hover:border-emerald-500/40"
          : prog.status === "opening_soon"
          ? "border-amber-500/20 hover:border-amber-500/35"
          : "border-border hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-lg flex-shrink-0">
            {prog.emoji}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">{prog.company}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{prog.programme}</p>
          </div>
        </div>
        <StatusBadge status={prog.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-indigo-400" />
          {prog.sector}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-violet-400" />
          {prog.duration}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          {prog.provinces.slice(0, 2).join(", ")}{prog.provinces.length > 2 ? ` +${prog.provinces.length - 2}` : ""}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs">
          <span className="text-muted-foreground">Apply: </span>
          <span className="font-semibold text-foreground">{prog.applicationWindow}</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Intake: </span>
          <span className="font-semibold text-foreground">{prog.intake}</span>
        </div>
        <div className="text-xs font-semibold text-emerald-400">{prog.stipend}</div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {prog.degrees.slice(0, expanded ? undefined : 3).map((d) => (
          <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            {d}
          </span>
        ))}
        {!expanded && prog.degrees.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            +{prog.degrees.length - 3} more
          </button>
        )}
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 space-y-1"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Highlights</p>
          {prog.highlights.map((h) => (
            <div key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
              {h}
            </div>
          ))}
        </motion.div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : "View highlights"}
        </button>
        <div className="flex-1" />
        {prog.status !== "closed" && (
          <a
            href={prog.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Apply Now <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {prog.status === "closed" && (
          <a
            href={prog.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground text-xs font-medium transition-colors hover:text-foreground"
          >
            Company Site <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function GraduateProgrammesPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [status, setStatus] = useState<ProgrammeStatus | "all">("all");

  const filtered = useMemo(() => {
    return GRADUATE_PROGRAMMES.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.company.toLowerCase().includes(q) ||
        p.programme.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        p.degrees.some((d) => d.toLowerCase().includes(q));
      const matchesSector = sector === "all" || p.sector === sector;
      const matchesStatus = status === "all" || p.status === status;
      return matchesSearch && matchesSector && matchesStatus;
    }).sort((a, b) => {
      const order: Record<ProgrammeStatus, number> = { open: 0, opening_soon: 1, closed: 2 };
      return order[a.status] - order[b.status];
    });
  }, [search, sector, status]);

  const counts = useMemo(() => ({
    open:         GRADUATE_PROGRAMMES.filter((p) => p.status === "open").length,
    opening_soon: GRADUATE_PROGRAMMES.filter((p) => p.status === "opening_soon").length,
    closed:       GRADUATE_PROGRAMMES.filter((p) => p.status === "closed").length,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav bar */}
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
          <Link href="/salary-check" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Salary Check</Link>
          <Link href="/bursaries" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Bursaries</Link>
          <Link href="/sign-in" className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">Sign In</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <Award className="w-3.5 h-3.5" />
            SA Graduate Programmes 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Never Miss a Graduate Programme
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Track application windows for SA&apos;s top corporate graduate programmes.
            Updated quarterly — bookmark this page.
          </p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Applications Open",   count: counts.open,         color: "emerald", status: "open"          },
            { label: "Opening Soon",        count: counts.opening_soon, color: "amber",   status: "opening_soon"  },
            { label: "Closed for Now",      count: counts.closed,       color: "default", status: "closed"        },
          ].map((s) => (
            <button
              key={s.status}
              onClick={() => setStatus(status === s.status ? "all" : s.status as ProgrammeStatus)}
              className={`p-4 rounded-xl border text-left transition-all ${
                status === s.status
                  ? s.color === "emerald"
                    ? "bg-emerald-500/15 border-emerald-500/40"
                    : s.color === "amber"
                    ? "bg-amber-500/15 border-amber-500/40"
                    : "bg-white/10 border-white/25"
                  : "bg-card border-border hover:border-white/20"
              }`}
            >
              <div className={`text-2xl font-bold mb-0.5 ${
                s.color === "emerald" ? "text-emerald-400" :
                s.color === "amber"   ? "text-amber-400"   : "text-muted-foreground"
              }`}>{s.count}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search company, degree, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-secondary border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              <option value="all">All sectors</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        <p className="text-xs text-muted-foreground mb-4">{filtered.length} programme{filtered.length !== 1 ? "s" : ""} found</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((prog) => (
            <ProgrammeCard key={prog.id} prog={prog} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No programmes match your search.</p>
              <button onClick={() => { setSearch(""); setSector("all"); setStatus("all"); }} className="mt-2 text-xs text-indigo-400 hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-xl bg-secondary border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Important:</strong> Application dates and stipends change annually. Always verify on the company&apos;s official careers page before applying. CareerIntel SA is not affiliated with any of the listed companies.
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center">
          <h2 className="text-base font-semibold text-foreground mb-1">Want to stand out in your application?</h2>
          <p className="text-sm text-muted-foreground mb-4">Build your CV, run a skills gap analysis, and practice mock interviews — all free on CareerIntel SA.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
            Get Started Free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
