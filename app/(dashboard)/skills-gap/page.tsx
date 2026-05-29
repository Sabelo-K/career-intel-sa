"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/feedback-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, CheckCircle2, BookOpen, TrendingUp,
  Zap, AlertCircle, ChevronRight, Sparkles, Search, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OutOfCreditsModal } from "@/components/out-of-credits-modal";

const CURRENT_SKILLS = ["Excel", "PowerPoint", "Communication", "Project Coordination", "Basic Python"];

// ─── Types returned by the AI ────────────────────────────────────────────────
interface MissingSkill {
  skill: string;
  priority: string;
  demandScore: number;
  timeToLearnWeeks: number;
  reason: string;
}
interface LearningStep {
  order: number;
  title: string;
  description: string;
  skills: string[];
  resources: string[];
  estimatedWeeks: number;
}
interface GapResult {
  targetRole: string;
  matchPercentage: number;
  missingSkills: MissingSkill[];
  learningPath: LearningStep[];
  estimatedMonths: number;
  quickWins: string[];
  salaryImpact: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-red-400 bg-red-500/15 border-red-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  LOW: "text-blue-400 bg-blue-500/15 border-blue-500/30",
};

export default function SkillsGapPage() {
  const router = useRouter();
  const { triggerFeedback } = useFeedback();
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [currentSkills, setCurrentSkills] = useState(CURRENT_SKILLS);
  const [creditsModal, setCreditsModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    fetch("/api/credits/balance")
      .then((r) => r.json())
      .then((d) => setCreditBalance(d.balance ?? 0))
      .catch(() => {});
  }, []);

  const analyse = async () => {
    if (!targetRole.trim() || currentSkills.length === 0) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/skills/gap", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          currentSkills,
          targetRole: targetRole.trim(),
          yearsExperience: 0,
          education: "Not specified",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402 && data.code === "NO_CREDITS") {
          setCreditsModal(true);
          setAnalyzing(false);
          return;
        }
        throw new Error(data.error || `Error ${res.status}`);
      }

      const data = await res.json();

      // Normalise — Groq occasionally wraps the result differently
      const normalised: GapResult = {
        targetRole:       targetRole.trim(),
        matchPercentage:  Number(data.matchPercentage ?? 0),
        missingSkills:    Array.isArray(data.missingSkills) ? data.missingSkills : [],
        learningPath:     Array.isArray(data.learningPath)  ? data.learningPath  : [],
        estimatedMonths:  Number(data.estimatedMonths ?? 0),
        quickWins:        Array.isArray(data.quickWins)     ? data.quickWins     : [],
        salaryImpact:     String(data.salaryImpact ?? ""),
      };
      setResult(normalised);
      // Trigger CSAT feedback 4 seconds after the result loads
      setTimeout(() => triggerFeedback("skills-gap"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const totalWeeks = result?.missingSkills.reduce((acc, s) => acc + s.timeToLearnWeeks, 0) || 0;

  return (
    <>
    <OutOfCreditsModal
      open={creditsModal}
      onClose={() => setCreditsModal(false)}
      featureLabel="Skills Gap analysis"
      creditCost={3}
      currentBalance={creditBalance}
    />
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skills Gap Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover exactly what skills you need for your dream role and get a personalised learning roadmap.
        </p>
      </div>

      {/* Current skills */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Your Current Skills</h2>
          <Button variant="ghost" size="sm" className="text-xs text-indigo-400" onClick={() => setShowSkillInput(true)}>+ Add Skills</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentSkills.map((skill) => (
            <Badge key={skill} variant="success" className="flex items-center gap-1 pr-1">
              {skill}
              <button onClick={() => setCurrentSkills(currentSkills.filter(s => s !== skill))} className="ml-1 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        {showSkillInput && (
          <div className="flex gap-2 mt-3">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. SQL, Tableau, Leadership..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSkill.trim()) {
                  if (!currentSkills.includes(newSkill.trim())) {
                    setCurrentSkills([...currentSkills, newSkill.trim()]);
                  }
                  setNewSkill("");
                  setShowSkillInput(false);
                }
                if (e.key === "Escape") { setShowSkillInput(false); setNewSkill(""); }
              }}
              autoFocus
            />
            <Button
              size="sm"
              variant="indigo"
              onClick={() => {
                if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
                  setCurrentSkills([...currentSkills, newSkill.trim()]);
                }
                setNewSkill("");
                setShowSkillInput(false);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowSkillInput(false); setNewSkill(""); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Target role input */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Target Role</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Scientist, Cloud Architect, Cybersecurity Analyst..."
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && analyse()}
            />
          </div>
          <Button onClick={analyse} disabled={!targetRole.trim() || analyzing} variant="indigo" className="gap-2">
            {analyzing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Zap className="w-4 h-4" />
                </motion.div>
                Analysing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Analyse Gap
              </>
            )}
          </Button>
        </div>
        {/* Quick role suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["Data Scientist", "Cloud Architect", "Software Engineer", "Cybersecurity Analyst", "Product Manager"].map((role) => (
            <button
              key={role}
              onClick={() => setTargetRole(role)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/8 text-muted-foreground hover:text-foreground transition-all"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Current Match", value: `${result.matchPercentage}%`, color: result.matchPercentage >= 70 ? "emerald" : result.matchPercentage >= 40 ? "amber" : "red", desc: "Skills overlap" },
                { label: "Missing Skills", value: result.missingSkills.length, color: "amber", desc: "To acquire" },
                { label: "Est. Time", value: `${result.estimatedMonths} mo`, color: "indigo", desc: "To be job-ready" },
                { label: "Quick Wins", value: result.quickWins.length, color: "emerald", desc: "Learn in < 4 weeks" },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${
                    stat.color === "emerald" ? "text-emerald-400" :
                    stat.color === "amber" ? "text-amber-400" :
                    stat.color === "red" ? "text-red-400" : "text-indigo-400"
                  }`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Match progress */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Skills match for {result.targetRole}</span>
                <span className="text-2xl font-bold text-amber-400">{result.matchPercentage}%</span>
              </div>
              <Progress value={result.matchPercentage} className="h-3" indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Current: {currentSkills.length} skills</span>
                <span>Target: {currentSkills.length + result.missingSkills.length} skills needed</span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-200/80">
                <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
                {result.salaryImpact}
              </div>
            </div>

            {/* Missing skills */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Missing Skills ({result.missingSkills.length})
              </h3>
              <div className="space-y-3">
                {result.missingSkills.map((skill, i) => (
                  <motion.div
                    key={skill.skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary border border-border hover:border-indigo-500/20 transition-all"
                  >
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${PRIORITY_COLOR[skill.priority]}`}>
                      {skill.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{skill.skill}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{skill.reason}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">Demand</div>
                      <div className="text-sm font-bold text-indigo-400">{skill.demandScore}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">Time</div>
                      <div className="text-sm font-medium text-foreground">{skill.timeToLearnWeeks}w</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Learning roadmap */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Personalised Learning Roadmap · {result.estimatedMonths} months
              </h3>
              <div className="space-y-3">
                {result.learningPath.map((step, i) => (
                  <div
                    key={step.order}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    className="cursor-pointer"
                  >
                    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${activeStep === i ? "border-indigo-500/40 bg-indigo-500/8" : "border-border hover:border-indigo-500/20 hover:bg-secondary"}`}>
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                        {step.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{step.title}</span>
                          <span className="text-xs text-muted-foreground">{step.estimatedWeeks} weeks</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {step.skills.map((s) => (
                            <Badge key={s} variant="indigo" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                        {activeStep === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <div className="text-xs text-muted-foreground mb-1.5 font-medium">Recommended Resources:</div>
                            {step.resources.map((r) => (
                              <div key={r} className="flex items-center gap-1.5 text-xs text-indigo-300 mb-1">
                                <ChevronRight className="w-3 h-3" />
                                {r}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="indigo" size="sm" className="gap-2" onClick={() => router.push('/career-coach')}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Detailed Learning Plan
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/courses')}>
                  <BookOpen className="w-3.5 h-3.5" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
