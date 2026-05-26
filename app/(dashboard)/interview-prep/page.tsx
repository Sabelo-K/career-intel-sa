"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ChevronDown, ChevronUp, Zap, CheckCircle2, Star, Brain, Target, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational" | "competency";
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer: string;
  tips: string[];
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: "1",
    question: "Tell me about yourself and why you want to work at [Company].",
    type: "behavioral",
    difficulty: "easy",
    sampleAnswer: "Structure: Present (current role/studies) → Past (relevant experience) → Future (why this role/company). Keep to 90 seconds. Research the company's SA initiatives and reference them specifically.",
    tips: ["Use the Present-Past-Future framework", "Research the company's SA market strategy", "End by connecting your goals to their mission"],
  },
  {
    id: "2",
    question: "Describe a situation where you had to meet a tight deadline during load shedding. How did you manage?",
    type: "situational",
    difficulty: "medium",
    sampleAnswer: "SA-specific question! Use STAR method. Mention your contingency: UPS/inverter, offline tools, pre-downloading materials, time-shifting work to available hours. Show initiative and problem-solving.",
    tips: ["This is a uniquely SA question — interviewers love seeing load shedding resilience", "STAR method: Situation, Task, Action, Result", "Mention any backup power or mobile data solutions you used", "Quantify the outcome where possible"],
  },
  {
    id: "3",
    question: "How do you approach working in diverse, multicultural teams in a South African context?",
    type: "competency",
    difficulty: "medium",
    sampleAnswer: "Reference SA's 11 official languages and rich cultural diversity. Mention specific strategies: inclusive meeting practices, cultural curiosity, active listening, and leveraging diverse perspectives for better outcomes.",
    tips: ["Acknowledge SA's unique diversity context", "Give a real example of cross-cultural collaboration", "Mention B-BBEE and transformation as positive business drivers", "Avoid generic answers — be specific about SA context"],
  },
  {
    id: "4",
    question: "Walk me through how you would design a scalable REST API.",
    type: "technical",
    difficulty: "hard",
    sampleAnswer: "Cover: RESTful principles (stateless, resource-based URLs), authentication (JWT/OAuth), versioning strategy, rate limiting, caching (Redis), database design considerations, error handling, and documentation (Swagger/OpenAPI).",
    tips: ["Start with requirements gathering", "Discuss trade-offs, not just best practices", "Mention cloud deployment (AWS/Azure) — common in SA enterprise", "Reference SA data privacy (POPIA) compliance if relevant"],
  },
  {
    id: "5",
    question: "Give an example of when you failed at something important. What did you learn?",
    type: "behavioral",
    difficulty: "medium",
    sampleAnswer: "Choose a real failure (not 'I work too hard'). Structure: what happened → your responsibility → what you learned → how you applied it. SA interviewers value self-awareness and growth mindset.",
    tips: ["Choose a genuine failure — vague answers are worse", "Focus 60% on what you learned/changed", "Show the positive outcome from the lesson", "Avoid blaming external factors"],
  },
  {
    id: "6",
    question: "What is your salary expectation for this role?",
    type: "situational",
    difficulty: "easy",
    sampleAnswer: "Research beforehand! For SA: give a range, not a single number. State your research basis (PNet data, industry benchmarks). For tech roles: mention the full package including medical aid, pension, and bonus.",
    tips: ["Research market rates on PNet, CareerJunction, LinkedIn", "State a range (20% spread)", "Mention total package including benefits", "SA norm: 'Market-related' is acceptable but specific is better", "Don't undersell — SA tech salaries have grown significantly"],
  },
];

const TYPE_COLORS: Record<string, string> = {
  behavioral: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  technical: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  situational: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  competency: "bg-amber-500/15 text-amber-300 border-amber-500/25",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-red-400",
};

export default function InterviewPrepPage() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("mid");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [practiceText, setPracticeText] = useState<Record<string, string>>({});

  const generate = async () => {
    if (!role) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
  };

  const filtered = filter === "all" ? questions : questions.filter((q) => q.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interview Prep System</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-generated mock interview questions tailored to SA employer expectations.
        </p>
      </div>

      {/* Generator */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Generate Custom Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Role</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Analyst" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Seniority Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="junior">Junior / Graduate</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="executive">Executive / C-Suite</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Industry (optional)</label>
            <Input placeholder="e.g. Finance, Tech, Healthcare" />
          </div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={!role || generating} variant="indigo" className="w-full gap-2">
              {generating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Generate Questions"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: questions.length, icon: Target },
          { label: "SA-Specific", value: 2, icon: Star },
          { label: "Technical", value: questions.filter(q => q.type === "technical").length, icon: Brain },
          { label: "Avg Difficulty", value: "Medium", icon: Clock },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <s.icon className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "behavioral", "technical", "situational", "competency"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              filter === f
                ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f === "all" ? "All Questions" : f}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              className="w-full flex items-start gap-4 p-5 text-left hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[q.type]}`}>{q.type}</span>
                  <span className={`text-xs font-medium ${DIFFICULTY_COLORS[q.difficulty]}`}>
                    {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                  </span>
                </div>
              </div>
              {expandedId === q.id
                ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              }
            </button>

            <AnimatePresence>
              {expandedId === q.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wide">How to Answer</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q.sampleAnswer}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">Pro Tips</div>
                      <div className="space-y-1.5">
                        {q.tips.map((tip, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                    {practiceId === q.id && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Your Practice Answer</div>
                        <textarea
                          value={practiceText[q.id] || ""}
                          onChange={(e) => setPracticeText({ ...practiceText, [q.id]: e.target.value })}
                          placeholder="Type your answer here — try to follow the framework above..."
                          rows={5}
                          className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          autoFocus
                        />
                        {practiceText[q.id] && (
                          <div className="text-xs text-muted-foreground">
                            {practiceText[q.id].split(/\s+/).filter(Boolean).length} words · Keep practicing for best results
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant={practiceId === q.id ? "indigo" : "outline"}
                        size="sm"
                        className="gap-2 text-xs"
                        onClick={(e) => { e.stopPropagation(); setPracticeId(practiceId === q.id ? null : q.id); }}
                      >
                        <Mic className="w-3 h-3" />
                        {practiceId === q.id ? "Hide Practice" : "Practice Answer"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = filtered.findIndex((fq) => fq.id === q.id);
                          const next = filtered[idx + 1];
                          if (next) { setExpandedId(next.id); setPracticeId(null); }
                        }}
                        disabled={filtered.findIndex((fq) => fq.id === q.id) === filtered.length - 1}
                      >
                        <ArrowRight className="w-3 h-3" />
                        Next Question
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* SA Interview Tips */}
      <div className="bg-card border border-amber-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          SA-Specific Interview Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Research the company's B-BBEE rating and transformation initiatives — many SA employers will ask",
            "Prepare for load shedding resilience questions — a uniquely SA topic",
            "Know your NQF level and SAQA-recognised qualifications",
            "Understand SA labour law basics (BCEA, LRA) for HR and management roles",
            "Arrive 10–15 minutes early — Joburg traffic is a valid excuse, but not a great one",
            "Reference SA-specific industry bodies (SAICA, ECSA, HPCSA) relevant to your field",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
