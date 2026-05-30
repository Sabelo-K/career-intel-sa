"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Plus, Trash2, X, CheckCircle2, AlertCircle,
  MapPin, Coins, Wifi, WifiOff, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  { value: "",       label: "Any salary" },
  { value: "10000",  label: "R10 000+ / month" },
  { value: "20000",  label: "R20 000+ / month" },
  { value: "30000",  label: "R30 000+ / month" },
  { value: "50000",  label: "R50 000+ / month" },
  { value: "80000",  label: "R80 000+ / month" },
  { value: "120000", label: "R120 000+ / month" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function JobAlertsPage() {
  const [alerts,   setAlerts]   = useState<JobAlert[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
      showBanner("Job alert created! You'll be notified about matching opportunities.");
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
        {!showForm && alerts.length < 5 && (
          <Button variant="indigo" size="sm" className="gap-2 flex-shrink-0" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Alert
          </Button>
        )}
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
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } if (e.key === "Escape") setKwInput(""); }}
                  placeholder="e.g. Data Analyst, Python Developer, CA(SA)..."
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
                {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Zap className="w-3.5 h-3.5" /></motion.div> : <Bell className="w-3.5 h-3.5" />}
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
            Create an alert and we&apos;ll notify you when new opportunities matching your criteria appear in the SA job market.
          </p>
          <Button variant="indigo" size="sm" className="gap-2 mt-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-card border rounded-xl p-4 transition-all ${
                alert.isActive ? "border-border" : "border-border/50 opacity-60"
              }`}
            >
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
                  {/* Active toggle */}
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

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    disabled={deleting === alert.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {alerts.length >= 5 && (
            <p className="text-xs text-center text-muted-foreground py-2">
              You&apos;ve reached the maximum of 5 job alerts. Delete one to create another.
            </p>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          How Job Alerts Work
        </h3>
        <div className="space-y-2">
          {[
            "Set keywords matching roles you want — e.g. 'Data Analyst', 'Renewable Energy Engineer'",
            "Filter by province and minimum salary to match your location and expectations",
            "We'll notify you by email when new matching SA opportunities are posted",
            "Pause alerts when you're not actively searching without losing your settings",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-amber-200/80">
          <strong>Coming soon:</strong> Integration with PNet, CareerJunction, and LinkedIn SA for real-time job matching. You&apos;ll be notified when this is live.
        </div>
      </div>
    </div>
  );
}
