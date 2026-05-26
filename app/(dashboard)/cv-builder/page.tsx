"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Zap, Download, CheckCircle2, AlertCircle,
  Star, ArrowRight, RefreshCw, Eye, Sparkles, Target, Award,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CVAnalysisResult {
  atsScore: number;
  recruiterScore: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  improvedSummary: string;
  extractedSkills: string[];
  missingKeywords: string[];
}

const MOCK_ANALYSIS: CVAnalysisResult = {
  atsScore: 64,
  recruiterScore: 71,
  suggestions: [
    "Add quantified achievements (e.g., 'Increased sales by 32%' not 'Improved sales')",
    "Include keywords: Python, SQL, Agile, SCRUM, Power BI — high demand in SA",
    "Add LinkedIn profile URL to contact section",
    "Replace generic objective with a targeted professional summary",
    "List certifications prominently — SA employers value NQF-aligned qualifications",
    "Add GitHub or portfolio link if applicable for tech roles",
  ],
  strengths: [
    "Clear chronological work history",
    "Strong educational credentials listed",
    "Contact information is complete",
    "Relevant industry experience highlighted",
  ],
  weaknesses: [
    "Lacks quantified achievements — too descriptive",
    "Missing high-demand SA keywords for target role",
    "Professional summary is generic and not role-targeted",
    "No mention of tools/technologies used",
  ],
  improvedSummary: "Results-driven professional with 4+ years experience in [industry], specialising in [key skills]. Proven track record of [quantified achievement] and [quantified achievement]. Seeking to leverage expertise in [target area] to drive meaningful impact at a forward-thinking SA organisation.",
  extractedSkills: ["Communication", "Project Management", "Microsoft Office", "Team Leadership", "Problem Solving"],
  missingKeywords: ["Python", "SQL", "Agile", "Power BI", "Scrum", "Cloud", "Data Analysis"],
};

const CV_TEMPLATES = [
  { id: "modern", name: "Modern Pro", description: "Clean, ATS-optimised, SA market proven", recommended: true },
  { id: "executive", name: "Executive", description: "Premium design for senior roles R80k+", recommended: false },
  { id: "tech", name: "Tech Focus", description: "Developer-optimised with skills showcase", recommended: false },
  { id: "graduate", name: "Graduate", description: "Perfect for entry-level & internship applications", recommended: false },
];

function ScoreRing({ score, color, size = "md" }: { score: number; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: { r: 28, w: 70, stroke: 6 }, md: { r: 36, w: 90, stroke: 7 }, lg: { r: 46, w: 110, stroke: 9 } };
  const { r, w, stroke } = sizes[size];
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative" style={{ width: w, height: w }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${w} ${w}`}>
        <circle cx={w / 2} cy={w / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={w / 2} cy={w / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

export default function CVBuilderPage() {
  const [stage, setStage] = useState<"upload" | "analyzing" | "results">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [expandedSection, setExpandedSection] = useState<string | null>("suggestions");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setStage("analyzing");
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStage("results");
    }, 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI CV Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload your CV for instant ATS scoring, AI improvements, and SA recruiter optimisation.
          </p>
        </div>
        {stage === "results" && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setStage("upload"); setFileName(null); setAnalysis(null); }}>
            <RefreshCw className="w-3.5 h-3.5" />
            New CV
          </Button>
        )}
      </div>

      {/* Score banner — shown after analysis */}
      <AnimatePresence>
        {stage === "results" && analysis && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "ATS Score", value: analysis.atsScore, color: analysis.atsScore >= 75 ? "#10b981" : analysis.atsScore >= 55 ? "#6366f1" : "#f59e0b", desc: "Applicant tracking" },
              { label: "Recruiter Score", value: analysis.recruiterScore, color: analysis.recruiterScore >= 75 ? "#10b981" : "#f59e0b", desc: "Human appeal" },
              { label: "Skills Extracted", value: analysis.extractedSkills.length, color: "#6366f1", desc: "Skills found", noRing: true },
              { label: "Missing Keywords", value: analysis.missingKeywords.length, color: "#f59e0b", desc: "To add urgently", noRing: true },
            ].map((item) => (
              <div key={item.label} className="stat-card flex items-center gap-4">
                {!item.noRing ? (
                  <ScoreRing score={item.value} color={item.color} size="sm" />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ color: item.color, background: `${item.color}15` }}>
                    {item.value}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: upload / analysis */}
        <div className="lg:col-span-3 space-y-5">
          {/* Upload zone */}
          {stage === "upload" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-500/8"
                    : "border-border hover:border-indigo-500/50 hover:bg-indigo-500/4"
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Drop your CV here</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Supports PDF, DOC, DOCX · Max 10MB
                </p>
                <Button variant="indigo" size="sm" className="pointer-events-none">
                  Browse Files
                </Button>
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ATS Score</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Rating</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Improvements</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyzing state */}
          {stage === "analyzing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-8 h-8 text-indigo-400" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Analysing your CV...</h3>
              <p className="text-muted-foreground text-sm mb-6">{fileName}</p>
              <div className="space-y-3 max-w-xs mx-auto text-left">
                {[
                  "Parsing document structure...",
                  "Extracting skills & experience...",
                  "Running ATS compatibility check...",
                  "Scoring against SA recruiter standards...",
                ].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: i * 0.6, duration: 0.4 }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </motion.div>
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {stage === "results" && analysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Suggestions */}
              {[
                { key: "suggestions", icon: Sparkles, title: "AI Improvement Suggestions", items: analysis.suggestions, color: "indigo", badge: `${analysis.suggestions.length} suggestions` },
                { key: "strengths", icon: Star, title: "CV Strengths", items: analysis.strengths, color: "emerald", badge: `${analysis.strengths.length} found` },
                { key: "weaknesses", icon: AlertCircle, title: "Areas to Fix", items: analysis.weaknesses, color: "amber", badge: `${analysis.weaknesses.length} issues` },
              ].map((section) => (
                <div key={section.key} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <section.icon className={`w-4 h-4 ${section.color === "indigo" ? "text-indigo-400" : section.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`} />
                      <span className="text-sm font-semibold text-foreground">{section.title}</span>
                      <Badge variant={section.color === "indigo" ? "indigo" : section.color === "emerald" ? "success" : "warning"} className="text-xs">
                        {section.badge}
                      </Badge>
                    </div>
                    {expandedSection === section.key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${section.color === "indigo" ? "bg-indigo-400" : section.color === "emerald" ? "bg-emerald-400" : "bg-amber-400"}`} />
                              {item}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Improved summary */}
              <div className="bg-card border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-foreground">AI-Improved Professional Summary</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{analysis.improvedSummary}&rdquo;
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: templates + keywords */}
        <div className="lg:col-span-2 space-y-5">
          {/* Templates */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              CV Templates
            </h3>
            <div className="space-y-2.5">
              {CV_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === tmpl.id
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-border hover:border-indigo-500/25 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{tmpl.name}</span>
                    <div className="flex items-center gap-1.5">
                      {tmpl.recommended && <Badge variant="success" className="text-xs">Recommended</Badge>}
                      {selectedTemplate === tmpl.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                </div>
              ))}
            </div>
            <Button variant="indigo" size="sm" className="w-full mt-4 gap-2">
              <Download className="w-3.5 h-3.5" />
              Download Optimised CV
            </Button>
          </div>

          {/* Skills found */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Skills Extracted
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {analysis.extractedSkills.map((skill) => (
                  <Badge key={skill} variant="success" className="text-xs">{skill}</Badge>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Missing High-Demand Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="warning" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ATS tips */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              SA ATS Tips
            </h3>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              {[
                "Use standard section headings (Work Experience, Education, Skills)",
                "Include NQF level for qualifications when applying to corporate roles",
                "Add B-BBEE status if applicable — required by many SA corporates",
                "Mention SAQA certification numbers for professional qualifications",
                "Include race/equity info only if requested — check job spec",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
