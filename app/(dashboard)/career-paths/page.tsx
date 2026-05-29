"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import {
  GitBranch, TrendingUp, Award, Zap, ChevronRight,
  Clock, Target, Sparkles, Star, ArrowRight, AlertCircle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatSalary } from "@/lib/utils";
import { OutOfCreditsModal } from "@/components/out-of-credits-modal";

const MOCK_SIMULATION = {
  currentRole: "Junior Software Developer",
  targetRole: "Engineering Manager",
  timeframeYears: 7,
  promotionProbability: 72,
  summary: "With your current trajectory, transitioning from Junior Developer to Engineering Manager in 7 years is highly achievable in the SA tech market, especially in Gauteng and Western Cape where demand for engineering leaders is strong. Key milestones: mid-level (Year 2), senior (Year 4), tech lead (Year 5.5), manager (Year 7).",
  milestones: [
    { year: 1, role: "Junior Software Developer", salary: 28000, skills: ["React", "Node.js", "Git"], achievement: "First production deployment. Building foundational skills. Contributing to sprint goals." },
    { year: 2, role: "Mid-Level Developer", salary: 42000, skills: ["TypeScript", "System Design", "Testing"], achievement: "Promoted after strong performance. Leading small features. Mentoring interns." },
    { year: 3, role: "Mid-Level Developer (L3)", salary: 55000, skills: ["Cloud (AWS)", "CI/CD", "Agile"], achievement: "Specialised in cloud architecture. Leading cross-team integrations. Receiving above-average reviews." },
    { year: 4, role: "Senior Software Engineer", salary: 72000, skills: ["Architecture", "Technical Leadership", "Code Review"], achievement: "Promoted to Senior. Driving major technical decisions. Architecting features from scratch." },
    { year: 5, role: "Senior Engineer → Tech Lead", salary: 88000, skills: ["Engineering Strategy", "Team Leadership", "Product Understanding"], achievement: "Taking on technical leadership for a squad. Mentoring juniors. Driving team technical roadmap." },
    { year: 6, role: "Principal / Staff Engineer", salary: 105000, skills: ["Engineering Culture", "Hiring", "Cross-team Strategy"], achievement: "Influencing engineering-wide decisions. Leading hiring panels. Representing engineering to C-suite." },
    { year: 7, role: "Engineering Manager", salary: 130000, skills: ["People Management", "OKRs", "Budget", "Stakeholder Management"], achievement: "Managing a team of 8-12 engineers. Owning engineering culture, roadmap, and team performance." },
  ],
  salaryProjection: [
    { year: "Now", salary: 28000 },
    { year: "Y1", salary: 28000 },
    { year: "Y2", salary: 42000 },
    { year: "Y3", salary: 55000 },
    { year: "Y4", salary: 72000 },
    { year: "Y5", salary: 88000 },
    { year: "Y6", salary: 105000 },
    { year: "Y7", salary: 130000 },
  ],
  requiredCertifications: [
    "AWS Solutions Architect Associate (Year 2-3)",
    "Certified Kubernetes Administrator (Year 3-4)",
    "Google Project Management Cert or PMP (Year 4-5)",
    "Leadership coaching program (Year 5-6)",
  ],
  alternativePaths: [
    "Senior Engineer → Principal/Staff Engineer → Distinguished Engineer",
    "Tech Lead → Product Manager → Engineering Director",
    "Senior Engineer → Startup CTO (faster but riskier path)",
  ],
  keyRisks: [
    "SA tech market is competitive — staying current with skills is critical",
    "Company growth affects promotion timeline — larger companies move slower",
    "Load shedding resilience: remote work has opened global competition for SA engineers",
    "Management track reduces coding — ensure this aligns with long-term goals",
  ],
};

const PRESET_PATHS = [
  { from: "Graduate", to: "Data Scientist", years: 4, salary: "R72k+", icon: "📊" },
  { from: "Junior Dev", to: "CTO", years: 10, salary: "R200k+", icon: "🚀" },
  { from: "Accountant", to: "CFO", years: 12, salary: "R180k+", icon: "💼" },
  { from: "Teacher", to: "EdTech Specialist", years: 3, salary: "R55k+", icon: "🎓" },
  { from: "Nurse", to: "Medical Manager", years: 8, salary: "R80k+", icon: "🏥" },
  { from: "Engineer", to: "Renewable Energy Lead", years: 5, salary: "R120k+", icon: "⚡" },
];

export default function CareerPathsPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [years, setYears] = useState(5);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<typeof MOCK_SIMULATION | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsModal, setCreditsModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    fetch("/api/credits/balance")
      .then((r) => r.json())
      .then((d) => setCreditBalance(d.balance ?? 0))
      .catch(() => {});
  }, []);

  const simulate = async () => {
    if (!currentRole.trim() || !targetRole.trim()) return;
    setSimulating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/career/paths", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          currentRole:     currentRole.trim(),
          targetRole:      targetRole.trim(),
          yearsExperience: 0,
          currentSkills:   [],
          province:        "GAUTENG",
          timeframeYears:  years,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402 && data.code === "NO_CREDITS") {
          setCreditsModal(true);
          setSimulating(false);
          return;
        }
        throw new Error(data.error || `Error ${res.status}`);
      }

      const data = await res.json();

      // Normalise and fall back to MOCK_SIMULATION shape where AI omits fields
      const normalised = {
        ...MOCK_SIMULATION,          // sensible defaults
        ...data,                     // AI values override
        currentRole:    currentRole.trim(),
        targetRole:     targetRole.trim(),
        timeframeYears: years,
        milestones:     Array.isArray(data.milestones)             ? data.milestones             : MOCK_SIMULATION.milestones,
        salaryProjection: Array.isArray(data.salaryProjection)     ? data.salaryProjection       : MOCK_SIMULATION.salaryProjection,
        requiredCertifications: Array.isArray(data.requiredCertifications) ? data.requiredCertifications : MOCK_SIMULATION.requiredCertifications,
        alternativePaths: Array.isArray(data.alternativePaths)     ? data.alternativePaths       : MOCK_SIMULATION.alternativePaths,
        keyRisks:         Array.isArray(data.keyRisks)             ? data.keyRisks               : MOCK_SIMULATION.keyRisks,
        promotionProbability: Number(data.promotionProbability ?? MOCK_SIMULATION.promotionProbability),
        summary:          String(data.summary ?? MOCK_SIMULATION.summary),
      };
      setResult(normalised);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed. Please try again.");
    } finally {
      setSimulating(false);
    }
  };

  const maxSalary = result ? Math.max(...result.salaryProjection.map((s) => s.salary)) : 0;

  return (
    <>
    <OutOfCreditsModal
      open={creditsModal}
      onClose={() => setCreditsModal(false)}
      featureLabel="Career Path simulation"
      creditCost={3}
      currentBalance={creditBalance}
    />
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Career Path Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Simulate your career 5–10 years ahead. See milestones, salary growth, and required certifications.
        </p>
      </div>

      {/* Input form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Role</label>
            <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Junior Developer" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Role</label>
            <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Engineering Manager" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timeframe: {years} years</label>
            <input
              type="range" min={2} max={15} value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={simulate}
              disabled={!currentRole || !targetRole || simulating}
              variant="indigo"
              className="w-full gap-2"
            >
              {simulating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {simulating ? "Simulating..." : "Simulate Path"}
            </Button>
          </div>
        </div>

        {/* Preset paths */}
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-2">Try a preset path:</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PATHS.map((p) => (
              <button
                key={`${p.from}-${p.to}`}
                onClick={() => { setCurrentRole(p.from); setTargetRole(p.to); setYears(p.years); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-indigo-500/30 hover:bg-indigo-500/8 text-muted-foreground hover:text-foreground transition-all"
              >
                <span>{p.icon}</span>
                {p.from} → {p.to}
                <span className="text-emerald-400 font-medium">{p.salary}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Salary Growth", value: `${Math.round(maxSalary / result.milestones[0].salary)}x`, color: "emerald", desc: `${formatSalary(result.milestones[0].salary)} → ${formatSalary(maxSalary)}` },
                { label: "Success Probability", value: `${result.promotionProbability}%`, color: "indigo", desc: "Based on SA market data" },
                { label: "Milestones", value: result.milestones.length, color: "violet", desc: "Career checkpoints" },
                { label: "Certifications", value: result.requiredCertifications.length, color: "amber", desc: "Required qualifications" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    s.color === "emerald" ? "text-emerald-400" :
                    s.color === "violet" ? "text-violet-400" :
                    s.color === "amber" ? "text-amber-400" : "text-indigo-400"
                  }`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-card border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-foreground">AI Career Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* Salary projection chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Salary Projection (ZAR/month)</h3>
                <Badge variant="success">
                  Final: {formatSalary(maxSalary)}/mo
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.salaryProjection} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`R${(val / 1000).toFixed(0)}k/mo`, "Salary"]}
                    contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="salary" stroke="#6366f1" fill="url(#salaryGrad)" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Milestones timeline */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-violet-400" />
                Career Milestones Timeline
              </h3>
              <div className="space-y-3">
                {result.milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setActiveYear(activeYear === i ? null : i)}
                    className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      activeYear === i
                        ? "border-indigo-500/40 bg-indigo-500/8"
                        : "border-border hover:border-indigo-500/20 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        i === result.milestones.length - 1
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      }`}>
                        {m.year === 1 ? "Now" : `Y${m.year}`}
                      </div>
                      {i < result.milestones.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{m.role}</div>
                          <div className="text-sm text-emerald-400 font-bold mt-0.5">{formatSalary(m.salary)}/mo</div>
                        </div>
                        {i === result.milestones.length - 1 && (
                          <Badge variant="success">Goal</Badge>
                        )}
                      </div>
                      {activeYear === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3"
                        >
                          <p className="text-xs text-muted-foreground mb-2">{m.achievement}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.skills.map((s) => <Badge key={s} variant="indigo" className="text-xs">{s}</Badge>)}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications & risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Required Certifications
                </h3>
                <div className="space-y-2">
                  {result.requiredCertifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  Key Risks to Monitor
                </h3>
                <div className="space-y-2">
                  {result.keyRisks.map((risk) => (
                    <div key={risk} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
