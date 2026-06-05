"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Plus, Trash2, X, CheckCircle2, AlertCircle,
  MapPin, Coins, Wifi, WifiOff, Zap, ExternalLink,
  RefreshCw, Briefcase, Building2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobAlert {
  id:        string;
  keywords:  string[];
  province:  string | null;
  minSalary: number | null;
  remote:    boolean | null;
  isActive:  boolean;
  createdAt: string;
}

interface AdzunaJob {
  id:          string;
  title:       string;
  company:     string;
  location:    string;
  salaryMin:   number | null;
  salaryMax:   number | null;
  description: string;
  url:         string;
  postedAt:    string;
}

interface MatchResult {
  alertId: string;
  jobs:    AdzunaJob[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PROVINCES = [
  { value: "GAUTENG",       label: "Gauteng"       },
  { value: "WESTERN_CAPE",  label: "Western Cape"  },
  { value: "KWAZULU_NATAL", label: "KwaZulu-Natal" },
  { value: "EASTERN_CAPE",  label: "Eastern Cape"  },
  { value: "FREE_STATE",    label: "Free State"    },
  { value: "LIMPOPO",       label: "Limpopo"       },
  { value: "MPUMALANGA",    label: "Mpumalanga"    },
  { value: "NORTH_WEST",    label: "North West"    },
  { value: "NORTHERN_CAPE", label: "Northern Cape" },
];

const PROVINCE_DISPLAY: Record<string, string> = Object.fromEntries(
  PROVINCES.map(({ value, label }) => [value, label])
);

const SALARY_OPTIONS = [
  { value: "",       label: "Any salary"          },
  { value: "10000",  label: "R10 000+ / month"    },
  { value: "20000",  label: "R20 000+ / month"    },
  { value: "30000",  label: "R30 000+ / month"    },
  { value: "50000",  label: "R50 000+ / month"    },
  { value: "80000",  label: "R80 000+ / month"    },
  { value: "120000", label: "R120 000+ / month"   },
];

// ── Live job card ──────────────────────────────────────────────────────────────

function JobCard({ job }: { job: AdzunaJob }) {
  const [expanded, setExpanded] = useState(false);

  const salary =
    job.salaryMin && job.salaryMax
      ? `R${Math.round(job.salaryMin / 1000)}k–R${Math.round(job.salaryMax / 1000)}k/mo`
      : job.salaryMin
      ? `From R${Math.round(job.salaryMin / 1000)}k/mo`
      : null;

  const daysAgo = job.postedAt
    ? Math.max(0, Math.round((Date.now() - new Date(job.postedAt).getTime()) / 86_400_000))
    : null;

  return (
    <div className="rounded-lg bg-background/60 border border-border/60 hover:border-indigo-500/30 transition-all overflow-hidden">
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">{job.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <Building2 className="w-2.5 h-2.5" />{job.company}
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />{job.location}
                  </span>
                </div>
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
              >
                Apply <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {salary && (
                <span className="text-[11px] font-medium text-emerald-400">{salary}</span>
              )}
              {daysAgo !== null && (
                <span className="text-[11px] text-muted-foreground/60">
                  {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
                </span>
              )}
              {job.description && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-0.5 transition-colors"
                >
                  {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                  {expanded ? "Less" : "Preview"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed pl-11">
                {job.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function JobAlertsPage() {
  const [alerts,            setAlerts]            = useState<JobAlert[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [success,           setSuccess]           = useState<string | null>(null);
  const [showForm,          setShowForm]          = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [deleting,          setDeleting]          = useState<string | null>(null);

  // Live job matches
  const [jobMatches,        setJobMatches]        = useState<Record<string, AdzunaJob[]>>({});
  const [matchesLoading,    setMatchesLoading]    = useState(false);
  const [adzunaConfigured,  setAdzunaConfigured]  = useState<boolean | null>(null);
  const [lastRefreshed,     setLastRefreshed]     = useState<Date | null>(null);

  // Form state
  const [keywords,  setKeywords]  = useState<string[]>([]);
  const [kwInput,   setKwInput]   = useState("");
  const [province,  setProvince]  = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [remote,    setRemote]    = useState<"any" | "remote" | "onsite">("any");

  // ── Fetch alerts ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/job-alerts")
      .then(r => r.json())
      .then(d => { setAlerts(d.alerts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Fetch live job matches ───────────────────────────────────────────────────
  const fetchMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      const res  = await fetch("/api/job-alerts/match");
      const data = await res.json() as { configured: boolean; results: MatchResult[] };
      setAdzunaConfigured(data.configured);
      if (data.configured) {
        const map: Record<string, AdzunaJob[]> = {};
        for (const r of data.results) map[r.alertId] = r.jobs;
        setJobMatches(map);
        setLastRefreshed(new Date());
      }
    } catch {
      // silently ignore — live matches are a bonus, not blocking
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  // Auto-fetch matches once alerts have loaded
  useEffect(() => {
    if (!loading && alerts.some(a => a.isActive)) {
      fetchMatches();
    } else if (!loading) {
      setAdzunaConfigured(null); // no active alerts — skip the check
    }
  }, [loading, alerts, fetchMatches]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const addKeyword = () => {
    const k = kwInput.trim();
    if (k && !keywords.includes(k) && keywords.length < 10) {
      setKeywords([...keywords, k]);
      setKwInput("");
    }
  };

  const resetForm = () => {
    setKeywords([]); setKwInput(""); setProvince("");
    setMinSalary(""); setRemote("any"); setShowForm(false);
  };

  const showBanner = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  // ── Create alert ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (keywords.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/job-alerts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          keywords,
          province:  province || undefined,
          minSalary: minSalary ? Number(minSalary) : undefined,
          remote:    remote === "remote" ? true : remote === "onsite" ? false : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create alert");
      setAlerts(prev => [data.alert, ...prev]);
      resetForm();
      showBanner("Job alert created! Searching for live matches…");
      // Re-fetch matches to include the new alert
      fetchMatches();
    } catch (err) {
      showBanner(err instanceof Error ? err.message : "Failed to create alert", true);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────────
  const handleToggle = async (id: string, isActive: boolean) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive } : a));
    try {
      await fetch("/api/job-alerts", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id, isActive }),
      });
      // Re-fetch matches whenever an alert is toggled on
      if (isActive) fetchMatches();
    } catch {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !isActive } : a));
    }
  };

  // ── Delete alert ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/job-alerts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAlerts(prev => prev.filter(a => a.id !== id));
      setJobMatches(prev => { const n = { ...prev }; delete n[id]; return n; });
      showBanner("Alert removed.");
    } catch {
      showBanner("Failed to delete alert", true);
    } finally {
      setDeleting(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Get notified when new SA jobs match your target role, province, and salary range.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {adzunaConfigured && alerts.some(a => a.isActive) && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={fetchMatches}
              disabled={matchesLoading}
              title="Refresh live job matches"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${matchesLoading ? "animate-spin" : ""}`} />
              {lastRefreshed
                ? `Updated ${lastRefreshed.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`
                : "Refresh"}
            </Button>
          )}
          {!showForm && alerts.length < 5 && (
            <Button variant="indigo" size="sm" className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              New Alert
            </Button>
          )}
        </div>
      </div>

      {/* Banners */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-card border border-indigo-500/30 rounded-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                Create New Alert
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Job Keywords <span className="text-red-400">*</span>
                <span className="ml-1 text-muted-foreground/60">({keywords.length}/10)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
                    if (e.key === "Escape") setKwInput("");
                  }}
                  placeholder="e.g. Data Analyst, Python Developer, CA(SA)…"
                  className="text-sm"
                />
                <Button size="sm" variant="indigo" onClick={addKeyword} disabled={!kwInput.trim() || keywords.length >= 10}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map(k => (
                    <Badge key={k} variant="indigo" className="gap-1 pr-1">
                      {k}
                      <button onClick={() => setKeywords(keywords.filter(kw => kw !== k))} className="ml-0.5 hover:text-red-300">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Province + salary row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <MapPin className="w-3 h-3 inline mr-1" />Province
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All provinces</option>
                  {PROVINCES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <Coins className="w-3 h-3 inline mr-1" />Min Salary (ZAR/mo)
                </label>
                <select
                  value={minSalary}
                  onChange={e => setMinSalary(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SALARY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remote preference */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Work Arrangement</label>
              <div className="flex gap-2">
                {(["any", "remote", "onsite"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setRemote(v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                      remote === v
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {v === "any" ? "Any" : v === "remote" ? "🏠 Remote" : "🏢 On-site"}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
              <Button variant="indigo" size="sm" className="flex-1 gap-2" onClick={handleCreate} disabled={keywords.length === 0 || saving}>
                {saving
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Zap className="w-3.5 h-3.5" /></motion.div>
                  : <Bell className="w-3.5 h-3.5" />
                }
                {saving ? "Creating…" : "Create Alert"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Loading alerts…
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7 text-indigo-400/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No job alerts yet</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create an alert and we&apos;ll surface matching SA job listings in real time.
          </p>
          <Button variant="indigo" size="sm" className="gap-2 mt-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => {
            const matches = jobMatches[alert.id] ?? [];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${
                  alert.isActive ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                {/* Alert header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {alert.keywords.map(k => (
                          <Badge key={k} variant="indigo" className="text-xs">{k}</Badge>
                        ))}
                      </div>
                      {/* Filters */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {alert.province && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {PROVINCE_DISPLAY[alert.province] ?? alert.province}
                          </span>
                        )}
                        {alert.minSalary && (
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            R{(alert.minSalary / 1000).toFixed(0)}k+/mo
                          </span>
                        )}
                        {alert.remote !== null && (
                          <span className="flex items-center gap-1">
                            {alert.remote ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {alert.remote ? "Remote only" : "On-site only"}
                          </span>
                        )}
                        <span className="text-muted-foreground/50">
                          Created {new Date(alert.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(alert.id, !alert.isActive)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          alert.isActive ? "bg-indigo-600" : "bg-secondary border border-border"
                        }`}
                        title={alert.isActive ? "Pause alert" : "Activate alert"}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          alert.isActive ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deleting === alert.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Live job matches ─────────────────────────────────────── */}
                {adzunaConfigured && alert.isActive && (
                  <div className="border-t border-border/50 bg-secondary/20 px-4 py-3 space-y-2">
                    {matchesLoading && matches.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Finding live matches…
                      </div>
                    ) : matches.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-1">
                        No live matches right now — we&apos;ll check again when you refresh.
                      </p>
                    ) : (
                      <>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {matches.length} Live Match{matches.length !== 1 ? "es" : ""}
                        </p>
                        <div className="space-y-1.5">
                          {matches.map(job => (
                            <JobCard key={job.id} job={job} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {alerts.length >= 5 && (
            <p className="text-xs text-center text-muted-foreground py-2">
              You&apos;ve reached the maximum of 5 job alerts. Delete one to create another.
            </p>
          )}
        </div>
      )}

      {/* How it works + attribution */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          How Job Alerts Work
        </h3>
        <div className="space-y-2">
          {[
            "Set keywords matching roles you want — e.g. 'Data Analyst', 'Renewable Energy Engineer'",
            "Filter by province and minimum salary to match your location and expectations",
            "Live matching jobs from across the SA market are shown below each active alert",
            "Pause alerts when you're not actively searching without losing your settings",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>

        {/* Government jobs — ESSA portal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🏛️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">Looking for government jobs?</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Search official Department of Labour vacancies on the <strong className="text-foreground">ESSA portal</strong> — South Africa&apos;s government employment service.
              </p>
            </div>
          </div>
          <a
            href="https://essa.labour.gov.za"
            target="_blank"
            rel="noopener noreferrer external"
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Search ESSA Jobs
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>

        {/* Source attribution — changes based on whether Adzuna is wired in */}
        {adzunaConfigured === false ? (
          <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-amber-200/80">
            <strong>Coming soon:</strong> Live job matching is ready — add your{" "}
            <code className="font-mono text-amber-300">ADZUNA_APP_ID</code> and{" "}
            <code className="font-mono text-amber-300">ADZUNA_APP_KEY</code> env vars (free at{" "}
            <a href="https://developer.adzuna.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100">
              developer.adzuna.com
            </a>
            ) to activate. Email notifications coming once our email system launches.
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/20 text-xs text-indigo-200/80">
            <span>
              Jobs sourced from the SA market via{" "}
              <a href="https://www.adzuna.co.za" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-indigo-100">
                Adzuna
              </a>
              . Results refresh hourly.
            </span>
            <span className="text-muted-foreground/50">Email alerts coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
