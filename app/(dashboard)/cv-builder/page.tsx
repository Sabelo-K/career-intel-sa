"use client";

import { generateCV, generateRevampedCV, generateBuiltCV, CVTemplateData, CVBuiltData } from "@/lib/cv-templates";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useFeedback } from "@/components/feedback-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Zap, Download, CheckCircle2, AlertCircle,
  Star, RefreshCw, Sparkles, Target, Award,
  ChevronDown, ChevronUp, Plus, Trash2, ChevronRight, ChevronLeft,
  User, Briefcase, GraduationCap, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Types ───────────────────────────────────────────────────────────────────

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

/** Full revamped CV — analysis scores + the user's real extracted data */
interface RevampedCV extends CVAnalysisResult {
  personal: CVBuiltData["personal"];
  experience: CVBuiltData["experience"];
  education: CVBuiltData["education"];
  skills: string[];
  certifications: string[];
  summary: string;
}

interface WorkEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EduEntry {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  yearCompleted: string;
  nqfLevel: string;
}

interface CVData {
  personal: {
    fullName: string; email: string; phone: string;
    location: string; province: string; linkedin: string; website: string;
  };
  summary: string;
  experience: WorkEntry[];
  education: EduEntry[];
  skills: string[];
  certifications: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

const SA_PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Mpumalanga", "Limpopo", "North West", "Free State", "Northern Cape",
];

const NQF_OPTIONS = [
  { value: "2", label: "NQF 2 — Grade 10 / ABET Level 2" },
  { value: "3", label: "NQF 3 — Grade 11 / ABET Level 3" },
  { value: "4", label: "NQF 4 — Matric / Trade Certificate" },
  { value: "5", label: "NQF 5 — Higher Certificate / N6" },
  { value: "6", label: "NQF 6 — Diploma / National Diploma" },
  { value: "7", label: "NQF 7 — Bachelor's Degree" },
  { value: "8", label: "NQF 8 — Honours / Postgrad Diploma" },
  { value: "9", label: "NQF 9 — Master's Degree" },
  { value: "10", label: "NQF 10 — Doctoral Degree" },
];

const BUILD_STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Experience", icon: Briefcase },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Skills", icon: Wrench },
  { id: 5, label: "Preview", icon: FileText },
];

const EMPTY_CV: CVData = {
  personal: { fullName: "", email: "", phone: "", location: "", province: "", linkedin: "", website: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
};

// ─── ScoreRing ────────────────────────────────────────────────────────────────

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

// ─── CV Preview (printable) ───────────────────────────────────────────────────

function CVPreview({ data }: { data: CVData }) {
  return (
    <div id="cv-preview" className="bg-white text-gray-900 p-8 rounded-xl shadow-lg text-sm font-sans print:shadow-none print:p-0">
      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{data.personal.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-gray-500 text-xs">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}{data.personal.province ? `, ${data.personal.province}` : ""}</span>}
          {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
          {data.personal.website && <span>{data.personal.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Work Experience</h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{exp.jobTitle || "Job Title"}</p>
                    <p className="text-gray-600">{exp.company || "Company"}</p>
                  </div>
                  <p className="text-gray-500 text-xs whitespace-nowrap">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Education & Qualifications</h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.qualification || "Qualification"}</p>
                  <p className="text-gray-600">{edu.institution}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}</p>
                  {edu.nqfLevel && <p className="text-gray-400 text-xs">NQF Level {edu.nqfLevel}</p>}
                </div>
                {edu.yearCompleted && <p className="text-gray-500 text-xs">{edu.yearCompleted}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {(data.skills.length > 0 || data.certifications.length > 0) && (
        <div>
          {data.skills.length > 0 && (
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Skills</h2>
              <p className="text-gray-700">{data.skills.join(" · ")}</p>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Certifications & Trade Papers</h2>
              <p className="text-gray-700">{data.certifications.join(" · ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Build from Scratch Form ──────────────────────────────────────────────────

const PROVINCE_DISPLAY_CV: Record<string, string> = {
  GAUTENG: "Gauteng", WESTERN_CAPE: "Western Cape", KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE: "Eastern Cape", FREE_STATE: "Free State", LIMPOPO: "Limpopo",
  MPUMALANGA: "Mpumalanga", NORTH_WEST: "North West", NORTHERN_CAPE: "Northern Cape",
};

function BuildFromScratch({ isPaid }: { isPaid: boolean }) {
  const { user } = useUser();
  const { triggerFeedback } = useFeedback();
  const [step, setStep] = useState(1);
  const [cv, setCv] = useState<CVData>(EMPTY_CV);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Pre-fill from saved profile on first mount
  useEffect(() => {
    if (profileLoaded) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = d.profile;
        setProfileLoaded(true);
        setCv((prev) => ({
          ...prev,
          personal: {
            ...prev.personal,
            fullName: prev.personal.fullName || user?.fullName || "",
            email:    prev.personal.email    || user?.primaryEmailAddress?.emailAddress || "",
            province: prev.personal.province || (p?.province ? (PROVINCE_DISPLAY_CV[p.province] ?? "") : ""),
            linkedin: prev.personal.linkedin || p?.linkedinUrl  || "",
            website:  prev.personal.website  || p?.portfolioUrl || "",
          },
          skills:  prev.skills.length  === 0 ? (p?.skills ?? []) : prev.skills,
          summary: prev.summary || p?.bio || "",
        }));
      })
      .catch(() => setProfileLoaded(true));
  }, [user, profileLoaded]);

  const update = (section: keyof CVData, value: CVData[keyof CVData]) =>
    setCv((prev) => ({ ...prev, [section]: value }));

  const updatePersonal = (field: keyof CVData["personal"], value: string) =>
    setCv((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));

  const addExperience = () =>
    update("experience", [
      ...cv.experience,
      { id: Date.now().toString(), jobTitle: "", company: "", startDate: "", endDate: "", current: false, description: "" },
    ]);

  const updateExp = (id: string, field: keyof WorkEntry, value: string | boolean) =>
    update("experience", cv.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const removeExp = (id: string) =>
    update("experience", cv.experience.filter((e) => e.id !== id));

  const addEducation = () =>
    update("education", [
      ...cv.education,
      { id: Date.now().toString(), institution: "", qualification: "", fieldOfStudy: "", yearCompleted: "", nqfLevel: "4" },
    ]);

  const updateEdu = (id: string, field: keyof EduEntry, value: string) =>
    update("education", cv.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const removeEdu = (id: string) =>
    update("education", cv.education.filter((e) => e.id !== id));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !cv.skills.includes(s)) update("skills", [...cv.skills, s]);
    setSkillInput("");
  };

  const addCert = () => {
    const c = certInput.trim();
    if (c && !cv.certifications.includes(c)) update("certifications", [...cv.certifications, c]);
    setCertInput("");
  };

  const handleDownload = () => {
    const html = generateBuiltCV(cv, !isPaid);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "My_CV_CareerIntel.html";
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    // Trigger CSAT 3 seconds after download
    setTimeout(() => triggerFeedback("cv-builder"), 3000);
  };

  const inputCls = "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <div className="space-y-5">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {BUILD_STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.id === step;
          const done = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  active ? "bg-indigo-600 text-white" :
                  done ? "bg-indigo-500/20 text-indigo-300 cursor-pointer hover:bg-indigo-500/30" :
                  "bg-secondary text-muted-foreground cursor-default"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < BUILD_STEPS.length - 1 && (
                <div className={`h-px flex-1 ${done ? "bg-indigo-500/40" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1 — Personal */}
              {step === 1 && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input className={inputCls} placeholder="e.g. Sipho Dlamini" value={cv.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <input className={inputCls} type="email" placeholder="sipho@email.com" value={cv.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} placeholder="071 234 5678" value={cv.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>City / Town</label>
                      <input className={inputCls} placeholder="e.g. Soweto, Johannesburg" value={cv.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Province</label>
                      <select className={inputCls} value={cv.personal.province} onChange={(e) => updatePersonal("province", e.target.value)}>
                        <option value="">Select province...</option>
                        {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>LinkedIn URL (optional)</label>
                      <input className={inputCls} placeholder="linkedin.com/in/sipho-dlamini" value={cv.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Professional Summary (optional — add in next steps if unsure)</label>
                    <textarea
                      className={`${inputCls} h-24 resize-none`}
                      placeholder="2–3 sentences about who you are and what you bring. E.g. 'Qualified electrician with 5 years experience in residential wiring and solar PV installations across Gauteng...'"
                      value={cv.summary}
                      onChange={(e) => update("summary", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2 — Experience */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Include jobs, learnerships, apprenticeships, informal work, or community work</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={addExperience}>
                        <Plus className="w-3.5 h-3.5" /> Add Job
                      </Button>
                    </div>
                    {cv.experience.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No experience added yet</p>
                        <p className="text-xs mt-1 opacity-70">Click &ldquo;Add Job&rdquo; above — include any work, even informal or part-time</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      {cv.experience.map((exp, idx) => (
                        <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Job {idx + 1}</span>
                            <button onClick={() => removeExp(exp.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Job Title *</label>
                              <input className={inputCls} placeholder="e.g. Electrician, Plumber, Sales Rep" value={exp.jobTitle} onChange={(e) => updateExp(exp.id, "jobTitle", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>Company / Employer *</label>
                              <input className={inputCls} placeholder="e.g. ABC Electrical, Self-employed" value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>Start Date</label>
                              <input className={inputCls} placeholder="e.g. January 2022" value={exp.startDate} onChange={(e) => updateExp(exp.id, "startDate", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>End Date</label>
                              <input className={inputCls} placeholder="e.g. December 2023" disabled={exp.current} value={exp.current ? "Present" : exp.endDate} onChange={(e) => updateExp(exp.id, "endDate", e.target.value)} />
                              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                                <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded" />
                                <span className="text-xs text-muted-foreground">Currently working here</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Key Responsibilities / Achievements</label>
                            <textarea
                              className={`${inputCls} h-20 resize-none`}
                              placeholder="Describe what you did and any achievements. E.g. 'Installed and maintained solar PV systems for 50+ residential clients. Reduced client energy bills by an average of 60%.'"
                              value={exp.description}
                              onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Education */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Education & Qualifications</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Include school, TVET college, university, trade certificates, learnerships, SETAs</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={addEducation}>
                        <Plus className="w-3.5 h-3.5" /> Add Qualification
                      </Button>
                    </div>
                    {cv.education.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                        <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No qualifications added yet</p>
                        <p className="text-xs mt-1 opacity-70">Click &ldquo;Add Qualification&rdquo; — this includes matric, trade certificates, learnerships</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      {cv.education.map((edu, idx) => (
                        <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Qualification {idx + 1}</span>
                            <button onClick={() => removeEdu(edu.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Qualification Name *</label>
                              <input className={inputCls} placeholder="e.g. Matric (NSC), N6 Electrical, B.Com" value={edu.qualification} onChange={(e) => updateEdu(edu.id, "qualification", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>Institution *</label>
                              <input className={inputCls} placeholder="e.g. Tshwane TVET, UCT, Ekurhuleni High" value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>Field of Study</label>
                              <input className={inputCls} placeholder="e.g. Electrical Engineering, Business" value={edu.fieldOfStudy} onChange={(e) => updateEdu(edu.id, "fieldOfStudy", e.target.value)} />
                            </div>
                            <div>
                              <label className={labelCls}>Year Completed</label>
                              <input className={inputCls} placeholder="e.g. 2022 or Still studying" value={edu.yearCompleted} onChange={(e) => updateEdu(edu.id, "yearCompleted", e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                              <label className={labelCls}>NQF Level</label>
                              <select className={inputCls} value={edu.nqfLevel} onChange={(e) => updateEdu(edu.id, "nqfLevel", e.target.value)}>
                                <option value="">Select NQF level...</option>
                                {NQF_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Skills & Certs */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1">Skills</h3>
                    <p className="text-xs text-muted-foreground mb-3">Add each skill and press Enter or the + button</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        className={`${inputCls} flex-1`}
                        placeholder="e.g. Plumbing, Python, Excel, Welding..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      />
                      <Button variant="outline" size="sm" onClick={addSkill} className="gap-1">
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                          {skill}
                          <button onClick={() => update("skills", cv.skills.filter((s) => s !== skill))} className="hover:text-red-400 ml-0.5">×</button>
                        </span>
                      ))}
                      {cv.skills.length === 0 && <p className="text-xs text-muted-foreground italic">No skills added yet</p>}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1">Certifications & Trade Papers</h3>
                    <p className="text-xs text-muted-foreground mb-3">Include trade certificates, SETA certs, PSIRA registration, SAQA certs, licenses</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        className={`${inputCls} flex-1`}
                        placeholder="e.g. Code 14 PDP, PSIRA Grade B, Solar PV Certificate..."
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
                      />
                      <Button variant="outline" size="sm" onClick={addCert} className="gap-1">
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.certifications.map((cert) => (
                        <span key={cert} className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 text-xs px-2.5 py-1 rounded-full">
                          {cert}
                          <button onClick={() => update("certifications", cv.certifications.filter((c) => c !== cert))} className="hover:text-red-400 ml-0.5">×</button>
                        </span>
                      ))}
                      {cv.certifications.length === 0 && <p className="text-xs text-muted-foreground italic">No certifications added yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Preview */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">CV Preview</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Click Download CV to open a premium print-ready version, then save as PDF</p>
                    </div>
                    <Button variant="indigo" size="sm" className="gap-2" onClick={handleDownload}>
                      <Download className="w-3.5 h-3.5" />
                      Download CV
                    </Button>
                  </div>
                  <CVPreview data={cv} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right panel — tips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              SA CV Tips — Step {step}
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              {step === 1 && [
                "Use your full legal name — no nicknames",
                "A Gmail or professional email looks better than old email addresses",
                "Include your province — many SA recruiters filter by location",
                "LinkedIn is increasingly expected even for trade jobs",
              ].map((tip, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{tip}</div>)}
              {step === 2 && [
                "Include learnerships, apprenticeships, and informal work — it all counts",
                "Use numbers where possible: '50 clients', 'R2M project', '3 staff supervised'",
                "List most recent job first",
                "Even matric holiday jobs show work ethic — include them if new to work",
              ].map((tip, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{tip}</div>)}
              {step === 3 && [
                "Always include your NQF level — SA corporates require it",
                "TVET N courses: list the highest N level you completed (N4, N5, N6)",
                "Trade certificates from SETAs are highly valued — list them all",
                "SAQA NLRD certification numbers add credibility for professional roles",
              ].map((tip, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{tip}</div>)}
              {step === 4 && [
                "Add both hard skills (Welding, Python) and soft skills (Communication)",
                "PSIRA, SAMTRAC, trade papers should go in Certifications",
                "Include driver&apos;s licence code (Code 8, 10, 14) if relevant",
                "Language skills matter in SA — add Zulu, Sotho, Afrikaans if applicable",
              ].map((tip, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{tip}</div>)}
              {step === 5 && [
                "Click 'Download CV' — a premium branded version opens in a new tab",
                "The print dialog launches automatically — choose 'Save as PDF'",
                "File name suggestion: FirstName_Surname_CV_2025.pdf",
                "Always send your CV as a PDF — never a Word doc",
              ].map((tip, i) => <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{tip}</div>)}
            </div>
          </div>

          {/* CV completeness */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">CV Completeness</h3>
            {[
              { label: "Personal Details", done: !!(cv.personal.fullName && cv.personal.email && cv.personal.phone) },
              { label: "Professional Summary", done: cv.summary.length > 30 },
              { label: "Work Experience", done: cv.experience.length > 0 },
              { label: "Education", done: cv.education.length > 0 },
              { label: "Skills", done: cv.skills.length >= 3 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                {item.done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  : <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30" />}
              </div>
            ))}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{[
                  !!(cv.personal.fullName && cv.personal.email && cv.personal.phone),
                  cv.summary.length > 30,
                  cv.experience.length > 0,
                  cv.education.length > 0,
                  cv.skills.length >= 3,
                ].filter(Boolean).length * 20}%</span>
              </div>
              <Progress
                value={[
                  !!(cv.personal.fullName && cv.personal.email && cv.personal.phone),
                  cv.summary.length > 30,
                  cv.experience.length > 0,
                  cv.education.length > 0,
                  cv.skills.length >= 3,
                ].filter(Boolean).length * 20}
                className="h-1.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <span className="text-xs text-muted-foreground">Step {step} of {BUILD_STEPS.length}</span>
        {step < BUILD_STEPS.length ? (
          <Button variant="indigo" size="sm" className="gap-2" onClick={() => setStep(Math.min(BUILD_STEPS.length, step + 1))}>
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button variant="indigo" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> Download CV
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CVBuilderPage() {
  const { triggerFeedback } = useFeedback();
  const [stage, setStage] = useState<"upload" | "analyzing" | "results" | "error">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RevampedCV | null>(null);
  const [revampError, setRevampError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [expandedSection, setExpandedSection] = useState<string | null>("suggestions");
  const [isPaid, setIsPaid] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.plan && d.plan !== "FREE") setIsPaid(true); })
      .catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setRevampError(null);
    setStage("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cv/revamp", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      // Merge with MOCK_ANALYSIS fallbacks so UI never shows undefined
      setAnalysis({
        personal: data.personal ?? { fullName: "", email: "", phone: "", location: "", province: "", linkedin: "", website: "" },
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        summary: data.summary ?? data.improvedSummary ?? "",
        improvedSummary: data.improvedSummary ?? data.summary ?? MOCK_ANALYSIS.improvedSummary,
        extractedSkills: Array.isArray(data.extractedSkills) ? data.extractedSkills : (Array.isArray(data.skills) ? data.skills : MOCK_ANALYSIS.extractedSkills),
        missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : MOCK_ANALYSIS.missingKeywords,
        atsScore: typeof data.atsScore === "number" ? data.atsScore : MOCK_ANALYSIS.atsScore,
        recruiterScore: typeof data.recruiterScore === "number" ? data.recruiterScore : MOCK_ANALYSIS.recruiterScore,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : MOCK_ANALYSIS.suggestions,
        strengths: Array.isArray(data.strengths) ? data.strengths : MOCK_ANALYSIS.strengths,
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : MOCK_ANALYSIS.weaknesses,
      });
      setStage("results");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to revamp CV";
      setRevampError(msg);
      setStage("error");
    }
  };

  const handleDownloadCV = () => {
    if (!analysis) return;

    // If we have real extracted data, use the fully-populated template
    const hasRealData = analysis.personal?.fullName || analysis.experience?.length > 0;

    let html: string;
    if (hasRealData) {
      const builtData: CVBuiltData = {
        personal: analysis.personal,
        summary: analysis.summary || analysis.improvedSummary,
        experience: analysis.experience,
        education: analysis.education,
        skills: analysis.skills?.length ? analysis.skills : analysis.extractedSkills,
        certifications: analysis.certifications,
      };
      html = generateRevampedCV(selectedTemplate, builtData, !isPaid);
    } else {
      // Fallback: placeholder template with AI analysis
      const templateData: CVTemplateData = {
        improvedSummary: analysis.improvedSummary,
        extractedSkills: analysis.extractedSkills,
        missingKeywords: analysis.missingKeywords,
        suggestions: analysis.suggestions,
      };
      html = generateCV(selectedTemplate, templateData, !isPaid);
    }

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "CareerIntel_Revamped_CV.html";
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    // Trigger CSAT after download
    setTimeout(() => triggerFeedback("cv-builder"), 3000);
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
            Upload your CV for AI analysis, or build a professional CV from scratch — free for everyone.
          </p>
        </div>
        {(stage === "results" || stage === "error") && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setStage("upload"); setFileName(null); setAnalysis(null); setRevampError(null); }}>
            <RefreshCw className="w-3.5 h-3.5" />
            New CV
          </Button>
        )}
      </div>

      <Tabs defaultValue="analyse">
        <TabsList className="mb-5">
          <TabsTrigger value="analyse" className="gap-2">
            <Zap className="w-3.5 h-3.5" />
            Analyse Existing CV
          </TabsTrigger>
          <TabsTrigger value="build" className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Build from Scratch
          </TabsTrigger>
        </TabsList>

        {/* ── Analyse tab ── */}
        <TabsContent value="analyse">
          {/* Score banner */}
          <AnimatePresence>
            {stage === "results" && analysis && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5"
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
            <div className="lg:col-span-3 space-y-5">
              {stage === "upload" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                      dragActive ? "border-indigo-500 bg-indigo-500/8" : "border-border hover:border-indigo-500/50 hover:bg-indigo-500/4"
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
                    <p className="text-muted-foreground text-sm mb-4">Supports PDF, DOC, DOCX · Max 10MB</p>
                    <Button variant="indigo" size="sm" className="pointer-events-none">Browse Files</Button>
                    <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ATS Score</span>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Rating</span>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Improvements</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {stage === "analyzing" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-5">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                      <Zap className="w-8 h-8 text-indigo-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Revamping your CV with AI...</h3>
                  <p className="text-muted-foreground text-sm mb-6">{fileName}</p>
                  <div className="space-y-3 max-w-xs mx-auto text-left">
                    {[
                      "Extracting text from your document...",
                      "Parsing personal details & work history...",
                      "Rewriting content for ATS optimisation...",
                      "Scoring against SA market standards...",
                    ].map((step, i) => (
                      <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.5 }} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ delay: i * 1.5, duration: 0.4 }}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </motion.div>
                        {step}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-6 opacity-60">This takes 15–30 seconds — AI is rewriting your content</p>
                </motion.div>
              )}

              {stage === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-red-500/20 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Revamp failed</h3>
                  <p className="text-sm text-muted-foreground mb-4">{revampError}</p>
                  <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                    If your CV is a scanned image PDF it cannot be read as text. Try uploading a Word (.docx) or text-based PDF version.
                  </p>
                  <Button variant="indigo" size="sm" onClick={() => { setStage("upload"); setFileName(null); setRevampError(null); }}>
                    Try Again
                  </Button>
                </motion.div>
              )}

              {stage === "results" && analysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* ── Revamped CV data preview ── */}
                  {analysis.personal?.fullName && (
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {analysis.personal.fullName.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "CV"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{analysis.personal.fullName}</span>
                            <Badge variant="success" className="text-xs gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Data extracted</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[analysis.personal.email, analysis.personal.phone, analysis.personal.location].filter(Boolean).join(" · ")}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {analysis.experience?.length > 0 && (
                              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-indigo-400" />{analysis.experience.length} job{analysis.experience.length !== 1 ? "s" : ""}</span>
                            )}
                            {analysis.education?.length > 0 && (
                              <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-indigo-400" />{analysis.education.length} qualification{analysis.education.length !== 1 ? "s" : ""}</span>
                            )}
                            {(analysis.skills?.length || analysis.extractedSkills?.length) > 0 && (
                              <span className="flex items-center gap-1"><Wrench className="w-3 h-3 text-indigo-400" />{analysis.skills?.length || analysis.extractedSkills?.length} skills</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-indigo-300 mt-3 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Your CV has been rewritten — choose a template and download your revamped version below
                      </p>
                    </div>
                  )}

                  {[
                    { key: "suggestions", icon: Sparkles, title: "AI Improvement Suggestions", items: analysis.suggestions, color: "indigo", badge: `${analysis.suggestions.length} suggestions` },
                    { key: "strengths", icon: Star, title: "CV Strengths", items: analysis.strengths, color: "emerald", badge: `${analysis.strengths.length} found` },
                    { key: "weaknesses", icon: AlertCircle, title: "Areas to Fix", items: analysis.weaknesses, color: "amber", badge: `${analysis.weaknesses.length} issues` },
                  ].map((section) => (
                    <div key={section.key} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)} className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-2.5">
                          <section.icon className={`w-4 h-4 ${section.color === "indigo" ? "text-indigo-400" : section.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`} />
                          <span className="text-sm font-semibold text-foreground">{section.title}</span>
                          <Badge variant={section.color === "indigo" ? "indigo" : section.color === "emerald" ? "success" : "warning"} className="text-xs">{section.badge}</Badge>
                        </div>
                        {expandedSection === section.key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <AnimatePresence>
                        {expandedSection === section.key && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                  <div className="bg-card border border-indigo-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-semibold text-foreground">AI-Improved Professional Summary</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{analysis.improvedSummary}&rdquo;</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  CV Templates
                </h3>
                <div className="space-y-2.5">
                  {CV_TEMPLATES.map((tmpl) => (
                    <div key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTemplate === tmpl.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-border hover:border-indigo-500/25 hover:bg-secondary"}`}>
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
                <Button
                  variant="indigo"
                  size="sm"
                  className="w-full mt-4 gap-2"
                  onClick={handleDownloadCV}
                  disabled={!analysis}
                >
                  <Download className="w-3.5 h-3.5" />
                  {analysis ? "Download Revamped CV" : "Upload a CV first"}
                </Button>
              </div>

              {analysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Skills Extracted
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {analysis.extractedSkills.map((skill) => <Badge key={skill} variant="success" className="text-xs">{skill}</Badge>)}
                  </div>
                  <div className="border-t border-border pt-3">
                    <h4 className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Missing High-Demand Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords.map((kw) => <Badge key={kw} variant="warning" className="text-xs">{kw}</Badge>)}
                    </div>
                  </div>
                </motion.div>
              )}

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
        </TabsContent>

        {/* ── Build tab ── */}
        <TabsContent value="build">
          <BuildFromScratch isPaid={isPaid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
