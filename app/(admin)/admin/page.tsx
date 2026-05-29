"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarChart2, Users, MessageCircle, TrendingUp, Activity, Shield, Database, Zap, Star, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";

const MOCK_STATS = {
  totalUsers: 4821,
  activeToday: 312,
  premiumUsers: 487,
  aiQueries: 18543,
  cvAnalysed: 2904,
  careerSimulations: 1238,
};

const USER_GROWTH = [
  { month: "Aug", users: 1200 },
  { month: "Sep", users: 1850 },
  { month: "Oct", users: 2600 },
  { month: "Nov", users: 3400 },
  { month: "Dec", users: 4200 },
  { month: "Jan", users: 4821 },
];

const POPULAR_CAREERS = [
  { career: "Data Scientist", queries: 842, color: "#6366f1" },
  { career: "Software Engineer", queries: 698, color: "#8b5cf6" },
  { career: "Cloud Architect", queries: 534, color: "#10b981" },
  { career: "Cybersecurity", queries: 467, color: "#f59e0b" },
  { career: "AI/ML Engineer", queries: 389, color: "#ef4444" },
];

const QUERY_TYPES = [
  { type: "CV Analysis", count: 2904, pct: 32 },
  { type: "Career Coach Chat", count: 1854, pct: 21 },
  { type: "Skills Gap", count: 1432, pct: 16 },
  { type: "Career Paths", count: 1238, pct: 14 },
  { type: "Interview Prep", count: 980, pct: 11 },
  { type: "Other", count: 540, pct: 6 },
];

interface FeedbackStats {
  total: number;
  avgRating: number;
  byFeature: { feature: string; avg: number; count: number }[];
  distribution: { star: number; count: number }[];
  recent: { id: string; rating: number; comment: string | null; feature: string; name: string; createdAt: string }[];
}

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
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}

export default function AdminPage() {
  const [csat, setCsat] = useState<FeedbackStats | null>(null);

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => { if (d.total !== undefined) setCsat(d); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform analytics and intelligence monitoring</p>
        </div>
        <Badge variant="indigo" className="gap-1.5">
          <Activity className="w-3 h-3" />
          Live
        </Badge>
      </div>

      {/* ── CSAT Section ─────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Customer Satisfaction (CSAT)
          </h2>
          {csat && (
            <Badge variant="indigo">{csat.total} response{csat.total !== 1 ? "s" : ""}</Badge>
          )}
        </div>

        {!csat || csat.total === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback yet — ratings will appear here after users submit them.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Overall score */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="text-5xl font-bold text-foreground">{csat.avgRating.toFixed(1)}</div>
              <StarRow rating={Math.round(csat.avgRating)} />
              <p className="text-xs text-muted-foreground">Overall CSAT out of 5</p>
            </div>

            {/* Distribution bar */}
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => {
                const entry = csat.distribution.find((d) => d.star === star);
                const count = entry?.count ?? 0;
                const pct   = csat.total > 0 ? Math.round((count / csat.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
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
              {csat.byFeature
                .sort((a, b) => b.avg - a.avg)
                .map((f) => (
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

        {/* Recent comments */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: MOCK_STATS.totalUsers.toLocaleString(), icon: Users, color: "indigo" },
          { label: "Active Today", value: MOCK_STATS.activeToday, icon: Activity, color: "emerald" },
          { label: "Premium Users", value: MOCK_STATS.premiumUsers, icon: Shield, color: "amber" },
          { label: "AI Queries", value: MOCK_STATS.aiQueries.toLocaleString(), icon: MessageCircle, color: "violet" },
          { label: "CVs Analysed", value: MOCK_STATS.cvAnalysed.toLocaleString(), icon: Database, color: "blue" },
          { label: "Simulations", value: MOCK_STATS.careerSimulations.toLocaleString(), icon: Zap, color: "pink" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              stat.color === "indigo" ? "bg-indigo-500/15" :
              stat.color === "emerald" ? "bg-emerald-500/15" :
              stat.color === "amber" ? "bg-amber-500/15" :
              stat.color === "violet" ? "bg-violet-500/15" :
              stat.color === "blue" ? "bg-blue-500/15" : "bg-pink-500/15"
            }`}>
              <stat.icon className={`w-4 h-4 ${
                stat.color === "indigo" ? "text-indigo-400" :
                stat.color === "emerald" ? "text-emerald-400" :
                stat.color === "amber" ? "text-amber-400" :
                stat.color === "violet" ? "text-violet-400" :
                stat.color === "blue" ? "text-blue-400" : "text-pink-400"
              }`} />
            </div>
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User growth */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            User Growth (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={USER_GROWTH}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular career queries */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Top Career Queries
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={POPULAR_CAREERS} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="career" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="queries" radius={4}>
                {POPULAR_CAREERS.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Query breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">AI Feature Usage Breakdown</h3>
        <div className="space-y-3">
          {QUERY_TYPES.map((q) => (
            <div key={q.type} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-36">{q.type}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${q.pct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
              <span className="text-sm font-medium text-foreground w-16 text-right">{q.count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground w-10 text-right">{q.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
