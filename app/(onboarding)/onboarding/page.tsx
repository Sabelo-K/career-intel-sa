"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Briefcase, Target, Code, ArrowRight, CheckCircle2, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAPS_SUBJECTS, SUBJECT_GROUPS } from "@/lib/data/sa-subjects";

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

const HS_ROLES = [
  "Software Engineer", "Medical Doctor", "Chartered Accountant",
  "Civil Engineer", "Data Scientist", "Nurse",
  "Electrician", "Teacher", "Financial Analyst",
];

const BASE_STEPS = [
  { id: 1, title: "Your Situation",  icon: Briefcase, color: "indigo" },
  { id: 2, title: "Your Dream Role", icon: Target,    color: "emerald" },
  { id: 3, title: "Your Skills",     icon: Code,      color: "violet" },
];

const HS_STEP = { id: 4, title: "Your Subjects", icon: BookOpen, color: "amber" };

const HS_KEYWORDS = ["high school", "grade 10", "grade 11", "grade 12", "matric", "learner", "scholar"];

function isHighSchoolStudent(role: string): boolean {
  const lower = role.toLowerCase();
  return HS_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  const firstName = user?.firstName || "there";
  const showSubjectStep = isHighSchoolStudent(currentRole);
  const STEPS = showSubjectStep ? [...BASE_STEPS, HS_STEP] : BASE_STEPS;
  const totalSteps = STEPS.length;

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills((prev) => [...prev, skill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const canNext = () => {
    if (step === 1) return currentRole.trim().length > 0;
    if (step === 2) return targetRole.trim().length > 0;
    if (step === 3) return skills.length >= 1;
    if (step === 4) return subjects.length >= 1; // HS subject step
    return false;
  };

  const skip = async () => {
    setSkipping(true);
    setSaveError("");
    try {
      const res = await fetch("/api/onboarding/skip", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error ?? `Could not skip (${res.status}) — please try again.`);
        setSkipping(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setSaveError("Network error — check your connection and try again.");
      setSkipping(false);
    }
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
          subjects:        showSubjectStep ? subjects : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error ?? `Server error (${res.status}) — please try again.`);
        setSaving(false);
        return;
      }

      router.push(showSubjectStep ? "/high-school" : "/dashboard");
    } catch {
      setSaveError("Network error — check your connection and try again.");
      setSaving(false);
    }
  };

  const isLastStep = step === totalSteps;

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
                  done   ? "bg-indigo-500/20 text-indigo-300" :
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
                    placeholder="e.g. Data Analyst, High School Student, Graduate, Unemployed..."
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
                    {["High School Student", "Student", "Graduate", "Unemployed", "Career Change", "Self-employed"].map((r) => (
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

                {showSubjectStep && (
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      We&apos;ll add a subject selection step so we can match you to careers that suit your Grade 10–12 subjects.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Target Role */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">What&apos;s your dream career? 🎯</h1>
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
                  <div className="text-xs text-muted-foreground mb-2">{showSubjectStep ? "Popular career goals for Grade 12 leavers:" : "Popular in SA right now:"}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(showSubjectStep ? HS_ROLES : ROLE_SUGGESTIONS.slice(0, 8)).map((r) => (
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
                <p className="text-muted-foreground text-sm mt-1">
                  {showSubjectStep
                    ? "Add at least 1 skill — even basic ones like Computer Literacy or Communication count."
                    : "Add at least 3 skills — you can always edit these later in your profile."}
                </p>
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

          {/* Step 4 — CAPS Subjects (high school only) */}
          {step === 4 && showSubjectStep && (
            <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Which subjects do you take? 📚</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Select your Grade 10–12 CAPS subjects. We&apos;ll show you exactly which careers you can access.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                {SUBJECT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">{group.label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.subjects.map((subject) => {
                        const selected = subjects.includes(subject);
                        return (
                          <button
                            key={subject}
                            onClick={() => toggleSubject(subject)}
                            className={`text-xs px-2.5 py-1.5 rounded-full border transition-all font-medium ${
                              selected
                                ? group.color === "indigo"  ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                                : group.color === "emerald" ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                                : group.color === "violet"  ? "border-violet-500/60 bg-violet-500/20 text-violet-300"
                                : group.color === "amber"   ? "border-amber-500/60 bg-amber-500/20 text-amber-300"
                                : group.color === "blue"    ? "border-blue-500/60 bg-blue-500/20 text-blue-300"
                                :                             "border-pink-500/60 bg-pink-500/20 text-pink-300"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                            }`}
                          >
                            {selected && "✓ "}{subject}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {subjects.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-emerald-400">{subjects.length} subject{subjects.length !== 1 ? "s" : ""} selected</span>
                  </div>
                )}
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
            onClick={() => step > 1 ? setStep(step - 1) : skip()}
            disabled={skipping}
            className="text-muted-foreground"
          >
            {step === 1 ? (skipping ? "Setting up…" : "Skip for now") : "Back"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step} of {totalSteps}</span>
            {!isLastStep ? (
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
                ) : showSubjectStep ? (
                  <><BookOpen className="w-3.5 h-3.5" /> Go to Career Hub</>
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
