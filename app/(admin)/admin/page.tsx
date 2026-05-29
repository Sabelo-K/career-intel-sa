"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BarChart2, Users, MessageCircle, TrendingUp, Activity,
  Shield, Database, Zap, Star, MessageSquare, RefreshCw,
  Target, GitBranch,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers:   number;
  premiumUsers: number;
  activeToday:  number;
  newThisMonth: number;
  cvCount:      number;
  chatMsgCount: number;
  skillsCount:  number;
  pathCount:    number;
  growthData:   { month: string; users: number }[];
  topRoles:     { career: string; queries: number; color: string }[];
  featureUsage: { type: string; count: number; color: string; pct: number }[];
}

interface FeedbackStats {
  total:       number;
  avgRating:   number;
  byFeature:   { feature: string; avg: number; count: number }[];
  distribution: { star: number; count: number }[];
  recent:      { id: string; rating: number; comment: string | null; feature: string; name: string; createdAt: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FEATURE_LABEL: Record<string, string> = {
  "cv-builder":   "CV Builder",
  "career-coach": "Career Coach",
  "skills-gap":   "Skills Gap",
  "career-paths": "Career Paths",
  "general":      "General",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary rounded ${className}`} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats,     setStats]     = useState<AdminStats | null>(null);
  const [csat,      setCsat]      = useState<FeedbackStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = () => {
    setLoading(true);
    setApiError(null);
    Promise.all([
      fetch("/api/admin/stats").then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail ?? data.error ?? `HTTP ${r.status}`);
        return data;
      }),
      fetch("/api/feedback").then((r) => r.json()),
    ])
      .then(([s, f]) => {
        setStats(s);
        if (f.total !== undefined) setCsat(f);
        setLastRefreshed(new Date());
      })
      .catch((err) => {
        console.error(err);
        setApiError(String(err?.message ?? err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const s = stats;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real platform data · last updated {lastRefreshed.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Badge variant="indigo" className="gap-1.5">
            <Activity className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* ── API error banner ─────────────────────────────────────────────── */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm">
          <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">Stats API error — check server logs</p>
            <p className="text-red-400/70 text-xs mt-0.5 font-mono break-all">{apiError}</p>
          </div>
        </div>
      )}

      {/* ── CSAT ──────────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Customer Satisfaction (CSAT)
          </h2>
          {csat && <Badge variant="indigo">{csat.total} response{csat.total !== 1 ? "s" : ""}</Badge>}
        </div>

        {!csat || csat.total === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback yet — ratings will appear here after users submit them.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Overall */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="text-5xl font-bold text-foreground">{csat.avgRating.toFixed(1)}</div>
              <StarRow rating={Math.round(csat.avgRating)} />
              <p className="text-xs text-muted-foreground">Overall CSAT out of 5</p>
            </div>
            {/* Distribution */}
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => {
                const count = csat.distribution.find((d) => d.star === star)?.count ?? 0;
                const pct   = csat.total > 0 ? Math.round((count / csat.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                    <span className="text-muted-foreground w-7 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
            {/* Per-feature */}
            <div className="space-y-2">
              {csat.byFeature.sort((a, b) => b.avg - a.avg).map((f) => (
                <div key={f.feature} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{FEATURE_LABEL[f.feature] ?? f.feature}</span>
                  <div className="flex items-center gap-1.5">
                    <StarRow rating={Math.round(f.avg)} />
                    <span className="text-foreground font-medium">{f.avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">({f.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {csat && csat.recent.length > 0 && (
          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Recent Comments
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {csat.recent.map((r) => (
                <div key={r.id} className="bg-secondary rounded-lg px-3 py-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-indigo-300">{FEATURE_LABEL[r.feature] ?? r.feature}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Users",    value: s?.totalUsers,   icon: Users,         color: "indigo"  },
          { label: "Active Today",   value: s?.activeToday,  icon: Activity,      color: "emerald" },
          { label: "Paid Users",     value: s?.premiumUsers, icon: Shield,        color: "amber"   },
          { label: "AI Messages",    value: s?.chatMsgCount, icon: MessageCircle, color: "violet"  },
          { label: "CVs Uploaded",   value: s?.cvCount,      icon: Database,      color: "blue"    },
          { label: "Simulations",    value: s?.pathCount,    icon: Zap,           color: "pink"    },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              stat.color === "indigo"  ? "bg-indigo-500/15"  :
              stat.color === "emerald" ? "bg-emerald-500/15" :
              stat.color === "amber"   ? "bg-amber-500/15"   :
              stat.color === "violet"  ? "bg-violet-500/15"  :
              stat.color === "blue"    ? "bg-blue-500/15"    : "bg-pink-500/15"
            }`}>
              <stat.icon className={`w-4 h-4 ${
                stat.color === "indigo"  ? "text-indigo-400"  :
                stat.color === "emerald" ? "text-emerald-400" :
                stat.color === "amber"   ? "text-amber-400"   :
                stat.color === "violet"  ? "text-violet-400"  :
                stat.color === "blue"    ? "text-blue-400"    : "text-pink-400"
              }`} />
            </div>
            {loading
              ? <Skeleton className="h-7 w-16 mb-1" />
              : apiError
                ? <div className="text-xl font-bold text-red-400">—</div>
                : <div className="text-xl font-bold text-foreground">{(stat.value ?? 0).toLocaleString()}</div>
            }
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Secondary stat row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "New This Month", value: s?.newThisMonth, icon: TrendingUp, color: "emerald",  desc: "new sign-ups"       },
          { label: "Skills Analyses", value: s?.skillsCount, icon: Target,     color: "violet",   desc: "total completed"    },
          { label: "Career Paths",    value: s?.pathCount,   icon: GitBranch,  color: "amber",    desc: "simulations run"    },
          { label: "AI Messages",     value: s?.chatMsgCount,icon: MessageCircle, color: "indigo", desc: "user messages sent" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${
                stat.color === "emerald" ? "text-emerald-400" :
                stat.color === "violet"  ? "text-violet-400"  :
                stat.color === "amber"   ? "text-amber-400"   : "text-indigo-400"
              }`} />
            </div>
            {loading
              ? <Skeleton className="h-8 w-20 mb-1" />
              : apiError
                ? <div className="text-2xl font-bold text-red-400">—</div>
                : <div className="text-2xl font-bold text-foreground">{(stat.value ?? 0).toLocaleString()}</div>
            }
            <div className="text-xs text-muted-foreground mt-1">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* User growth */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            New Sign-ups (last 6 months)
          </h3>
          <p className="text-xs text-muted-foreground mb-4">New accounts created per month</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={s?.growthData ?? []}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} name="New users" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top target roles */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Most Searched Career Roles
          </h3>
          <p className="text-xs text-muted-foreground mb-4">From Skills Gap + Career Path analyses</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (s?.topRoles ?? []).length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No career searches yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={s?.topRoles ?? []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="career" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="queries" radius={4} name="Searches">
                  {(s?.topRoles ?? []).map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Feature usage breakdown ───────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">AI Feature Usage Breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">Actual usage counts across all platform features</p>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(s?.featureUsage ?? []).map((q) => (
              <div key={q.type} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-36">{q.type}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${q.pct}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${q.color}`}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-16 text-right">{q.count.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{q.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
