"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Briefcase, Target, Code, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POPULAR_SKILLS = [
  "Python", "JavaScript", "SQL", "Excel", "Power BI", "React",
  "Node.js", "AWS", "Azure", "Machine Learning", "Data Analysis",
  "Project Management", "Agile/Scrum", "Communication", "Leadership",
  "AutoCAD", "Java", "C#", "Cybersecurity", "Cloud Computing",
  "Financial Analysis", "Marketing", "Sales", "Customer Service",
];

const ROLE_SUGGESTIONS = [
  "Software Engineer", "Data Scientist", "Cloud Architect",
  "Product Manager", "Financial Analyst", "Civil Engineer",
  "Electrician", "Nurse", "Teacher", "Marketing Manager",
  "Accountant", "Cybersecurity Analyst", "UX Designer",
];

const STEPS = [
  { id: 1, title: "Your Current Role", icon: Briefcase, color: "indigo" },
  { id: 2, title: "Your Dream Role", icon: Target, color: "emerald" },
  { id: 3, title: "Your Skills", icon: Code, color: "violet" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const firstName = user?.firstName || "there";

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills((prev) => [...prev, skill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const canNext = () => {
    if (step === 1) return currentRole.trim().length > 0;
    if (step === 2) return targetRole.trim().length > 0;
    if (step === 3) return skills.length >= 1;
    return false;
  };

  const finish = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/onboarding/complete", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole:     currentRole.trim(),
          targetRole:      targetRole.trim(),
          skills,
          yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error ?? `Server error (${res.status}) — please try again.`);
        setSaving(false);
        return; // don't navigate; keep user on the form
      }

      router.push("/dashboard");
    } catch {
      setSaveError("Network error — check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">CareerIntel <span className="text-indigo-400">SA</span></span>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = s.id < step;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active ? "bg-indigo-600 text-white" :
                  done ? "bg-indigo-500/20 text-indigo-300" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 transition-colors ${done ? "bg-indigo-500/40" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Current Role */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {firstName}! 👋</h1>
                <p className="text-muted-foreground text-sm mt-1">Let&apos;s personalise your career intelligence in 60 seconds.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">What&apos;s your current role or situation?</label>
                  <Input
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Data Analyst, Student, Unemployed, Junior Developer..."
                    onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(2)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Years of experience <span className="text-muted-foreground/60">(optional)</span></label>
                  <Input
                    type="number"
                    min={0} max={50}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Quick select:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Student", "Graduate", "Unemployed", "Career Change", "Self-employed"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setCurrentRole(r)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          currentRole === r
                            ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-300"
                            : "border-border hover:border-indigo-500/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Target Role */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">What&apos;s your dream role? 🎯</h1>
                <p className="text-muted-foreground text-sm mt-1">This powers your skills gap analysis, salary data, and AI coaching.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Target role or career goal</label>
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Data Scientist, Cloud Architect, Software Engineer..."
                    onKeyDown={(e) => e.key === "Enter" && canNext() && setStep(3)}
                    autoFocus
                  />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Popular in SA right now:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_SUGGESTIONS.slice(0, 8).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTargetRole(r)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          targetRole === r
                            ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                            : "border-border hover:border-emerald-500/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Skills */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">What are your top skills? ⚡</h1>
                <p className="text-muted-foreground text-sm mt-1">Add at least 3 skills — you can always edit these later in your profile.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Type a skill and press Enter..."
                    onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                    autoFocus
                  />
                  <Button variant="outline" size="sm" onClick={() => addSkill(newSkill)}>Add</Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Click to add popular skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 14).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/8 text-muted-foreground hover:text-foreground transition-all"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        {saveError && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
            {saveError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 1 ? setStep(step - 1) : router.push("/dashboard")}
            className="text-muted-foreground"
          >
            {step === 1 ? "Skip for now" : "Back"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step} of {STEPS.length}</span>
            {step < STEPS.length ? (
              <Button
                variant="indigo"
                size="sm"
                className="gap-2"
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="indigo"
                size="sm"
                className="gap-2"
                onClick={finish}
                disabled={!canNext() || saving}
              >
                {saving ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Zap className="w-3.5 h-3.5" /></motion.div> Setting up...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Go to Dashboard</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
