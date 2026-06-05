"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap, BookOpen, Target, MessageCircle,
  ChevronRight, ExternalLink, CheckCircle2, Lightbulb,
  Star, TrendingUp, Zap, Search, X, FileText, AlertCircle, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { CAREER_SUBJECTS, SUBJECT_GROUPS, HS_STUDY_RESOURCES } from "@/lib/data/sa-subjects";
import { formatSalaryRange, getDemandBadgeColor } from "@/lib/utils";

// ── NQF level display helper ──────────────────────────────────────────────────

const NQF_LEVELS = [
  { level: 4,  label: "Grade 12 / Matric",           color: "bg-secondary text-muted-foreground" },
  { level: 5,  label: "Higher Certificate (1 year)",  color: "bg-indigo-500/15 text-indigo-300" },
  { level: 6,  label: "Diploma (2–3 years)",          color: "bg-violet-500/15 text-violet-300" },
  { level: 7,  label: "Bachelor's Degree (3–4 years)", color: "bg-emerald-500/15 text-emerald-300" },
  { level: 8,  label: "Honours / Professional (1 yr)", color: "bg-amber-500/15 text-amber-300" },
  { level: 9,  label: "Master's Degree (2 years)",    color: "bg-orange-500/15 text-orange-300" },
  { level: 10, label: "Doctorate / PhD (3–5 years)",  color: "bg-red-500/15 text-red-300" },
];

// ── Career card for HS view ───────────────────────────────────────────────────

function HSCareerCard({
  career,
  userSubjects,
  onExplore,
}: {
  career: (typeof SA_CAREERS)[0];
  userSubjects: string[];
  onExplore: () => void;
}) {
  const reqs = CAREER_SUBJECTS[career.id];
  const hasRequiredSubjects =
    reqs && userSubjects.length > 0
      ? reqs.required.every((s) => userSubjects.includes(s))
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        hasRequiredSubjects === true
          ? "border-emerald-500/30 hover:border-emerald-500/50"
          : hasRequiredSubjects === false
          ? "border-border opacity-70"
          : "border-border hover:border-indigo-500/40"
      }`}
      onClick={onExplore}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{career.title}</h3>
          <p className="text-xs text-muted-foreground">{career.sector}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {hasRequiredSubjects === true && (
            <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium">✓ Matches</span>
          )}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${getDemandBadgeColor(career.demandScore)}`}>
            {career.demandScore}
          </span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-3">{formatSalaryRange(career.minSalaryZar, career.maxSalaryZar)}/mo</div>

      {reqs && (
        <div className="space-y-1">
          {reqs.required.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reqs.required.map((s) => (
                <span
                  key={s}
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                    userSubjects.includes(s)
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HighSchoolPage() {
  const router = useRouter();
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"careers" | "pathway" | "resources" | "apply">("careers");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile?.subjects?.length) setUserSubjects(profile.subjects);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, []);

  // Filter careers by user subjects and/or search and/or subject chip filter
  const filteredCareers = SA_CAREERS.filter((c) => {
    const reqs = CAREER_SUBJECTS[c.id];
    if (!reqs) return false; // only show careers with subject mappings

    const matchSearch =
      search.length === 0 ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase());

    const matchSubjectFilter =
      selectedSubjectFilter === null
        ? true
        : [...(reqs.required ?? []), ...(reqs.recommended ?? [])].includes(selectedSubjectFilter);

    return matchSearch && matchSubjectFilter;
  }).sort((a, b) => {
    // If user has subjects, put matching careers first
    if (userSubjects.length > 0) {
      const aReqs = CAREER_SUBJECTS[a.id];
      const bReqs = CAREER_SUBJECTS[b.id];
      const aMatch = aReqs ? aReqs.required.every((s) => userSubjects.includes(s)) : false;
      const bMatch = bReqs ? bReqs.required.every((s) => userSubjects.includes(s)) : false;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    return b.demandScore - a.demandScore;
  });

  const matchingCount = userSubjects.length > 0
    ? filteredCareers.filter((c) => {
        const r = CAREER_SUBJECTS[c.id];
        return r && r.required.every((s) => userSubjects.includes(s));
      }).length
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">High School Career Hub</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Explore careers that match your Grade 10–12 subjects, understand the NQF pathway from matric to your dream job, and find free study resources.
        </p>
      </div>

      {/* Subject profile banner */}
      {profileLoaded && userSubjects.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground mb-1">Set up your subject profile</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add your CAPS subjects to your profile and we&apos;ll highlight which careers you qualify for and show your match score.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => router.push("/profile")}
          >
            Add Subjects <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {profileLoaded && userSubjects.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">
                  {matchingCount} career{matchingCount !== 1 ? "s" : ""} match your subjects
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {userSubjects.map((s) => (
                  <span key={s} className="text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs"
              onClick={() => router.push("/profile")}
            >
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {([
          { key: "careers",   label: "Careers", icon: Target },
          { key: "pathway",   label: "NQF Pathway", icon: TrendingUp },
          { key: "resources", label: "Study Resources", icon: BookOpen },
          { key: "apply",     label: "Apply to University", icon: FileText },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Careers Tab ───────────────────────────────────────────────────────── */}
      {activeTab === "careers" && (
        <div className="space-y-5">
          {/* Search + subject filter */}
          <div className="space-y-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="pl-9"
              />
            </div>

            {/* All CAPS subjects grouped */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Filter by subject:</span>
                {selectedSubjectFilter && (
                  <button
                    onClick={() => setSelectedSubjectFilter(null)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>
              {SUBJECT_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide mb-1.5">{group.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.subjects.map((s) => {
                      const isSelected = selectedSubjectFilter === s;
                      const isUserSubject = userSubjects.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSubjectFilter(isSelected ? null : s)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                            isSelected
                              ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                              : isUserSubject
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/60"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-indigo-500/30"
                          }`}
                        >
                          {isUserSubject && !isSelected && "✓ "}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCareers.map((career) => (
              <HSCareerCard
                key={career.id}
                career={career}
                userSubjects={userSubjects}
                onExplore={() => router.push(`/job-market`)}
              />
            ))}
          </div>

          {filteredCareers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No careers found for that filter. <button className="text-indigo-400 hover:text-indigo-300" onClick={() => { setSearch(""); setSelectedSubjectFilter(null); }}>Clear filters</button>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-card border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-foreground">Ask the AI Career Coach</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Not sure which career suits your subjects? Ask the AI anything — it knows the CAPS curriculum and SA job market.
              </p>
              <Button
                variant="indigo"
                size="sm"
                className="gap-2 w-full"
                onClick={() => router.push("/career-coach?q=I'm+a+high+school+student.+Which+careers+suit+my+subjects?")}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat with AI Coach
              </Button>
            </div>
            <div className="bg-card border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">Skills Gap Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Pick a target career and see exactly what skills and qualifications you&apos;ll need to get there from Grade 12.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={() => router.push("/skills-gap")}
              >
                <Target className="w-3.5 h-3.5" />
                Analyse My Gap
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── NQF Pathway Tab ───────────────────────────────────────────────────── */}
      {activeTab === "pathway" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              The NQF Pathway — From Grade 12 to Your Career
            </h2>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              The National Qualifications Framework (NQF) is South Africa&apos;s 10-level system for qualifications. Grade 12 (Matric) is NQF Level 4. Every career path has a minimum NQF level requirement — here&apos;s how to get there.
            </p>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-4 top-8 bottom-8 w-px bg-border" />

              <div className="space-y-4">
                {NQF_LEVELS.map((lvl, i) => (
                  <motion.div
                    key={lvl.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 relative"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${lvl.color}`}>
                      {lvl.level}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-sm font-medium text-foreground">{lvl.label}</div>
                      {lvl.level === 4 && (
                        <div className="text-xs text-muted-foreground mt-0.5">You are here ← Starting point for all careers</div>
                      )}
                      {lvl.level === 5 && (
                        <div className="text-xs text-muted-foreground mt-0.5">TVET N4-N6, learnerships, bridging programmes — 1 year full-time</div>
                      )}
                      {lvl.level === 6 && (
                        <div className="text-xs text-muted-foreground mt-0.5">2–3 year Diploma at university or TVET (Nursing, Engineering, Business)</div>
                      )}
                      {lvl.level === 7 && (
                        <div className="text-xs text-muted-foreground mt-0.5">3–4 year Bachelor's Degree — required for most professional careers</div>
                      )}
                      {lvl.level === 8 && (
                        <div className="text-xs text-muted-foreground mt-0.5">Honours, Postgraduate Diploma, Professional degrees (MBChB, LLB, BEng)</div>
                      )}
                      {lvl.level === 9 && (
                        <div className="text-xs text-muted-foreground mt-0.5">Master's — for research, specialist roles, or career acceleration</div>
                      )}
                      {lvl.level === 10 && (
                        <div className="text-xs text-muted-foreground mt-0.5">Doctorate (PhD) — academic, research, and top specialist positions</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Funding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">NSFAS — Free University Funding</h3>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>If your household earns <strong className="text-foreground">below R350,000/year</strong>, you qualify for NSFAS funding at any public university or TVET college.</p>
                <p>NSFAS covers tuition, accommodation, meals, transport, and a personal allowance.</p>
                <div className="mt-3">
                  <a
                    href="https://www.nsfas.org.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Apply at nsfas.org.za <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-card border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-foreground">Bursaries & Learnerships</h3>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Many South African companies offer bursaries for scarce skills: <strong className="text-foreground">Engineering, IT, Health, Finance</strong>.</p>
                <p>SETAs (e.g. MERSETA, ISETT, HWSETA) fund learnerships and apprenticeships — earn while you learn.</p>
                <div className="space-y-1 mt-2">
                  {["Anglo American", "Sasol", "Eskom", "Standard Bank", "Transnet"].map((co) => (
                    <div key={co} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{co} — annual bursary programme</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TVET vs University */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Two Paths After Grade 12</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">University Route</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />3–6 year degrees (NQF 7–8)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />Requires APS of 25+ for most programmes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />Mathematics required for Engineering, Sciences, IT, Finance</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />NSFAS or bursary can cover costs if you qualify</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-300 uppercase tracking-wide">TVET / Trade Route</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />N1–N6 programmes (NQF 4–6) — 1–3 years</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Apprenticeships: earn while you learn</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Mathematical Literacy accepted for most programmes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Electricians, plumbers, welders earn R20k–R60k+/month</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Study Resources Tab ───────────────────────────────────────────────── */}
      {activeTab === "resources" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HS_STUDY_RESOURCES.map((res) => (
              <motion.div
                key={res.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-foreground">{res.name}</h3>
                  </div>
                  {res.free && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">FREE</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{res.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {res.subjects.map((s) => (
                    <span key={s} className="text-[10px] bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Visit {res.name} <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>

          {/* Exam tips */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Matric Exam Tips for High Demand Careers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              {[
                {
                  subject: "Mathematics",
                  tip: "You need at least 50% to qualify for most university science and engineering programmes. Practice past papers from 2015 onwards. Focus on functions, calculus, and statistics.",
                  color: "indigo",
                },
                {
                  subject: "Physical Sciences",
                  tip: "Required for medicine, engineering, and most science degrees. Separate your Physics and Chemistry revision. Past papers are your best preparation tool.",
                  color: "violet",
                },
                {
                  subject: "Life Sciences",
                  tip: "Critical for medicine, nursing, pharmacy, and environmental science. Study diagrams carefully — they are heavily assessed. Use Siyavula for free practice.",
                  color: "emerald",
                },
                {
                  subject: "Accounting",
                  tip: "The gateway to CA(SA). Work through every financial statement question until it becomes second nature. Marks are awarded for workings shown, not just the final answer.",
                  color: "amber",
                },
              ].map((item) => (
                <div key={item.subject} className="bg-secondary rounded-xl p-3">
                  <div className={`text-xs font-semibold mb-1 ${
                    item.color === "indigo" ? "text-indigo-300" :
                    item.color === "violet" ? "text-violet-300" :
                    item.color === "emerald" ? "text-emerald-300" : "text-amber-300"
                  }`}>{item.subject}</div>
                  <p className="leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach CTA */}
          <div className="bg-card border border-indigo-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">Have a career question?</div>
              <p className="text-xs text-muted-foreground">
                Ask the AI Career Coach about subjects, bursaries, university requirements, or any career guidance question.
              </p>
            </div>
            <Button
              variant="indigo"
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={() => router.push("/career-coach")}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask AI Coach
            </Button>
          </div>
        </div>
      )}
      {/* ── Apply to University Tab ───────────────────────────────────────────── */}
      {activeTab === "apply" && (
        <div className="space-y-6">

          {/* Important notice */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Application deadlines vary per institution. Most SA universities open applications in <strong className="text-amber-300">April–June</strong> for the following year. Apply early — popular programmes fill up fast.
            </p>
          </div>

          {/* CAO */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-border px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">CAO — Central Applications Office</h3>
                <p className="text-xs text-muted-foreground">Apply to multiple universities with one form</p>
              </div>
              <span className="ml-auto text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">RECOMMENDED</span>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The CAO allows you to apply to multiple universities in one application. It covers most universities in the Western Cape, KwaZulu-Natal, and other provinces. <strong className="text-foreground">Application fee: R100 (first choice) + R100 per additional choice.</strong>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Opens", value: "April each year" },
                  { label: "Closes", value: "September 30" },
                  { label: "Fee", value: "R100–R400" },
                  { label: "Results", value: "November–January" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary rounded-lg p-2.5 text-center">
                    <div className="text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="font-semibold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
              <a
                href="https://www.cao.ac.za/Apply.aspx?content=Apply"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Apply via CAO <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* University direct applications */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              Direct University Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  name: "University of Cape Town (UCT)",
                  short: "UCT",
                  location: "Cape Town, Western Cape",
                  deadline: "31 July (some faculties vary)",
                  fee: "R100",
                  url: "https://www.uct.ac.za/apply-to-uct/undergraduate",
                  color: "indigo",
                  note: "Apply directly — UCT does not use CAO",
                },
                {
                  name: "University of the Witwatersrand (Wits)",
                  short: "Wits",
                  location: "Johannesburg, Gauteng",
                  deadline: "30 September",
                  fee: "R200",
                  url: "https://www.wits.ac.za/applications/",
                  color: "violet",
                  note: "Apply directly via Wits online portal",
                },
                {
                  name: "University of Pretoria (UP)",
                  short: "UP / Tuks",
                  location: "Pretoria, Gauteng",
                  deadline: "31 August",
                  fee: "R300",
                  url: "https://www.up.ac.za/apply-to-up",
                  color: "blue",
                  note: "Apply directly via UP portal",
                },
                {
                  name: "Stellenbosch University (SU)",
                  short: "Maties",
                  location: "Stellenbosch, Western Cape",
                  deadline: "31 July",
                  fee: "R100 (via CAO)",
                  url: "https://www.sun.ac.za/english/Pages/How-to-apply.aspx",
                  color: "amber",
                  note: "Also accepts CAO applications",
                },
                {
                  name: "University of KwaZulu-Natal (UKZN)",
                  short: "UKZN",
                  location: "Durban & PMB, KZN",
                  deadline: "30 September",
                  fee: "R200",
                  url: "https://applications.ukzn.ac.za/",
                  color: "emerald",
                  note: "Apply via CAO or directly",
                },
                {
                  name: "University of Johannesburg (UJ)",
                  short: "UJ",
                  location: "Johannesburg, Gauteng",
                  deadline: "30 September",
                  fee: "R200",
                  url: "https://www.uj.ac.za/apply-to-uj/",
                  color: "rose",
                  note: "Apply directly via UJ online portal",
                },
                {
                  name: "UNISA (Distance Learning)",
                  short: "UNISA",
                  location: "Nationwide (Online)",
                  deadline: "October (Sem 1) / July (Sem 2)",
                  fee: "Free application",
                  url: "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission",
                  color: "teal",
                  note: "Largest university in Africa — study while working",
                },
                {
                  name: "University of the Free State (UFS)",
                  short: "UFS / Kovsies",
                  location: "Bloemfontein, Free State",
                  deadline: "30 September",
                  fee: "R200",
                  url: "https://apply.ufs.ac.za/Application/Start",
                  color: "orange",
                  note: "Apply directly via UFS portal",
                },
                {
                  name: "Rhodes University",
                  short: "Rhodes",
                  location: "Makhanda, Eastern Cape",
                  deadline: "30 September",
                  fee: "R100",
                  url: "https://www.ru.ac.za/prospective/howtoapply/",
                  color: "indigo",
                  note: "Top-ranked for Law, Journalism, Science",
                },
                {
                  name: "University of Limpopo (UL)",
                  short: "UL / Turfloop",
                  location: "Polokwane, Limpopo",
                  deadline: "30 September",
                  fee: "R150",
                  url: "https://ulc-prod-webserver.ul.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP",
                  color: "violet",
                  note: "Strong in Health Sciences and Agriculture",
                },
                {
                  name: "Walter Sisulu University (WSU)",
                  short: "WSU",
                  location: "East London & Mthatha, Eastern Cape",
                  deadline: "30 September",
                  fee: "R150",
                  url: "https://applications.wsu.ac.za/",
                  color: "emerald",
                  note: "Apply via CAO or directly",
                },
                {
                  name: "University of Venda (UNIVEN)",
                  short: "UNIVEN",
                  location: "Thohoyandou, Limpopo",
                  deadline: "30 September",
                  fee: "R100",
                  url: "https://www.univen.ac.za/students/student-support-services/how-to-apply/",
                  color: "amber",
                  note: "Strong in Nursing, Agriculture, Law",
                },
              ].map((uni) => (
                <motion.div
                  key={uni.short}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{uni.short}</h4>
                      <p className="text-[11px] text-muted-foreground">{uni.location}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{uni.note}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      Deadline: <span className="text-foreground font-medium">{uni.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      Fee: <span className="text-foreground font-medium">{uni.fee}</span>
                    </div>
                  </div>
                  <a
                    href={uni.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Apply to {uni.short} <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* TVET Colleges */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              TVET College Applications
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              TVET colleges offer National Certificate (Vocational) and Report 191 programmes. Applications are made directly to each college. Most open in September–October for the following year.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: "DHET TVET Portal", desc: "Central portal to find your nearest TVET college", url: "https://www.dhet.gov.za/tvet" },
                { name: "Ekurhuleni East TVET", desc: "Gauteng — Engineering, Business, IT programmes", url: "https://www.eec.edu.za" },
                { name: "False Bay TVET", desc: "Western Cape — wide range of vocational programmes", url: "https://www.falsebay.edu.za" },
              ].map((tvet) => (
                <div key={tvet.name} className="bg-secondary rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-foreground mb-1">{tvet.name}</h4>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{tvet.desc}</p>
                  <a href={tvet.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                    Visit <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Bursaries & Funding */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Funding Your Studies
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Don&apos;t let money stop you — SA has multiple funding options.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  name: "NSFAS",
                  desc: "Free funding for households earning below R350,000/year. Covers tuition, accommodation & meals.",
                  url: "https://www.nsfas.org.za/content/how-to-apply.html",
                  badge: "Most Students Qualify",
                  badgeColor: "emerald",
                },
                {
                  name: "Funza Lushaka Bursary",
                  desc: "Full bursary for teaching degrees. Work at a public school after graduating to repay.",
                  url: "https://www.funzalushaka.doe.gov.za",
                  badge: "Teaching",
                  badgeColor: "indigo",
                },
                {
                  name: "NRDP Bursary (DHET)",
                  desc: "For scarce skills like Engineering, Science, Agriculture, and Health Sciences.",
                  url: "https://www.dhet.gov.za/bursaries",
                  badge: "Scarce Skills",
                  badgeColor: "violet",
                },
                {
                  name: "SETA Bursaries",
                  desc: "Each SETA (MERSETA, ETDP, MICT etc.) offers bursaries for qualifications in their sector.",
                  url: "https://www.qcto.org.za",
                  badge: "Sector Specific",
                  badgeColor: "amber",
                },
              ].map((fund) => (
                <div key={fund.name} className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-foreground">{fund.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      fund.badgeColor === "emerald" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                      fund.badgeColor === "indigo" ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/25" :
                      fund.badgeColor === "violet" ? "bg-violet-500/15 text-violet-400 border-violet-500/25" :
                      "bg-amber-500/15 text-amber-400 border-amber-500/25"
                    }`}>{fund.badge}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{fund.desc}</p>
                  <a href={fund.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                    Apply for {fund.name} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Government jobs — ESSA */}
          <div className="bg-card border border-emerald-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-base">🏛️</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground mb-1">Looking for government jobs?</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Search official Department of Labour vacancies on <strong className="text-foreground">ESSA</strong> — South Africa&apos;s free government employment service with thousands of public sector jobs.
                </p>
              </div>
            </div>
            <a
              href="https://essa.labour.gov.za"
              target="_blank"
              rel="noopener noreferrer external"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Search ESSA Jobs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* AI Coach CTA */}
          <div className="bg-card border border-indigo-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">Not sure which university to choose?</div>
              <p className="text-xs text-muted-foreground">Ask the AI Career Coach — it knows SA university requirements, APS scores, and which programmes suit your subjects.</p>
            </div>
            <Button variant="indigo" size="sm" className="gap-2 flex-shrink-0" onClick={() => router.push("/career-coach")}>
              <MessageCircle className="w-3.5 h-3.5" />
              Ask AI Coach
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
