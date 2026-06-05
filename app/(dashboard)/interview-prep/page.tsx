"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ChevronDown, ChevronUp, Zap, CheckCircle2, Star, Brain, Target, Clock, ArrowRight, AlertCircle, Volume2, Square, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ── Voice utilities ───────────────────────────────────────────────────────────

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-ZA";
  utt.rate = 0.95;
  utt.pitch = 1;
  // Pick a South African English voice if available
  const voices = window.speechSynthesis.getVoices();
  const saVoice = voices.find(v => v.lang === "en-ZA") ?? voices.find(v => v.lang.startsWith("en"));
  if (saVoice) utt.voice = saVoice;
  window.speechSynthesis.speak(utt);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

interface AIEvaluation {
  score: number;
  headline: string;
  strengths: string[];
  improvements: string[];
  saContext: string | null;
}

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
  const [industry, setIndustry] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [practiceText, setPracticeText] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Voice mode
  const [voiceMode, setVoiceMode]         = useState(false);
  const [recording, setRecording]         = useState<string | null>(null);
  const [speaking, setSpeaking]           = useState<string | null>(null);
  const [evaluating, setEvaluating]       = useState<string | null>(null);
  const [evaluations, setEvaluations]     = useState<Record<string, AIEvaluation>>({});
  const [voiceError, setVoiceError]       = useState<string | null>(null);
  const recognitionRef                    = useRef<any>(null);

  const startRecording = useCallback((questionId: string) => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice recording requires Chrome or Edge. Please switch browsers.");
      return;
    }
    const recognition = new SpeechRecognition();
    // en-US is the most widely supported recognition locale
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    let finalTranscript = "";

    recognition.onstart = () => setRecording(questionId);

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setPracticeText(prev => ({ ...prev, [questionId]: (finalTranscript + interim).trim() }));
    };

    recognition.onerror = (e: any) => {
      setRecording(null);
      if (e.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone access in your browser settings and try again.");
      } else if (e.error === "no-speech") {
        setVoiceError("No speech detected. Make sure your microphone is working and try again.");
      } else {
        setVoiceError(`Recording error: ${e.error}. Please try again.`);
      }
    };

    recognition.onend = () => setRecording(null);

    try {
      recognition.start();
    } catch (err) {
      setVoiceError("Could not start recording. Please refresh the page and try again.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(null);
  }, []);

  const evaluateAnswer = useCallback(async (q: Question) => {
    const answer = practiceText[q.id];
    if (!answer?.trim()) return;
    setEvaluating(q.id);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.question, answer, role: role || "General" }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json();
      setEvaluations(prev => ({ ...prev, [q.id]: data }));
    } catch {
      // silently fail
    } finally {
      setEvaluating(null);
    }
  }, [practiceText, role]);

  const generate = async () => {
    if (!role.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/questions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          role:     role.trim(),
          level,
          industry: industry.trim() || "general",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const qs: Question[] = Array.isArray(data.questions)
        ? data.questions.map((q: Record<string, unknown>, i: number) => ({
            id:           String(q.id ?? i + 1),
            question:     String(q.question ?? ""),
            type:         (q.type as Question["type"]) ?? "behavioral",
            difficulty:   (q.difficulty as Question["difficulty"]) ?? "medium",
            sampleAnswer: String(q.sampleAnswer ?? ""),
            tips:         Array.isArray(q.tips) ? (q.tips as string[]) : [],
          }))
        : [];

      if (qs.length > 0) setQuestions(qs);
      else throw new Error("No questions returned — please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions.");
    } finally {
      setGenerating(false);
    }
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
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Finance, Tech, Healthcare"
            />
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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-200">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Questions", value: questions.length, icon: Target },
          { label: "SA-Specific", value: questions.filter((q) => {
              const haystack = (q.question + " " + q.tips.join(" ")).toLowerCase();
              return haystack.includes("south africa") || haystack.includes("load shed") ||
                     haystack.includes("b-bbee") || haystack.includes("bbee") ||
                     haystack.includes("nqf") || haystack.includes("saqa") ||
                     haystack.includes("sa-specific") || haystack.includes("sa ") ||
                     haystack.includes("bcea") || haystack.includes("lra");
            }).length, icon: Star },
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

      {/* Filter + Voice Mode toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
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
        <button
          onClick={() => { setVoiceMode(v => !v); stopSpeaking(); stopRecording(); }}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
            voiceMode
              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          {voiceMode ? "Voice Mode ON" : "Voice Mode"}
        </button>
      </div>

      {voiceMode && (
        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-muted-foreground">
          <Mic className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Voice Mode active</span> — click <strong>Read Question</strong> to hear it aloud, then <strong>Record Answer</strong> to speak your response. Your browser will ask for microphone permission on first use. After recording, click <strong>AI Score</strong> for instant feedback.
            <span className="text-muted-foreground/60"> Works best in Chrome or Edge.</span>
          </div>
        </div>
      )}

      {voiceError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{voiceError}</div>
          <button onClick={() => setVoiceError(null)} className="text-red-400/60 hover:text-red-300 text-base leading-none flex-shrink-0">✕</button>
        </div>
      )}

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
                    {/* Voice Mode controls */}
                    {voiceMode && (
                      <div className="space-y-3 pt-1">
                        <div className="flex gap-2 flex-wrap">
                          {/* Read Question aloud */}
                          <Button variant="outline" size="sm" className="gap-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (speaking === q.id) { stopSpeaking(); setSpeaking(null); }
                              else { speakText(q.question); setSpeaking(q.id); setTimeout(() => setSpeaking(null), 8000); }
                            }}>
                            {speaking === q.id ? <><Square className="w-3 h-3" /> Stop</> : <><Volume2 className="w-3 h-3" /> Read Question</>}
                          </Button>
                          {/* Record Answer */}
                          <Button
                            variant={recording === q.id ? "destructive" : "outline"} size="sm"
                            className={`gap-2 text-xs ${recording === q.id ? "animate-pulse" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (recording === q.id) stopRecording();
                              else { setPracticeId(q.id); startRecording(q.id); }
                            }}>
                            {recording === q.id ? <><MicOff className="w-3 h-3" /> Stop Recording</> : <><Mic className="w-3 h-3" /> Record Answer</>}
                          </Button>
                          {/* AI Score */}
                          {practiceText[q.id] && (
                            <Button variant="indigo" size="sm" className="gap-2 text-xs"
                              disabled={!!evaluating}
                              onClick={(e) => { e.stopPropagation(); evaluateAnswer(q); }}>
                              {evaluating === q.id
                                ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles className="w-3 h-3" /></motion.div> Scoring…</>
                                : <><Sparkles className="w-3 h-3" /> AI Score</>}
                            </Button>
                          )}
                        </div>

                        {/* AI Evaluation result */}
                        {evaluations[q.id] && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-secondary rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`text-2xl font-black ${evaluations[q.id].score >= 8 ? "text-emerald-400" : evaluations[q.id].score >= 6 ? "text-indigo-300" : "text-amber-400"}`}>
                                {evaluations[q.id].score}/10
                              </div>
                              <span className="text-sm font-medium text-foreground">{evaluations[q.id].headline}</span>
                            </div>
                            {evaluations[q.id].strengths.length > 0 && (
                              <div>
                                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">Strengths</div>
                                {evaluations[q.id].strengths.map((s, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                                  </div>
                                ))}
                              </div>
                            )}
                            {evaluations[q.id].improvements.length > 0 && (
                              <div>
                                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1">To Improve</div>
                                {evaluations[q.id].improvements.map((s, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                                    <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{s}
                                  </div>
                                ))}
                              </div>
                            )}
                            {evaluations[q.id].saContext && (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-indigo-300">
                                🇿🇦 SA Tip: {evaluations[q.id].saContext}
                              </div>
                            )}
                          </motion.div>
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
