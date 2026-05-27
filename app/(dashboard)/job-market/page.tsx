"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  RadialBarChart, RadialBar, PieChart, Pie,
} from "recharts";
import { TrendingUp, TrendingDown, Globe, Zap, AlertTriangle, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SA_CAREERS, SA_SECTORS, SCARCE_SKILLS } from "@/lib/data/sa-careers";
import { SA_MARKET_STATS } from "@/lib/data/sa-provinces";
import { formatSalaryRange, getDemandBadgeColor, getTrendLabel, getAutomationRiskLabel } from "@/lib/utils";

// Shared tooltip style — dark background with white text for all charts
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(13,21,38,0.97)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 8,
    fontSize: 12,
    color: "#f1f5f9",
  },
  labelStyle: { color: "#cbd5e1", marginBottom: 4, fontWeight: 600 },
  itemStyle: { color: "#f1f5f9" },
  cursor: { fill: "rgba(99,102,241,0.08)" },
};

const PROVINCE_DATA = [
  { province: "WESTERN_CAPE", score: 78, label: "Western Cape", topOpportunity: "Tech Hub" },
  { province: "GAUTENG", score: 85, label: "Gauteng", topOpportunity: "Financial Centre" },
  { province: "KWAZULU_NATAL", score: 62, label: "KwaZulu-Natal", topOpportunity: "Port Logistics" },
  { province: "EASTERN_CAPE", score: 52, label: "Eastern Cape", topOpportunity: "Automotive" },
  { province: "FREE_STATE", score: 45, label: "Free State", topOpportunity: "Agriculture" },
  { province: "LIMPOPO", score: 48, label: "Limpopo", topOpportunity: "Mining" },
  { province: "MPUMALANGA", score: 55, label: "Mpumalanga", topOpportunity: "Energy" },
  { province: "NORTH_WEST", score: 44, label: "North West", topOpportunity: "Platinum Mining" },
  { province: "NORTHERN_CAPE", score: 58, label: "Northern Cape", topOpportunity: "Renewables" },
];

const SECTOR_PIE_DATA = [
  { name: "Technology", value: 28, fill: "#6366f1" },
  { name: "Healthcare", value: 20, fill: "#10b981" },
  { name: "Finance", value: 16, fill: "#f59e0b" },
  { name: "Engineering", value: 14, fill: "#8b5cf6" },
  { name: "Energy", value: 10, fill: "#06b6d4" },
  { name: "Other", value: 12, fill: "#6b7280" },
];

function DemandCard({ career }: { career: (typeof SA_CAREERS)[0] }) {
  const { label: automationLabel, color: automationColor } = getAutomationRiskLabel(career.automationRisk);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{career.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{career.sector}</p>
        </div>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${getDemandBadgeColor(career.demandScore)}`}>
          {career.demandScore}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Demand Score</span>
          <span className="text-foreground">{career.demandScore}/100</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${career.demandScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          <div className="text-muted-foreground">Salary Range</div>
          <div className="font-semibold text-foreground mt-0.5">{formatSalaryRange(career.minSalaryZar, career.maxSalaryZar)}</div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Trend</div>
          <div className={`font-medium mt-0.5 ${career.growthTrend === "DECLINING" ? "text-red-400" : career.growthTrend === "STABLE" ? "text-blue-400" : "text-emerald-400"}`}>
            {getTrendLabel(career.growthTrend)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-xs ${automationColor}`}>{automationLabel}</span>
        {career.remoteFriendly && <Badge variant="success" className="text-xs">Remote</Badge>}
        {career.internationalDemand && <Badge variant="indigo" className="text-xs">Global</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {career.topSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">{skill}</span>
        ))}
        {career.topSkills.length > 3 && (
          <span className="text-xs text-muted-foreground">+{career.topSkills.length - 3}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function JobMarketPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = SA_CAREERS
    .filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.sector.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ? true :
        filter === "remote" ? c.remoteFriendly :
        filter === "high-demand" ? c.demandScore >= 85 :
        filter === "growing" ? ["GROWING", "STRONG_GROWTH", "EXPLOSIVE_GROWTH"].includes(c.growthTrend) :
        filter === "low-risk" ? c.automationRisk < 30 : true;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Market Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time demand intelligence for South Africa&apos;s labour market · Updated Q4 2025
        </p>
      </div>

      {/* Market overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "National Unemployment", value: "32.9%", change: "Q3 2025", icon: AlertTriangle, color: "amber" },
          { label: "Youth Unemployment", value: "45.5%", change: "Ages 15-34", icon: TrendingDown, color: "red" },
          { label: "Tech Jobs Growth", value: "+28%", change: "YoY 2025", icon: TrendingUp, color: "emerald" },
          { label: "Remote Jobs Available", value: "18%", change: "of SA listings", icon: Globe, color: "indigo" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                stat.color === "amber" ? "bg-amber-500/15" :
                stat.color === "red" ? "bg-red-500/15" :
                stat.color === "emerald" ? "bg-emerald-500/15" : "bg-indigo-500/15"
              }`}>
                <stat.icon className={`w-3.5 h-3.5 ${
                  stat.color === "amber" ? "text-amber-400" :
                  stat.color === "red" ? "text-red-400" :
                  stat.color === "emerald" ? "text-emerald-400" : "text-indigo-400"
                }`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              stat.color === "emerald" ? "text-emerald-400" :
              stat.color === "red" ? "text-red-400" :
              stat.color === "amber" ? "text-amber-400" : "text-foreground"
            }`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.change}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="careers">
        <TabsList className="mb-5">
          <TabsTrigger value="careers">Career Demand</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
          <TabsTrigger value="scarce">Scarce Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="careers">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "high-demand", label: "High Demand" },
                { key: "growing", label: "Growing" },
                { key: "remote", label: "Remote" },
                { key: "low-risk", label: "Low AI Risk" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filter === f.key
                      ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((career) => (
              <DemandCard key={career.id} career={career} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Job Market Share by Sector</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={SECTOR_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SECTOR_PIE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Share"]}
                    {...TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SECTOR_PIE_DATA.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.fill }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Sector Growth Rates (YoY)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={SA_SECTORS} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Growth"]}
                    {...TOOLTIP_STYLE}
                  />
                  <Bar dataKey="growth" radius={4}>
                    {SA_SECTORS.map((entry, i) => (
                      <Cell key={i} fill={entry.growth > 0 ? "#6366f1" : "#ef4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="provinces">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">Opportunity Score by Province</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                A score out of 100 showing how many job opportunities, active employers, and growth sectors exist in each province. Higher = more jobs available right now.
              </p>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {[
                  { color: "bg-emerald-500", label: "High (70+) — Strong market" },
                  { color: "bg-indigo-500",  label: "Medium (55–69) — Decent prospects" },
                  { color: "bg-amber-500",   label: "Lower (below 55) — Fewer openings" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={PROVINCE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val, name) => [val, "Opportunity Score"]}
                    {...TOOLTIP_STYLE}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {PROVINCE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? "#10b981" : entry.score >= 55 ? "#6366f1" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Province Rankings</h3>
              <div className="space-y-3">
                {PROVINCE_DATA.sort((a, b) => b.score - a.score).map((p, i) => (
                  <div key={p.province} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate">{p.label}</span>
                        <span className="text-xs font-bold text-indigo-400">{p.score}</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full">
                        <div
                          className={`h-full rounded-full ${p.score >= 70 ? "bg-emerald-500" : p.score >= 55 ? "bg-indigo-500" : "bg-amber-500"}`}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.topOpportunity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scarce">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">DHET / SETA Scarce Skills 2025</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Skills identified as critically scarce in South Africa. Learning these can unlock bursaries, learnerships, and premium salaries.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SCARCE_SKILLS.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary border border-border text-xs text-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Highest Premium for Scarce Skills
                </h3>
                <div className="space-y-3">
                  {[
                    { skill: "AI/ML Engineering", premium: "+R45k/mo", demand: 95 },
                    { skill: "Cloud Architecture", premium: "+R35k/mo", demand: 91 },
                    { skill: "Cybersecurity", premium: "+R28k/mo", demand: 90 },
                    { skill: "Renewable Energy", premium: "+R25k/mo", demand: 91 },
                    { skill: "Data Science", premium: "+R22k/mo", demand: 94 },
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{item.skill}</div>
                        <div className="h-1 bg-secondary rounded-full mt-1">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.demand}%` }} />
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold ml-3">{item.premium}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-red-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  High Automation Risk Careers
                </h3>
                <div className="space-y-2">
                  {[
                    { career: "Data Entry Clerk", risk: 92 },
                    { career: "Bank Teller", risk: 88 },
                    { career: "Telemarketer", risk: 85 },
                    { career: "Bookkeeper", risk: 78 },
                    { career: "Payroll Administrator", risk: 72 },
                  ].map((item) => (
                    <div key={item.career} className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground flex-1">{item.career}</span>
                      <div className="w-24 h-1.5 bg-secondary rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${item.risk}%` }} />
                      </div>
                      <span className="text-red-400 font-medium w-8 text-right">{item.risk}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
