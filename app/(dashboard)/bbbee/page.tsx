"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Star, Info, CheckCircle2, AlertCircle, BarChart2, Award } from "lucide-react";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── B-BBEE sector classification ──────────────────────────────────────────────
// EE pressure = how strongly Employment Equity targets drive hiring in this sector
// Source: B-BBEE Codes of Good Practice + DHET EE Reports

const SECTOR_EE: Record<string, { pressure: "Very High" | "High" | "Medium" | "Growing"; color: string; note: string }> = {
  "Finance":             { pressure: "Very High", color: "#10b981", note: "FSC Charter targets 40%+ black representation at senior level" },
  "Legal":              { pressure: "Very High", color: "#10b981", note: "Legal Sector Charter mandates transformation at all levels"     },
  "Mining":             { pressure: "Very High", color: "#10b981", note: "Mining Charter: 50% black ownership, 38% senior management"    },
  "Energy":             { pressure: "Very High", color: "#10b981", note: "State-owned enterprises (Eskom, NERSA) have strict EE targets"  },
  "Government":         { pressure: "Very High", color: "#10b981", note: "Public Service Act mandates demographic representivity"         },
  "Healthcare":         { pressure: "High",      color: "#6366f1", note: "Scarce skills + EE targets create high demand for black professionals" },
  "Education":          { pressure: "High",      color: "#6366f1", note: "Department of Education prioritises EE in appointments"        },
  "Construction":       { pressure: "High",      color: "#6366f1", note: "Construction Charter: 40% black contractor participation"      },
  "Manufacturing":      { pressure: "High",      color: "#6366f1", note: "Dept of Trade & Industry B-BBEE scorecard applies"            },
  "Human Resources":    { pressure: "High",      color: "#6366f1", note: "HR professionals are themselves transformation champions"      },
  "Agriculture":        { pressure: "Medium",    color: "#f59e0b", note: "AgriBEE Charter in progress; rural development focus"         },
  "Technology":         { pressure: "Growing",   color: "#8b5cf6", note: "ICT B-BBEE sector code; digital economy driving demand"       },
  "Media & Creative":   { pressure: "Growing",   color: "#8b5cf6", note: "SABC, public media entities have strong EE requirements"      },
  "Logistics":          { pressure: "Growing",   color: "#8b5cf6", note: "Transnet and freight sector transformation underway"          },
  "Retail":             { pressure: "Medium",    color: "#f59e0b", note: "Retail Charter targets 35% black representation in management" },
  "Insurance":          { pressure: "High",      color: "#6366f1", note: "Long-term and short-term insurance charters apply"            },
};

const PRESSURE_ORDER = { "Very High": 0, "High": 1, "Growing": 2, "Medium": 3 };

const EE_BADGE = {
  "Very High": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  "High":      { bg: "bg-indigo-500/15",  text: "text-indigo-400",  border: "border-indigo-500/25"  },
  "Growing":   { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/25"  },
  "Medium":    { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25"   },
};

// Under-represented roles: where demand is high but supply of black professionals is low
const UNDER_REPRESENTED = [
  { role: "Chartered Accountant (CA SA)", sector: "Finance",    gap: "Critical", reason: "Only ~3,000 black CAs out of 40,000+ registered" },
  { role: "Software Engineer",            sector: "Technology",  gap: "High",     reason: "Black tech graduates underrepresented vs sector demand" },
  { role: "Actuary",                      sector: "Finance",    gap: "Critical", reason: "Fewer than 200 black actuaries in SA" },
  { role: "Data Scientist",               sector: "Technology",  gap: "High",     reason: "Growing demand; pipeline from universities still limited" },
  { role: "Attorney / Advocate",          sector: "Legal",      gap: "High",     reason: "Transformation targets drive demand for black legal talent" },
  { role: "Specialist Medical Doctors",   sector: "Healthcare", gap: "Critical", reason: "Black specialists scarce — strong EE hiring preference" },
  { role: "Electrical Engineer",          sector: "Engineering", gap: "High",     reason: "Engineering faculties producing fewer black graduates vs demand" },
  { role: "Chief Financial Officer",      sector: "Finance",    gap: "High",     reason: "FSC targets demand more black CFOs at listed companies" },
  { role: "Mining Engineer",              sector: "Mining",     gap: "High",     reason: "Mining Charter mandates transformation in technical roles" },
  { role: "Cloud Architect",             sector: "Technology",  gap: "Growing",  reason: "New discipline; opportunity to lead without legacy barriers" },
];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-foreground">{payload[0].value} careers tracked</div>
    </div>
  );
}

export default function BBBEEPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "sectors" | "roles" | "tips">("overview");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const sectorStats = useMemo(() => {
    const map: Record<string, { careers: typeof SA_CAREERS; eeData: typeof SECTOR_EE[string] | null }> = {};
    SA_CAREERS.forEach(c => {
      if (!map[c.sector]) map[c.sector] = { careers: [], eeData: SECTOR_EE[c.sector] ?? null };
      map[c.sector].careers.push(c);
    });
    return Object.entries(map)
      .map(([sector, { careers, eeData }]) => ({
        sector,
        count: careers.length,
        avgDemand: Math.round(careers.reduce((s, c) => s + c.demandScore, 0) / careers.length),
        eeData,
        topCareers: careers.sort((a, b) => b.demandScore - a.demandScore).slice(0, 4),
      }))
      .sort((a, b) => {
        const pa = PRESSURE_ORDER[(a.eeData?.pressure ?? "Medium")] ?? 3;
        const pb = PRESSURE_ORDER[(b.eeData?.pressure ?? "Medium")] ?? 3;
        return pa - pb;
      });
  }, []);

  const chartData = useMemo(() =>
    sectorStats
      .filter(s => s.eeData)
      .sort((a, b) => b.avgDemand - a.avgDemand)
      .slice(0, 12)
      .map(s => ({ sector: s.sector, demand: s.avgDemand, fill: s.eeData?.color ?? "#6b7280" })),
    [sectorStats]
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">B-BBEE Career Intelligence</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Broad-Based Black Economic Empowerment (B-BBEE) Employment Equity targets create measurable hiring advantages in specific sectors and roles. This guide shows you where that advantage is strongest in the SA job market.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          B-BBEE targets are designed to address historical inequality. This data is intended to help all South Africans — particularly those from historically disadvantaged backgrounds — understand where Employment Equity demand is strongest in the market.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: "overview",  label: "Overview",              icon: Award      },
          { key: "sectors",   label: "Sector EE Demand",      icon: BarChart2  },
          { key: "roles",     label: "Under-Represented Roles", icon: TrendingUp },
          { key: "tips",      label: "Career Strategy Tips",  icon: Star       },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Very High EE Demand sectors", value: sectorStats.filter(s => s.eeData?.pressure === "Very High").length, color: "text-emerald-400" },
              { label: "High EE Demand sectors",      value: sectorStats.filter(s => s.eeData?.pressure === "High").length,      color: "text-indigo-400" },
              { label: "Under-represented roles",     value: UNDER_REPRESENTED.length,                                           color: "text-amber-400"  },
              { label: "Critical talent gaps",        value: UNDER_REPRESENTED.filter(r => r.gap === "Critical").length,         color: "text-violet-400" },
            ].map(kpi => (
              <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Average Demand Score by Sector (EE-active sectors)
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sector" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} opacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["Very High", "High"] as const).flatMap(pressure =>
              sectorStats
                .filter(s => s.eeData?.pressure === pressure)
                .slice(0, 2)
                .map(s => {
                  const badge = EE_BADGE[pressure];
                  return (
                    <div key={s.sector} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground">{s.sector}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {pressure} EE
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{s.eeData?.note}</p>
                      <div className="flex flex-wrap gap-1">
                        {s.topCareers.map(c => (
                          <span key={c.id} className="text-[10px] bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded">{c.title}</span>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ── Sector EE Demand ─────────────────────────────────────────────────── */}
      {activeTab === "sectors" && (
        <div className="space-y-3">
          {sectorStats.map(s => {
            const pressure = s.eeData?.pressure ?? "Medium";
            const badge = EE_BADGE[pressure as keyof typeof EE_BADGE] ?? EE_BADGE["Medium"];
            const isSelected = selectedSector === s.sector;
            return (
              <motion.div key={s.sector} whileHover={{ y: -1 }}
                onClick={() => setSelectedSector(isSelected ? null : s.sector)}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-emerald-500/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">{s.sector}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {s.eeData?.pressure ?? "Unknown"} EE
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.count} roles · {s.avgDemand} demand</span>
                  </div>
                </div>
                {s.eeData && <p className="text-xs text-muted-foreground mt-1 ml-0">{s.eeData.note}</p>}
                {isSelected && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border">
                    <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide mb-2">Top roles in this sector</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {s.topCareers.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-2.5 py-1.5">
                          <span className="text-foreground">{c.title}</span>
                          <span className="font-bold text-emerald-400 ml-2">{c.demandScore}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Under-represented roles ──────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Roles where demand significantly outstrips the supply of black professionals — creating measurable hiring preference for candidates from designated groups.</p>
          <div className="space-y-3">
            {UNDER_REPRESENTED.map(r => (
              <div key={r.role} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{r.role}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        r.gap === "Critical" ? "bg-red-500/15 text-red-400 border-red-500/25" :
                        r.gap === "High"     ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                                               "bg-indigo-500/15 text-indigo-400 border-indigo-500/25"
                      }`}>{r.gap} gap</span>
                    </div>
                    <div className="text-xs text-muted-foreground/60 mb-1">{r.sector}</div>
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                  </div>
                  {r.gap === "Critical"
                    ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    : <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Career Strategy Tips ─────────────────────────────────────────────── */}
      {activeTab === "tips" && (
        <div className="space-y-4">
          {[
            {
              title: "Prioritise sectors with formal EE charters",
              body: "Finance, Mining, Legal, and Energy sectors all have legally binding transformation charters with specific numerical targets. These sectors are actively measured and penalised if they don't meet targets — making EE hiring a strategic imperative, not just a preference.",
              color: "border-emerald-500/25 bg-emerald-500/5",
              icon: CheckCircle2, iconColor: "text-emerald-400",
            },
            {
              title: "Target scarce-skills roles in EE-active sectors",
              body: "When a role is both scarce (high demand, low supply) AND in an EE-active sector, you're in the strongest possible negotiating position. Roles like Data Scientist, Software Engineer, Actuary, and CA(SA) in Finance or Mining give you double leverage.",
              color: "border-indigo-500/25 bg-indigo-500/5",
              icon: Star, iconColor: "text-indigo-400",
            },
            {
              title: "Build your B-BBEE narrative into your CV and interviews",
              body: "Don't leave it implicit. Mention your EE status on your CV where relevant. In interviews, speak confidently about your transformation contribution. Employers who are under pressure to meet targets will see this as a positive business case, not charity.",
              color: "border-amber-500/25 bg-amber-500/5",
              icon: Award, iconColor: "text-amber-400",
            },
            {
              title: "Negotiate using market data, not EE as the primary lever",
              body: "While B-BBEE creates demand, always negotiate primarily on your skills, market value, and contribution. Use the salary benchmarks in the Salary Checker tool to anchor negotiations. EE demand increases your leverage — it doesn't replace your value.",
              color: "border-violet-500/25 bg-violet-500/5",
              icon: TrendingUp, iconColor: "text-violet-400",
            },
            {
              title: "Government and state-owned entities have the strongest targets",
              body: "Public Service Act requirements mean government departments must reflect SA demographics. National, provincial, and municipal entities are among the most aggressive EE employers. Consider public sector roles if transformation is a priority for you.",
              color: "border-blue-500/25 bg-blue-500/5",
              icon: Users, iconColor: "text-blue-400",
            },
          ].map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`border rounded-xl p-5 ${tip.color}`}>
              <div className="flex items-start gap-3">
                <tip.icon className={`w-5 h-5 ${tip.iconColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
