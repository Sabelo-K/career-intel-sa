"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, Brain, ArrowRight, ChevronDown,
  CheckCircle2, Star, TrendingUp, BookOpen, AlertCircle,
} from "lucide-react";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { CAREER_SUBJECTS } from "@/lib/data/sa-subjects";

// ── APS system ────────────────────────────────────────────────────────────────
// Achievement level 1-7 maps to APS points (standard NSC system)
const APS_POINTS: Record<number, number> = { 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2, 1: 1 };

const SUBJECTS = [
  { id: "home_lang",   label: "Home Language",           required: true,  countForAps: true  },
  { id: "first_add",   label: "First Additional Language", required: true, countForAps: true  },
  { id: "maths",       label: "Mathematics / Math Lit",  required: true,  countForAps: true  },
  { id: "subject4",    label: "Subject 4",               required: true,  countForAps: true  },
  { id: "subject5",    label: "Subject 5",               required: true,  countForAps: true  },
  { id: "subject6",    label: "Subject 6",               required: true,  countForAps: true  },
  { id: "lo",          label: "Life Orientation",        required: true,  countForAps: false },
];

// Subject name options for subject4-6
const ELECTIVE_SUBJECTS = [
  "Physical Sciences", "Life Sciences", "Accounting", "Business Studies",
  "Economics", "History", "Geography", "Information Technology (IT)",
  "Computer Applications Technology (CAT)", "Engineering Graphics & Design",
  "Agricultural Sciences", "Agricultural Technology", "Electrical Technology",
  "Civil Technology", "Mechanical Technology", "Tourism", "Consumer Studies",
  "Visual Arts", "Dramatic Arts", "Music",
];

// Minimum APS for common programmes
const PROGRAMME_APS: { programme: string; university: string; minAps: number; requiredSubjects: string[] }[] = [
  { programme: "MBChB (Medicine)", university: "UCT / Wits / UP / UKZN", minAps: 42, requiredSubjects: ["Mathematics", "Physical Sciences", "Life Sciences"] },
  { programme: "BEng (Engineering)", university: "Wits / UP / UCT / SU", minAps: 37, requiredSubjects: ["Mathematics", "Physical Sciences"] },
  { programme: "BSc Computer Science", university: "UCT / Wits / UP / SU", minAps: 36, requiredSubjects: ["Mathematics"] },
  { programme: "BCom Accounting / CA(SA)", university: "SAICA-accredited", minAps: 34, requiredSubjects: ["Mathematics", "Accounting"] },
  { programme: "LLB (Law)", university: "Any university", minAps: 33, requiredSubjects: [] },
  { programme: "BSc (Sciences)", university: "Any university", minAps: 32, requiredSubjects: ["Mathematics", "Physical Sciences"] },
  { programme: "BCom (Business/Finance)", university: "Any university", minAps: 30, requiredSubjects: ["Mathematics"] },
  { programme: "BA (Humanities/Social Science)", university: "Any university", minAps: 28, requiredSubjects: [] },
  { programme: "BEd (Teaching)", university: "Any university", minAps: 26, requiredSubjects: [] },
  { programme: "National Diploma (TVET N4–N6)", university: "Any TVET College", minAps: 18, requiredSubjects: [] },
  { programme: "Higher Certificate (1-year)", university: "Any university", minAps: 15, requiredSubjects: [] },
];

const LEVEL_LABELS: Record<number, { label: string; color: string; pct: string }> = {
  7: { label: "Outstanding",    color: "text-emerald-400", pct: "80–100%" },
  6: { label: "Meritorious",    color: "text-indigo-400",  pct: "70–79%"  },
  5: { label: "Substantial",    color: "text-violet-400",  pct: "60–69%"  },
  4: { label: "Adequate",       color: "text-amber-400",   pct: "50–59%"  },
  3: { label: "Moderate",       color: "text-orange-400",  pct: "40–49%"  },
  2: { label: "Elementary",     color: "text-red-400",     pct: "30–39%"  },
  1: { label: "Not achieved",   color: "text-red-500",     pct: "0–29%"   },
};

// Map subject IDs to CAPS subject names for career matching
const MATHS_CAPS_MAP: Record<string, string> = {
  "Mathematics":      "Mathematics",
  "Math Lit":         "Mathematical Literacy",
  "Mathematical Literacy": "Mathematical Literacy",
};

export default function MatricPage() {
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [subjectNames, setSubjectNames] = useState<Record<string, string>>({
    subject4: "Physical Sciences",
    subject5: "Life Sciences",
    subject6: "Accounting",
  });
  const [mathsChoice, setMathsChoice] = useState<"Mathematics" | "Mathematical Literacy">("Mathematics");
  const [showResults, setShowResults] = useState(false);

  const aps = useMemo(() => {
    return SUBJECTS
      .filter(s => s.countForAps)
      .reduce((sum, s) => sum + (APS_POINTS[grades[s.id]] ?? 0), 0);
  }, [grades]);

  const userSubjects = useMemo(() => {
    const subs: string[] = [mathsChoice];
    if (subjectNames.subject4) subs.push(subjectNames.subject4);
    if (subjectNames.subject5) subs.push(subjectNames.subject5);
    if (subjectNames.subject6) subs.push(subjectNames.subject6);
    return subs;
  }, [mathsChoice, subjectNames]);

  const matchingCareers = useMemo(() => {
    if (!showResults) return [];
    return SA_CAREERS
      .filter(c => {
        const reqs = CAREER_SUBJECTS[c.id];
        if (!reqs) return false;
        return reqs.required.every(r => userSubjects.includes(r));
      })
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 12);
  }, [showResults, userSubjects]);

  const qualifyingProgrammes = useMemo(() => {
    if (!showResults) return [];
    return PROGRAMME_APS.filter(p => {
      if (aps < p.minAps) return false;
      return p.requiredSubjects.every(s => userSubjects.includes(s));
    });
  }, [showResults, aps, userSubjects]);

  const allFilled = SUBJECTS.filter(s => s.required).every(s => grades[s.id] !== undefined);

  function setGrade(subjectId: string, level: number) {
    setGrades(prev => ({ ...prev, [subjectId]: level }));
    setShowResults(false);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Career<span className="text-indigo-400">Intel</span><span className="text-amber-400 text-xs ml-1">SA</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
          <Link href="/sign-up" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <GraduationCap className="w-3.5 h-3.5" />
            Free Matric Career Matcher — No sign-up required
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            What careers do<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">your matric results</span><br />
            unlock?
          </h1>
          <p className="text-white/50 text-lg">Enter your symbols. We&apos;ll show you your APS score, matching careers, and university programmes you qualify for.</p>
        </motion.div>

        {/* Subjects form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4">

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">Enter your achievement levels (1–7)</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">{aps}</div>
              <div className="text-[10px] text-white/40">APS score</div>
            </div>
          </div>

          {/* Level legend */}
          <div className="grid grid-cols-4 gap-1 text-center bg-white/5 rounded-xl p-2">
            {[7,6,5,4,3,2,1].slice(0,4).map(l => (
              <div key={l} className="text-[10px]">
                <span className={`font-bold ${LEVEL_LABELS[l].color}`}>{l}</span>
                <span className="text-white/30 ml-1">{LEVEL_LABELS[l].pct}</span>
              </div>
            ))}
          </div>

          {/* Maths choice */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Mathematics type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Mathematics", "Mathematical Literacy"] as const).map(opt => (
                <button key={opt} onClick={() => { setMathsChoice(opt); setShowResults(false); }}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    mathsChoice === opt
                      ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                      : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Subject rows */}
          {SUBJECTS.map(subject => (
            <div key={subject.id}>
              {/* Subject name selector for electives */}
              {["subject4","subject5","subject6"].includes(subject.id) && (
                <div className="relative mb-1">
                  <select
                    value={subjectNames[subject.id] ?? ""}
                    onChange={e => { setSubjectNames(prev => ({ ...prev, [subject.id]: e.target.value })); setShowResults(false); }}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40 pr-7"
                  >
                    <option value="" className="bg-zinc-900">Select subject…</option>
                    {ELECTIVE_SUBJECTS.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-44 text-xs text-white/60 flex-shrink-0">
                  {subject.id === "maths" ? mathsChoice :
                   ["subject4","subject5","subject6"].includes(subject.id) ? (subjectNames[subject.id] ?? subject.label) :
                   subject.label}
                  {!subject.countForAps && <span className="text-white/30 ml-1">(excl. APS)</span>}
                </div>
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4,5,6,7].map(level => (
                    <button key={level} onClick={() => setGrade(subject.id, level)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        grades[subject.id] === level
                          ? level >= 5 ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          : level >= 4 ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                          : "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border border-transparent"
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setShowResults(true)} disabled={!allFilled}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 mt-2">
            Show my career matches <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">

              {/* APS Summary */}
              <div className={`rounded-2xl p-5 border ${
                aps >= 36 ? "bg-emerald-500/10 border-emerald-500/25" :
                aps >= 26 ? "bg-indigo-500/10 border-indigo-500/25" :
                            "bg-amber-500/10 border-amber-500/25"
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Star className={`w-5 h-5 flex-shrink-0 ${aps >= 36 ? "text-emerald-400" : aps >= 26 ? "text-indigo-400" : "text-amber-400"}`} />
                  <span className="font-bold text-xl text-white">APS Score: {aps} / 42</span>
                </div>
                <p className="text-sm text-white/60 ml-8">
                  {aps >= 40 ? "Exceptional result — you qualify for medicine, engineering, and all top programmes." :
                   aps >= 36 ? "Strong result — Engineering, Computer Science, BCom, and Law are all within reach." :
                   aps >= 30 ? "Good result — most university programmes are open to you." :
                   aps >= 24 ? "You qualify for many diploma and degree programmes." :
                   "TVET programmes and Higher Certificates are a great starting point."}
                </p>
              </div>

              {/* Qualifying programmes */}
              {qualifyingProgrammes.length > 0 && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Programmes you qualify for ({qualifyingProgrammes.length})
                  </h3>
                  <div className="space-y-2">
                    {qualifyingProgrammes.map(p => (
                      <div key={p.programme} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-white">{p.programme}</span>
                          <span className="text-white/40 ml-2 text-xs">{p.university}</span>
                          <span className="text-white/30 ml-2 text-xs">Min APS: {p.minAps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching careers */}
              {matchingCareers.length > 0 && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Careers that match your subjects
                  </h3>
                  <p className="text-xs text-white/40 mb-4">Based on the subjects you&apos;re taking — you have the prerequisites for these roles.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchingCareers.map(c => (
                      <div key={c.id} className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">{c.title}</div>
                          <div className="text-[10px] text-white/40">{c.sector}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-emerald-400">R{Math.round(c.avgSalaryZar/1000)}k</div>
                          <div className="text-[10px] text-white/30">avg/mo</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingCareers.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70">
                    No exact career matches for your subject combination — but that&apos;s okay. Create a free account to use the AI Career Coach to explore options based on your specific subjects.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-6 text-center">
                <h3 className="font-bold text-white mb-2">Get your full career roadmap — free</h3>
                <p className="text-sm text-white/50 mb-4">See salary projections, NQF pathways, bursaries you qualify for, and a step-by-step plan from matric to your target career.</p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
