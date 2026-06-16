"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp, Target, Zap, ArrowRight, Brain,
  FileText, MessageCircle, BarChart3, Sparkles,
  AlertCircle, CheckCircle2, Clock, ChevronRight,
  Award, Globe, BookOpen, Gift, X,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoadmapWidget } from "@/components/roadmap-widget";
import { ReferralWidget } from "@/components/referral-widget";
import { GamificationPanel } from "@/components/gamification-panel";
import { SA_CAREERS, TOP_GROWING_CAREERS_2025 } from "@/lib/data/sa-careers";
import { formatSalaryRange, getDemandBadgeColor, getTrendLabel } from "@/lib/utils";

interface ScoreComponent { score: number; max: number; pct: number; }

interface DashboardStats {
  employabilityScore: number;
  profileStrength: number;
  scoreComponents?: {
    skills:   ScoreComponent;
    profile:  ScoreComponent;
    activity: ScoreComponent;
  };
  skillsCount: number;
  targetRole: string | null;
  currentRole: string | null;
  chatSessionsCount: number;
  skillsGapCount: number;
  careerPathCount: number;
  hasCV: boolean;
  plan: string;
  onboarded: boolean;
}

const DEMAND_TREND_DATA = [
  { month: "Jan", tech: 72, finance: 58, healthcare: 65, energy: 55 },
  { month: "Feb", tech: 74, finance: 60, healthcare: 67, energy: 58 },
  { month: "Mar", tech: 78, finance: 59, healthcare: 70, energy: 64 },
  { month: "Apr", tech: 80, finance: 62, healthcare: 71, energy: 69 },
  { month: "May", tech: 84, finance: 61, healthcare: 74, energy: 74 },
  { month: "Jun", tech: 86, finance: 65, healthcare: 77, energy: 79 },
  { month: "Jul", tech: 88, finance: 63, healthcare: 78, energy: 82 },
  { month: "Aug", tech: 90, finance: 67, healthcare: 80, energy: 86 },
  { month: "Sep", tech: 91, finance: 66, healthcare: 82, energy: 89 },
  { month: "Oct", tech: 93, finance: 70, healthcare: 84, energy: 91 },
  { month: "Nov", tech: 92, finance: 69, healthcare: 85, energy: 90 },
  { month: "Dec", tech: 94, finance: 72, healthcare: 87, energy: 92 },
];

const SKILLS_RADAR_DATA = [
  { subject: "Technical", A: 72, fullMark: 100 },
  { subject: "Data", A: 45, fullMark: 100 },
  { subject: "Leadership", A: 60, fullMark: 100 },
  { subject: "Communication", A: 80, fullMark: 100 },
  { subject: "Problem Solving", A: 75, fullMark: 100 },
  { subject: "Domain", A: 55, fullMark: 100 },
];

// Static fallback insights — shown when the user has completed most profile steps
const MARKET_INSIGHTS = [
  { type: "opportunity", icon: TrendingUp, color: "emerald", text: "Renewable Energy roles in Western Cape grew 45% this quarter — Solar PV and electrical skills are in top demand." },
  { type: "warning",     icon: AlertCircle, color: "amber",  text: "Data Analysis skills are in the top 3 scarcest in SA. Adding SQL & Power BI could increase your salary by R12k/month." },
  { type: "action",      icon: Target,      color: "indigo", text: "Cloud Architect roles (R60k–R180k/mo) have surged 38% in SA. AWS Cloud Practitioner cert is the fastest entry point." },
  { type: "opportunity", icon: Globe,       color: "emerald", text: "Cybersecurity roles in SA are 40% unfilled — CISSP or CompTIA Security+ adds R15–25k/month to average packages." },
];

const QUICK_ACTIONS = [
  { href: "/cv-builder", icon: FileText, label: "Improve My CV", description: "Get ATS & recruiter scores", color: "indigo" },
  { href: "/career-coach", icon: MessageCircle, label: "Ask Career Coach", description: "24/7 AI guidance", color: "violet" },
  { href: "/skills-gap", icon: Target, label: "Analyse Skills Gap", description: "See what's missing", color: "emerald" },
  { href: "/career-paths", icon: Brain, label: "Simulate Career", description: "5-year projection", color: "amber" },
];

function EmployabilityRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
          <motion.circle
            cx="64" cy="64" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="text-4xl font-bold text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold" style={{ color }}>{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">Employability Score</div>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  const topCareers = SA_CAREERS.slice(0, 5);
  const searchParams = useSearchParams();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Show welcome credits banner if redirected from onboarding with ?welcome=1
  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcomeBanner(true);
      // Auto-dismiss after 8 seconds
      const t = setTimeout(() => setShowWelcomeBanner(false), 8000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const [stats, setStats] = useState<DashboardStats>({
    employabilityScore: 0,
    profileStrength: 0,
    skillsCount: 0,
    targetRole: null,
    currentRole: null,
    chatSessionsCount: 0,
    skillsGapCount: 0,
    careerPathCount: 0,
    hasCV: false,
    plan: "FREE",
    onboarded: true,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.employabilityScore !== undefined) {
          setStats(d);
          setStatsLoaded(true);
        }
      })
      .catch(() => setStatsLoaded(true));
  }, []);

  const employabilityScore = stats.employabilityScore;
  const profileStrength    = stats.profileStrength;

  // Dynamic insights — personalised next-step nudges based on real user data
  const insights = useMemo(() => {
    if (!statsLoaded) return MARKET_INSIGHTS.slice(0, 3);
    const items: { type: string; icon: React.ElementType; color: string; text: string }[] = [];

    if (stats.skillsCount === 0) {
      items.push({ type: "action", icon: Target, color: "indigo",
        text: "You haven't added any skills yet. Add at least 3 skills to your profile to unlock your Skills Score and career matching." });
    } else if (stats.skillsCount < 5) {
      items.push({ type: "action", icon: Target, color: "indigo",
        text: `You have ${stats.skillsCount} skill${stats.skillsCount !== 1 ? "s" : ""} — aim for at least 8 to maximise your match score and recruiter visibility.` });
    }

    if (!stats.hasCV) {
      items.push({ type: "warning", icon: FileText, color: "amber",
        text: "No CV on file. SA recruiters expect a PDF CV — build yours in under 5 minutes using the AI CV Builder." });
    }

    if (stats.skillsGapCount === 0) {
      items.push({ type: "action", icon: BookOpen, color: "violet",
        text: `Run a Skills Gap Analysis${stats.targetRole ? ` for ${stats.targetRole}` : ""} to see exactly what's missing and get a personalised learning roadmap.` });
    }

    if (stats.chatSessionsCount === 0) {
      items.push({ type: "opportunity", icon: MessageCircle, color: "emerald",
        text: "Start a Career Coach session — ask about SA salary benchmarks, interview prep, or how to break into your target industry." });
    }

    if (profileStrength < 50) {
      items.push({ type: "warning", icon: AlertCircle, color: "amber",
        text: `Your profile is ${profileStrength}% complete. A fully completed profile increases recruiter visibility and improves your Employability Score.` });
    }

    // Pad to 3 with market insights if not enough personalised ones
    for (const insight of MARKET_INSIGHTS) {
      if (items.length >= 3) break;
      items.push(insight);
    }

    return items.slice(0, 3);
  }, [statsLoaded, stats, profileStrength]);

  // Redirect genuinely new users (no profile data at all) to onboarding.
  // We check targetRole + currentRole as a fallback so that users who
  // completed the form but had a transient API failure aren't caught in a
  // redirect loop — if they have any profile data they're not "new".
  useEffect(() => {
    if (statsLoaded && !stats.onboarded && !stats.targetRole && !stats.currentRole) {
      window.location.href = "/onboarding";
    }
  }, [statsLoaded, stats.onboarded, stats.targetRole, stats.currentRole]);

  return (
    <div className="space-y-6">

      {/* Welcome credits banner */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 rounded-xl px-4 py-3.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                🎉 10 free credits added to your account!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Welcome to CareerIntel SA. Use your credits to try the AI Career Coach, CV Builder, and Skills Gap analysis.
              </p>
            </div>
            <button
              onClick={() => setShowWelcomeBanner(false)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div {...fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night"; })()}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your career intelligence snapshot for today.
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {profileStrength >= 100 ? "View Profile" : "Complete Profile"}
            <span className={`text-xs px-1.5 rounded ${profileStrength >= 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>{profileStrength}%</span>
          </Button>
        </Link>
      </motion.div>

      {/* Top stat row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Employability Score", value: statsLoaded ? `${employabilityScore}/100` : "—", change: employabilityScore >= 70 ? "Keep it up!" : "Complete profile to improve", icon: Award, color: "indigo" },
          { label: "Target Role", value: statsLoaded ? (stats.targetRole || "Not set") : "—", change: stats.currentRole || "Set in profile", icon: Target, color: "emerald" },
          { label: "Skills Added", value: statsLoaded ? String(stats.skillsCount) : "—", change: stats.skillsCount === 0 ? "Add skills in profile" : `${stats.skillsCount} skills tracked`, icon: CheckCircle2, color: "violet" },
          { label: "AI Sessions", value: statsLoaded ? String(stats.chatSessionsCount + stats.skillsGapCount) : "—", change: `${stats.chatSessionsCount} chats · ${stats.skillsGapCount} gap analyses`, icon: TrendingUp, color: "amber" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stat.color === "indigo" ? "bg-indigo-500/15" :
                stat.color === "emerald" ? "bg-emerald-500/15" :
                stat.color === "violet" ? "bg-violet-500/15" : "bg-amber-500/15"
              }`}>
                <stat.icon className={`w-4 h-4 ${
                  stat.color === "indigo" ? "text-indigo-400" :
                  stat.color === "emerald" ? "text-emerald-400" :
                  stat.color === "violet" ? "text-violet-400" : "text-amber-400"
                }`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employability score + skills radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground">Employability Score</h2>
            <Link href="/profile">
              <Badge variant="indigo" className="cursor-pointer hover:opacity-80 transition-opacity">
                Improve
              </Badge>
            </Link>
          </div>

          <EmployabilityRing score={employabilityScore} />

          <div className="mt-6 space-y-3">
            {[
              {
                label: "Skills Added",
                value: stats.scoreComponents?.skills.pct ?? 0,
                sub:   `${stats.skillsCount} skill${stats.skillsCount !== 1 ? "s" : ""} · ${stats.scoreComponents?.skills.score ?? 0}/40 pts`,
                color: "bg-indigo-500",
              },
              {
                label: "Profile Completeness",
                value: profileStrength,
                sub:   `${stats.scoreComponents?.profile.score ?? 0}/30 pts`,
                color: "bg-amber-500",
              },
              {
                label: "Platform Activity",
                value: stats.scoreComponents?.activity.pct ?? 0,
                sub:   `Chats · gap analyses · simulations · ${stats.scoreComponents?.activity.score ?? 0}/30 pts`,
                color: "bg-emerald-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-1.5" indicatorClassName={item.color} />
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Demand trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Sector Demand Trends 2025</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Demand score by industry · South Africa</p>
            </div>
            <Link href="/job-market">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                Full Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {[
              { color: "#6366f1", label: "Technology" },
              { color: "#10b981", label: "Energy" },
              { color: "#f59e0b", label: "Healthcare" },
              { color: "#8b5cf6", label: "Finance" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEMAND_TREND_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                {[
                  { id: "tech", color: "#6366f1" },
                  { id: "energy", color: "#10b981" },
                  { id: "healthcare", color: "#f59e0b" },
                  { id: "finance", color: "#8b5cf6" },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`grad_${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} domain={[40, 100]} />
              <Tooltip
                contentStyle={{ background: "rgba(13,21,38,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="tech" stroke="#6366f1" fill="url(#grad_tech)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="energy" stroke="#10b981" fill="url(#grad_energy)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="healthcare" stroke="#f59e0b" fill="url(#grad_healthcare)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="finance" stroke="#8b5cf6" fill="url(#grad_finance)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            <Badge variant="indigo">{insights.length} tips</Badge>
          </div>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  insight.color === "emerald"
                    ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-100/80"
                    : insight.color === "amber"
                    ? "bg-amber-500/8 border-amber-500/20 text-amber-100/80"
                    : "bg-indigo-500/8 border-indigo-500/20 text-indigo-100/80"
                }`}
              >
                <div className="flex items-start gap-2">
                  <insight.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                    insight.color === "emerald" ? "text-emerald-400" :
                    insight.color === "amber" ? "text-amber-400" : "text-indigo-400"
                  }`} />
                  {insight.text}
                </div>
              </motion.div>
            ))}
          </div>
          <Link href="/career-coach" className="block mt-4">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              Get More AI Insights
            </Button>
          </Link>
        </motion.div>

        {/* Skills radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">Skills Radar</h2>
            <Link href="/skills-gap">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                Analyse <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={SKILLS_RADAR_DATA}>
              <PolarGrid stroke="rgba(99,102,241,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top career matches */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Top Career Matches</h2>
            <Link href="/job-market">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                All <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {topCareers.map((career, i) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{career.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatSalaryRange(career.minSalaryZar, career.maxSalaryZar)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getDemandBadgeColor(career.demandScore)}`}>
                    {career.demandScore}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active Learning Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        <RoadmapWidget />
      </motion.div>

      {/* Referral widget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <ReferralWidget />
      </motion.div>

      {/* Career XP + Achievements */}
      <GamificationPanel />

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  action.color === "indigo" ? "border-indigo-500/20 bg-indigo-500/8 hover:bg-indigo-500/12" :
                  action.color === "violet" ? "border-violet-500/20 bg-violet-500/8 hover:bg-violet-500/12" :
                  action.color === "emerald" ? "border-emerald-500/20 bg-emerald-500/8 hover:bg-emerald-500/12" :
                  "border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/12"
                }`}
              >
                <action.icon className={`w-8 h-8 mb-3 ${
                  action.color === "indigo" ? "text-indigo-400" :
                  action.color === "violet" ? "text-violet-400" :
                  action.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                }`} />
                <div className="text-sm font-semibold text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Growing careers mini-list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Fastest-Growing SA Careers in 2025</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on job posting trends and DHET scarce skills data</p>
          </div>
          <Link href="/job-market">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Globe className="w-3.5 h-3.5" />
              Full Market View
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_GROWING_CAREERS_2025.map((career) => (
            <div
              key={career.title}
              className="p-3 rounded-lg bg-secondary border border-border hover:border-indigo-500/30 transition-all cursor-pointer group"
            >
              <div className="text-xs font-semibold text-foreground group-hover:text-indigo-300 transition-colors">{career.title}</div>
              <div className="text-emerald-400 text-xs font-bold mt-1">{career.growth}</div>
              <div className="mt-2">
                <div className="h-1 bg-white/5 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${career.demand}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{career.demand}/100 demand</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
