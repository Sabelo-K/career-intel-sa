"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, CheckCircle2, Clock, BookOpen, TrendingUp,
  Zap, AlertCircle, ChevronRight, Sparkles, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SA_CAREERS } from "@/lib/data/sa-careers";

const CURRENT_SKILLS = ["Excel", "PowerPoint", "Communication", "Project Coordination", "Basic Python"];

const MOCK_GAP_RESULT = {
  targetRole: "Data Scientist",
  matchPercentage: 28,
  missingSkills: [
    { skill: "Advanced Python", priority: "HIGH", demandScore: 94, timeToLearnWeeks: 8, reason: "Core tool for data science — used in 95% of SA DS job specs" },
    { skill: "Machine Learning", priority: "HIGH", demandScore: 95, timeToLearnWeeks: 16, reason: "Fundamental requirement — scikit-learn, TensorFlow knowledge essential" },
    { skill: "SQL & Databases", priority: "HIGH", demandScore: 88, timeToLearnWeeks: 4, reason: "Every SA data role requires strong SQL — immediate impact on employability" },
    { skill: "Statistics & Probability", priority: "HIGH", demandScore: 86, timeToLearnWeeks: 10, reason: "Core foundation for ML — hypothesis testing, distributions, inference" },
    { skill: "Data Visualization", priority: "MEDIUM", demandScore: 80, timeToLearnWeeks: 3, reason: "Tableau, Power BI, Matplotlib — communicate insights to SA business stakeholders" },
    { skill: "Cloud Platforms (AWS/Azure)", priority: "MEDIUM", demandScore: 85, timeToLearnWeeks: 6, reason: "Growing requirement — SA companies migrating to cloud, remote ML deployment" },
    { skill: "Big Data (Spark)", priority: "LOW", demandScore: 72, timeToLearnWeeks: 8, reason: "Useful for senior roles but not required at entry level" },
  ],
  learningPath: [
    { order: 1, title: "Python Mastery", description: "Level up from basic to advanced Python including OOP, pandas, numpy", skills: ["Python", "Pandas", "NumPy"], resources: ["Python Data Science Handbook", "Google Data Analytics Cert"], estimatedWeeks: 8 },
    { order: 2, title: "SQL & Data Engineering", description: "Master querying, window functions, and data pipelines", skills: ["SQL", "PostgreSQL", "Data Pipelines"], resources: ["Mode SQL Tutorial", "Udemy SQL Bootcamp"], estimatedWeeks: 4 },
    { order: 3, title: "Statistics Foundation", description: "Probability, hypothesis testing, regression, and distributions", skills: ["Statistics", "R basics", "A/B Testing"], resources: ["StatQuest YouTube", "Think Stats book"], estimatedWeeks: 10 },
    { order: 4, title: "Machine Learning", description: "Scikit-learn, model evaluation, feature engineering, deployment", skills: ["ML", "Scikit-learn", "Model Deploy"], resources: ["IBM ML Cert on Coursera", "Hands-On ML book"], estimatedWeeks: 16 },
    { order: 5, title: "Visualisation & Communication", description: "Tableau, Matplotlib, Seaborn, storytelling with data", skills: ["Tableau", "Matplotlib", "Data Storytelling"], resources: ["Tableau Public", "Storytelling with Data book"], estimatedWeeks: 3 },
  ],
  estimatedMonths: 11,
  quickWins: ["SQL", "Data Visualization", "Basic Statistics"],
  salaryImpact: "Completing this path could increase your earning potential from ~R22k to R38k–R72k/month as a Data Scientist in SA.",
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-red-400 bg-red-500/15 border-red-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  LOW: "text-blue-400 bg-blue-500/15 border-blue-500/30",
};

export default function SkillsGapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_GAP_RESULT | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const analyse = async () => {
    if (!targetRole.trim()) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setResult({ ...MOCK_GAP_RESULT, targetRole });
    setAnalyzing(false);
  };

  const totalWeeks = result?.missingSkills.reduce((acc, s) => acc + s.timeToLearnWeeks, 0) || 0;

  return (
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
          <Button variant="ghost" size="sm" className="text-xs text-indigo-400">+ Add Skills</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CURRENT_SKILLS.map((skill) => (
            <Badge key={skill} variant="success">{skill}</Badge>
          ))}
          <Badge variant="secondary" className="cursor-pointer hover:bg-indigo-500/15 transition-colors">+ Add more</Badge>
        </div>
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
                <span>Current: {CURRENT_SKILLS.length} skills</span>
                <span>Target: {CURRENT_SKILLS.length + result.missingSkills.length} skills needed</span>
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
                <Button variant="indigo" size="sm" className="gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Detailed Learning Plan
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
