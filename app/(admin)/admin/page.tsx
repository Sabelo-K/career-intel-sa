"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BarChart2, Users, MessageCircle, TrendingUp, Activity,
  Shield, Database, Zap, Star, MessageSquare, RefreshCw,
  Target, GitBranch, Crown, CheckCircle2, DollarSign, Clock, AlertTriangle, CalendarClock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subscriber {
  name:          string;
  email:         string;
  planKey:       string;
  planExpiresAt: string | null;
  daysLeft:      number;
}

interface AdminStats {
  totalUsers:        number;
  premiumUsers:      number;
  activeToday:       number;
  newThisMonth:      number;
  cvCount:           number;
  chatMsgCount:      number;
  skillsCount:       number;
  pathCount:         number;
  growthData:        { month: string; users: number }[];
  topRoles:          { career: string; queries: number; color: string }[];
  featureUsage:      { type: string; count: number; color: string; pct: number }[];
  planBreakdown:     { graduate: number; professional: number; recruiter: number };
  revenueThisMonth:  number;
  revenueData:       { month: string; revenue: number; users: number }[];
  subscribers:       Subscriber[];
  expiringCount:     number;
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

// ── Plan Override Panel ───────────────────────────────────────────────────────

function PlanOverridePanel() {
  const [email,   setEmail]   = useState("");
  const [plan,    setPlan]    = useState("PREMIUM");
  const [planKey, setPlanKey] = useState("professional");
  const [days,    setDays]    = useState("30");
  const [result,  setResult]  = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy,    setBusy]    = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/set-plan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), plan, planKey: planKey || undefined, days: Number(days) || 30 }),
      });
      const d = await r.json();
      setResult({ ok: r.ok, msg: d.message ?? d.error ?? JSON.stringify(d) });
    } catch (e) {
      setResult({ ok: false, msg: String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Crown className="w-4 h-4 text-amber-400" />
        Manual Plan Override
        <span className="text-xs text-muted-foreground font-normal ml-1">— fix users whose PayFast ITN didn&apos;t fire</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Plan Tier</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="FREE">FREE</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="RECRUITER">RECRUITER</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Plan Key</label>
          <select
            value={planKey}
            onChange={(e) => setPlanKey(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="graduate">graduate (R29 once-off / R24 sub)</option>
            <option value="professional">professional (R79 once-off / R65 sub)</option>
            <option value="recruiter">recruiter (R499 once-off / R399 sub)</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex items-end gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Days from now</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min={1}
              max={365}
              className="w-24 h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <button
            onClick={submit}
            disabled={busy || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Apply Plan
          </button>
        </div>
      </div>

      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${result.ok ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border border-red-500/25 text-red-300"}`}>
          {result.ok
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {result.msg}
        </div>
      )}
    </div>
  );
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
          { label: "Total Users",    value: s?.totalUsers,       icon: Users,         color: "indigo",  prefix: ""  },
          { label: "Active Today",   value: s?.activeToday,      icon: Activity,      color: "emerald", prefix: ""  },
          { label: "Paid Users",     value: s?.premiumUsers,     icon: Shield,        color: "amber",   prefix: ""  },
          { label: "Revenue MTD",    value: s?.revenueThisMonth, icon: DollarSign,    color: "green",   prefix: "R" },
          { label: "Expiring Soon",  value: s?.expiringCount,    icon: AlertTriangle, color: "red",     prefix: ""  },
          { label: "CVs Uploaded",   value: s?.cvCount,          icon: Database,      color: "blue",    prefix: ""  },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              stat.color === "indigo"  ? "bg-indigo-500/15"  :
              stat.color === "emerald" ? "bg-emerald-500/15" :
              stat.color === "amber"   ? "bg-amber-500/15"   :
              stat.color === "violet"  ? "bg-violet-500/15"  :
              stat.color === "green"   ? "bg-green-500/15"   :
              stat.color === "red"     ? "bg-red-500/15"     :
              stat.color === "blue"    ? "bg-blue-500/15"    : "bg-pink-500/15"
            }`}>
              <stat.icon className={`w-4 h-4 ${
                stat.color === "indigo"  ? "text-indigo-400"  :
                stat.color === "emerald" ? "text-emerald-400" :
                stat.color === "amber"   ? "text-amber-400"   :
                stat.color === "violet"  ? "text-violet-400"  :
                stat.color === "green"   ? "text-green-400"   :
                stat.color === "red"     ? "text-red-400"     :
                stat.color === "blue"    ? "text-blue-400"    : "text-pink-400"
              }`} />
            </div>
            {loading
              ? <Skeleton className="h-7 w-16 mb-1" />
              : apiError
                ? <div className="text-xl font-bold text-red-400">—</div>
                : <div className="text-xl font-bold text-foreground">{stat.prefix}{(stat.value ?? 0).toLocaleString()}</div>
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

      {/* ── Revenue & Plan Breakdown ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Plan breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Paid Plan Breakdown
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Currently active paid users by plan tier</p>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (() => {
            const bd = s?.planBreakdown ?? { graduate: 0, professional: 0, recruiter: 0 };
            const total = bd.graduate + bd.professional + bd.recruiter || 1;
            const plans = [
              { key: "graduate",     label: "Graduate",     price: 49,  count: bd.graduate,     color: "bg-violet-500", textColor: "text-violet-300" },
              { key: "professional", label: "Professional", price: 99,  count: bd.professional, color: "bg-indigo-500", textColor: "text-indigo-300" },
              { key: "recruiter",    label: "Recruiter",    price: 499, count: bd.recruiter,     color: "bg-amber-500",  textColor: "text-amber-300"  },
            ];
            const totalRevenue = plans.reduce((sum, p) => sum + p.count * p.price, 0);
            return (
              <div className="space-y-3">
                {plans.map((p) => (
                  <div key={p.key}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${p.textColor}`}>{p.label}</span>
                        <span className="text-muted-foreground">R{p.price}/mo</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{p.count} user{p.count !== 1 ? "s" : ""}</span>
                        <span className="font-semibold text-foreground w-16 text-right">R{(p.count * p.price).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / total) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${p.color}`}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total active MRR</span>
                  <span className="font-bold text-green-400">R{totalRevenue.toLocaleString()}/mo</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Revenue trend */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Revenue Trend (last 6 months)
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Estimated ZAR revenue per month · based on plan prices</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={s?.revenueData ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}`} />
                <Tooltip
                  contentStyle={{ background: "rgba(13,21,38,0.97)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, fontSize: 12, color: "#e5e7eb" }}
                  labelStyle={{ color: "#86efac", fontWeight: 600 }}
                  itemStyle={{ color: "#e5e7eb" }}
                  formatter={(v: number) => [`R${v.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ fill: "#22c55e", r: 4 }}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {/* Month total annotation */}
          {!loading && s && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              <span>This month so far</span>
              <span className="font-semibold text-green-400">R{(s.revenueThisMonth ?? 0).toLocaleString()}</span>
            </div>
          )}
        </div>
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
                <Tooltip
                  contentStyle={{ background: "rgba(13,21,38,0.97)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8, fontSize: 12, color: "#e5e7eb" }}
                  labelStyle={{ color: "#a5b4fc", fontWeight: 600 }}
                  itemStyle={{ color: "#e5e7eb" }}
                />
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
                <Tooltip
                  contentStyle={{ background: "rgba(13,21,38,0.97)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8, fontSize: 12, color: "#e5e7eb" }}
                  labelStyle={{ color: "#a5b4fc", fontWeight: 600 }}
                  itemStyle={{ color: "#e5e7eb" }}
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                />
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

      {/* ── Active Subscribers ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-400" />
              Active Subscribers — Membership Expiry
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              All paid users sorted by days remaining · refresh for live data
            </p>
          </div>
          {s && s.expiringCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-300">
                {s.expiringCount} expiring within 7 days
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !s || s.subscribers.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No active paid subscribers yet — they will appear here once someone upgrades.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">User</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">Plan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-2 pr-4">Expires</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-2">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.subscribers.map((sub, i) => {
                  const urgent  = sub.daysLeft <= 3;
                  const warning = sub.daysLeft <= 7 && sub.daysLeft > 3;
                  const good    = sub.daysLeft > 14;
                  const expired = sub.daysLeft <= 0;

                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group"
                    >
                      {/* User */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-indigo-300">
                              {(sub.name?.[0] ?? "?").toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-foreground truncate max-w-[140px]">{sub.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{sub.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          sub.planKey === "recruiter"    ? "bg-amber-500/15 border-amber-500/25 text-amber-300" :
                          sub.planKey === "professional" ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-300" :
                                                          "bg-violet-500/15 border-violet-500/25 text-violet-300"
                        }`}>
                          {sub.planKey.charAt(0).toUpperCase() + sub.planKey.slice(1)}
                        </span>
                      </td>

                      {/* Expiry date */}
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted-foreground">
                          {sub.planExpiresAt
                            ? new Date(sub.planExpiresAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </span>
                      </td>

                      {/* Days left badge */}
                      <td className="py-3 text-right">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                            Expired
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            urgent  ? "bg-red-500/15 border-red-500/25 text-red-300" :
                            warning ? "bg-amber-500/15 border-amber-500/25 text-amber-300" :
                            good    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300" :
                                      "bg-indigo-500/15 border-indigo-500/25 text-indigo-300"
                          }`}>
                            {urgent  && <AlertTriangle className="w-2.5 h-2.5" />}
                            {warning && <Clock className="w-2.5 h-2.5" />}
                            {sub.daysLeft} day{sub.daysLeft !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
          {[
            { color: "bg-red-500",     label: "1–3 days — urgent"  },
            { color: "bg-amber-500",   label: "4–7 days — expiring soon" },
            { color: "bg-indigo-500",  label: "8–14 days"          },
            { color: "bg-emerald-500", label: "15+ days — healthy"  },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Manual plan override ────────────────────────────────────────────── */}
      <PlanOverridePanel />

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
