"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Briefcase, MapPin, TrendingUp, BarChart2, Zap, Star,
  Globe, Cpu, Users, ArrowUpRight, ChevronRight, Lock,
  Activity, Target, DollarSign, Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { formatSalaryRange } from "@/lib/utils";

// ── Province helpers ──────────────────────────────────────────────────────────

const PROVINCE_LABELS: Record<string, string> = {
  GAUTENG:        "Gauteng",
  WESTERN_CAPE:   "Western Cape",
  KWAZULU_NATAL:  "KwaZulu-Natal",
  EASTERN_CAPE:   "Eastern Cape",
  FREE_STATE:     "Free State",
  LIMPOPO:        "Limpopo",
  MPUMALANGA:     "Mpumalanga",
  NORTH_WEST:     "North West",
  NORTHERN_CAPE:  "Northern Cape",
};

const PROVINCE_CODES = Object.keys(PROVINCE_LABELS);

const GROWTH_LABELS: Record<string, string> = {
  EXPLOSIVE_GROWTH: "Explosive Growth",
  STRONG_GROWTH:    "Strong Growth",
  GROWING:          "Growing",
  STABLE:           "Stable",
  DECLINING:        "Declining",
};

const GROWTH_COLORS: Record<string, string> = {
  EXPLOSIVE_GROWTH: "#10b981",
  STRONG_GROWTH:    "#6366f1",
  GROWING:          "#8b5cf6",
  STABLE:           "#f59e0b",
  DECLINING:        "#ef4444",
};

const SECTOR_COLORS = [
  "#6366f1","#8b5cf6","#a78bfa","#10b981","#34d399","#f59e0b",
  "#f97316","#ef4444","#06b6d4","#0ea5e9","#ec4899","#84cc16",
];

function formatZar(n: number): string {
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `R${Math.round(n / 1_000)}k`;
  return `R${n}`;
}

// ── Analytics computed from SA_CAREERS ───────────────────────────────────────

function useRecruiterAnalytics() {
  return useMemo(() => {

    // 1 ── Province salary intelligence
    const provinceData = PROVINCE_CODES.map((code) => {
      const careers = SA_CAREERS.filter((c) => c.topProvinces.includes(code));
      if (careers.length === 0) return null;
      const avgSalary  = Math.round(careers.reduce((s, c) => s + c.avgSalaryZar, 0) / careers.length);
      const avgDemand  = Math.round(careers.reduce((s, c) => s + c.demandScore, 0) / careers.length);
      const topCareers = [...careers].sort((a, b) => b.demandScore - a.demandScore).slice(0, 5);
      const sectors    = [...new Set(careers.map((c) => c.sector))].slice(0, 4);
      return { code, name: PROVINCE_LABELS[code], avgSalary, avgDemand, topCareers, sectors, careerCount: careers.length };
    }).filter(Boolean) as NonNullable<ReturnType<typeof useRecruiterAnalytics>["provinceData"][0]>[];

    // 2 ── Skills demand (weighted by demandScore)
    const skillMap: Record<string, { score: number; count: number }> = {};
    SA_CAREERS.forEach((c) => {
      c.topSkills.forEach((skill) => {
        if (!skillMap[skill]) skillMap[skill] = { score: 0, count: 0 };
        skillMap[skill].score += c.demandScore;
        skillMap[skill].count += 1;
      });
    });
    const skillsDemand = Object.entries(skillMap)
      .map(([skill, { score, count }]) => ({ skill, weightedScore: score, count, avgScore: Math.round(score / count) }))
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 25);

    // 3 ── Sector analytics
    const sectorMap: Record<string, { careers: typeof SA_CAREERS }> = {};
    SA_CAREERS.forEach((c) => {
      if (!sectorMap[c.sector]) sectorMap[c.sector] = { careers: [] };
      sectorMap[c.sector].careers.push(c);
    });
    const sectorData = Object.entries(sectorMap)
      .map(([sector, { careers }]) => ({
        sector,
        count:     careers.length,
        avgDemand: Math.round(careers.reduce((s, c) => s + c.demandScore, 0) / careers.length),
        avgSalary: Math.round(careers.reduce((s, c) => s + c.avgSalaryZar, 0) / careers.length),
        remoteCount: careers.filter((c) => c.remoteFriendly).length,
      }))
      .sort((a, b) => b.avgDemand - a.avgDemand);

    // 4 ── Hiring trends
    const growthBreakdown = Object.entries(
      SA_CAREERS.reduce((acc, c) => {
        acc[c.growthTrend] = (acc[c.growthTrend] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([trend, count]) => ({ trend, label: GROWTH_LABELS[trend] ?? trend, count, color: GROWTH_COLORS[trend] ?? "#6b7280" }))
     .sort((a, b) => b.count - a.count);

    const top10Demand  = [...SA_CAREERS].sort((a, b) => b.demandScore - a.demandScore).slice(0, 10);
    const top10Salary  = [...SA_CAREERS].sort((a, b) => b.avgSalaryZar - a.avgSalaryZar).slice(0, 10);
    const remoteRoles  = SA_CAREERS.filter((c) => c.remoteFriendly).length;
    const intlRoles    = SA_CAREERS.filter((c) => c.internationalDemand).length;
    const scarceSkills = SA_CAREERS.filter((c) => c.demandScore >= 85);
    const automationRiskAvg = Math.round(SA_CAREERS.reduce((s, c) => s + c.automationRisk, 0) / SA_CAREERS.length);

    return { provinceData, skillsDemand, sectorData, growthBreakdown, top10Demand, top10Salary, remoteRoles, intlRoles, scarceSkills, automationRiskAvg };
  }, []);
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="font-semibold text-foreground">{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RecruiterHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"province" | "skills" | "analytics" | "trends">("province");
  const [planChecked, setPlanChecked] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const analytics = useRecruiterAnalytics();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setIsRecruiter(d.planKey === "recruiter");
        setPlanChecked(true);
      })
      .catch(() => setPlanChecked(true));
  }, []);

  // ── Plan gate ───────────────────────────────────────────────────────────────
  if (!planChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isRecruiter) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Recruiter Hub</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Province salary benchmarking, skills demand intelligence, market analytics and SA hiring trend reports are exclusive to the <strong className="text-amber-400">Recruiter plan</strong>.
          </p>
        </div>
        <Button variant="indigo" className="gap-2 mx-auto" onClick={() => router.push("/upgrade")}>
          <Zap className="w-4 h-4" /> Upgrade to Recruiter — R399/mo
        </Button>
        <p className="text-xs text-muted-foreground">Or R499 once-off · 30-day access · no auto-renewal</p>
      </div>
    );
  }

  const allSectors = ["all", ...new Set(SA_CAREERS.map((c) => c.sector))].sort();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Recruiter Hub</h1>
          <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full font-semibold ml-1">Recruiter Plan</span>
        </div>
        <p className="text-muted-foreground text-sm">
          SA market intelligence for HR & talent teams — province salary benchmarks, skills demand, sector analytics, and hiring trend reports.
          Data sourced from {SA_CAREERS.length} SA careers across {analytics.sectorData.length} sectors.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Briefcase,  label: "SA Careers Tracked",   value: SA_CAREERS.length,                          color: "text-indigo-400"  },
          { icon: MapPin,     label: "Provinces Covered",     value: analytics.provinceData.length,              color: "text-emerald-400" },
          { icon: Zap,        label: "Scarce-Skill Roles",    value: analytics.scarceSkills.length,              color: "text-amber-400"   },
          { icon: Globe,      label: "Remote-Friendly Roles", value: `${analytics.remoteRoles} / ${SA_CAREERS.length}`, color: "text-violet-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: "province",  label: "Province Salary",    icon: MapPin      },
          { key: "skills",    label: "Skills Demand",       icon: Target      },
          { key: "analytics", label: "Market Analytics",    icon: BarChart2   },
          { key: "trends",    label: "Hiring Trends",       icon: TrendingUp  },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Province Salary Intelligence ─────────────────────────────────────── */}
      {activeTab === "province" && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Average salaries computed across all careers with significant hiring presence in each province. Click a province for a detailed breakdown.
          </p>

          {/* Province salary bar chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Average Monthly Salary by Province (ZAR)
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.provinceData.sort((a, b) => b.avgSalary - a.avgSalary)} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => formatZar(v)} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip prefix="R" />} />
                <Bar dataKey="avgSalary" radius={[4, 4, 0, 0]}>
                  {analytics.provinceData.sort((a, b) => b.avgSalary - a.avgSalary).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f59e0b" : "#6366f1"} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Province cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {analytics.provinceData
              .sort((a, b) => b.avgSalary - a.avgSalary)
              .map((prov) => (
                <motion.div
                  key={prov.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedProvince(selectedProvince === prov.code ? null : prov.code)}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedProvince === prov.code
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{prov.name}</h3>
                      <p className="text-xs text-muted-foreground">{prov.careerCount} tracked roles</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-amber-400">{formatZar(prov.avgSalary)}</div>
                      <div className="text-[10px] text-muted-foreground">avg/month</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${prov.avgDemand}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{prov.avgDemand} demand</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {prov.sectors.map((s) => (
                      <span key={s} className="text-[10px] bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>

                  {selectedProvince === prov.code && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-border pt-3 space-y-1.5"
                    >
                      <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide mb-2">Top Roles in {prov.name}</div>
                      {prov.topCareers.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.demandScore >= 85 ? "bg-emerald-400" : "bg-indigo-400"} flex-shrink-0`} />
                            <span className="text-foreground">{c.title}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{formatZar(c.avgSalaryZar)}/mo</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* ── Skills Demand Dashboard ──────────────────────────────────────────── */}
      {activeTab === "skills" && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Skills ranked by weighted demand score — how often a skill appears across high-demand roles. Use this to write better job adverts and identify scarce talent pools.
          </p>

          {/* Sector filter */}
          <div className="flex flex-wrap gap-2">
            {allSectors.map((s) => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium capitalize ${
                  sectorFilter === s
                    ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-indigo-500/30"
                }`}
              >
                {s === "all" ? "All Sectors" : s}
              </button>
            ))}
          </div>

          {/* Skills bar chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Top 25 In-Demand Skills (Weighted Score)
            </h2>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                layout="vertical"
                data={(() => {
                  if (sectorFilter === "all") return analytics.skillsDemand;
                  const filtered = SA_CAREERS.filter((c) => c.sector === sectorFilter);
                  const sm: Record<string, number> = {};
                  filtered.forEach((c) => c.topSkills.forEach((sk) => { sm[sk] = (sm[sk] || 0) + c.demandScore; }));
                  return Object.entries(sm).map(([skill, weightedScore]) => ({ skill, weightedScore })).sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 25);
                })()}
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<ChartTooltip suffix=" pts" />} />
                <Bar dataKey="weightedScore" radius={[0, 4, 4, 0]}>
                  {analytics.skillsDemand.map((_, i) => (
                    <Cell key={i} fill={`hsl(${240 + i * 4}, 70%, 65%)`} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Skills Intelligence Table</h2>
              <span className="text-xs text-muted-foreground">Top 25 by weighted demand</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">#</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Skill</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Roles Requiring</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Avg Demand</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Weighted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.skillsDemand.map((s, i) => (
                    <tr key={s.skill} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{s.skill}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{s.count}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{s.avgScore}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-semibold text-indigo-300">{s.weightedScore}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Market Analytics ─────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Sector-level market breakdown. Average demand scores and salaries are computed across all tracked careers in each sector.
          </p>

          {/* Demand vs Salary scatter (bar chart per sector) */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Average Demand Score by Sector
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Higher score = harder to fill roles = stronger candidate leverage</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.sectorData} margin={{ top: 0, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sector" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip suffix=" / 100" />} />
                <Bar dataKey="avgDemand" radius={[4, 4, 0, 0]}>
                  {analytics.sectorData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avg salary by sector */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Average Monthly Salary by Sector (ZAR)
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[...analytics.sectorData].sort((a, b) => b.avgSalary - a.avgSalary)} margin={{ top: 0, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sector" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" />
                <YAxis tickFormatter={(v) => formatZar(v)} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip prefix="R" />} />
                <Bar dataKey="avgSalary" radius={[4, 4, 0, 0]}>
                  {analytics.sectorData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Full Sector Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Sector</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Roles</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Avg Demand</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Avg Salary/mo</th>
                    <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Remote-Friendly</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.sectorData.map((s, i) => (
                    <tr key={s.sector} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-sm" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                          <span className="font-medium text-foreground">{s.sector}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{s.count}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-semibold ${s.avgDemand >= 80 ? "text-emerald-400" : s.avgDemand >= 65 ? "text-indigo-300" : "text-muted-foreground"}`}>
                          {s.avgDemand}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatZar(s.avgSalary)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{s.remoteCount} / {s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Hiring Trends ────────────────────────────────────────────────────── */}
      {activeTab === "trends" && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            SA hiring trend signals derived from demand scores, growth trajectories, and automation risk across all tracked roles.
          </p>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Zap,    label: "Explosive-Growth Roles", value: analytics.growthBreakdown.find(g => g.trend === "EXPLOSIVE_GROWTH")?.count ?? 0, color: "text-emerald-400" },
              { icon: Globe,  label: "International Demand",   value: analytics.intlRoles,       color: "text-indigo-400"  },
              { icon: Cpu,    label: "Avg Automation Risk",    value: `${analytics.automationRiskAvg}%`, color: "text-amber-400" },
              { icon: Award,  label: "Scarce-Skill Roles (85+)", value: analytics.scarceSkills.length, color: "text-violet-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Growth trend pie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Growth Trend Distribution
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.growthBreakdown}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {analytics.growthBreakdown.map((g, i) => (
                      <Cell key={i} fill={g.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} roles`, name]} />
                  <Legend formatter={(value) => <span style={{ fontSize: 10, color: "#9ca3af" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Scarce skills list */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Scarce-Skill Roles (Demand 85+)
              </h2>
              <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1">
                {analytics.scarceSkills.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-foreground">{c.title}</span>
                      <span className="text-muted-foreground/60">{c.sector}</span>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono">{c.demandScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 10 demand */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Top 10 Highest-Demand Roles in SA
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Hardest roles to fill — strongest employer competition for candidates</p>
            <div className="space-y-2">
              {analytics.top10Demand.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-foreground">{c.title}</span>
                      <span className="text-xs text-muted-foreground">{c.sector} · {formatZar(c.avgSalaryZar)}/mo</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.demandScore}%`, background: `hsl(${240 - i * 10}, 70%, 65%)` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground font-mono w-7 text-right">{c.demandScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 salary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Top 10 Highest-Paying Roles in SA
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Average monthly salary — use for salary benchmarking and offer competitiveness</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.top10Salary.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 bg-secondary rounded-xl px-3 py-2.5">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{c.sector}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-amber-400">{formatZar(c.avgSalaryZar)}</div>
                    <div className="text-[10px] text-muted-foreground">avg/mo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* International demand */}
          <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Roles with International Demand ({analytics.intlRoles} roles)
            </h2>
            <p className="text-xs text-muted-foreground mb-4">SA candidates in these roles are also sought by offshore employers — affects local retention risk</p>
            <div className="flex flex-wrap gap-2">
              {SA_CAREERS.filter((c) => c.internationalDemand)
                .sort((a, b) => b.demandScore - a.demandScore)
                .map((c) => (
                  <span
                    key={c.id}
                    className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full"
                  >
                    {c.title}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
