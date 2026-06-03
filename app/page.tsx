"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain, TrendingUp, Target, Zap, BarChart3, BookOpen,
  ArrowRight, CheckCircle, Globe, Shield, Award,
  ChevronRight, Sparkles, Users, Building2, GraduationCap,
} from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { PricingSection } from "@/components/landing/pricing-section";

const STATS = [
  { value: "249+", label: "SA Careers Mapped", icon: Target },
  { value: "26",   label: "Industry Sectors", icon: BarChart3 },
  { value: "9",    label: "SA Provinces Covered", icon: Globe },
  { value: "Free", label: "To Get Started", icon: Sparkles },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI CV Builder",
    description: "Upload your CV and get instant ATS scores, recruiter ratings, and AI-improved versions tailored for SA employers.",
    color: "indigo",
    gradient: "from-indigo-500/20 to-violet-500/10",
    border: "border-indigo-500/30",
    href: "/cv-builder",
  },
  {
    icon: TrendingUp,
    title: "Career Demand Engine",
    description: "See real-time demand scores, salary ranges in ZAR, and growth trends for 249+ careers across SA provinces.",
    color: "emerald",
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    href: "/job-market",
  },
  {
    icon: Target,
    title: "Skills Gap Analysis",
    description: "Compare your current profile against your dream role. Get a personalised learning roadmap with SA-relevant courses.",
    color: "violet",
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/30",
    href: "/skills-gap",
  },
  {
    icon: Zap,
    title: "AI Career Coach",
    description: "Chat 24/7 with an AI coach that understands the SA job market, NQF levels, SETAs, and local employer expectations.",
    color: "amber",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    href: "/career-coach",
  },
  {
    icon: BarChart3,
    title: "Career Path Simulator",
    description: "Simulate your career 5–10 years ahead. See projected salaries, required certifications, and career milestones.",
    color: "blue",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    href: "/career-paths",
  },
  {
    icon: BookOpen,
    title: "Course Intelligence",
    description: "Get curated course recommendations from Coursera, UCT, Wits, UNISA, SETAs, and more — matched to your skill gaps.",
    color: "pink",
    gradient: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-500/30",
    href: "/courses",
  },
];



const EARLY_ACCESS_CARDS = [
  {
    icon: "🎯",
    title: "Built ground-up for SA",
    desc: "Every salary range, demand score, and career path is calibrated for the South African market — not copy-pasted from the US or UK.",
  },
  {
    icon: "🤖",
    title: "AI that knows NQF & B-BBEE",
    desc: "Our AI Career Coach understands South African qualifications, SETAs, employment equity, and local employer expectations.",
  },
  {
    icon: "🚀",
    title: "Be among the first",
    desc: "CareerIntel SA just launched. Early users are already using the tools — yours could be the next success story we share here.",
  },
];

const USERS = [
  { icon: GraduationCap, label: "Students & Graduates" },
  { icon: Users, label: "Job Seekers" },
  { icon: TrendingUp, label: "Career Switchers" },
  { icon: Building2, label: "HR & Recruiters" },
];

const TOP_CAREERS = [
  { title: "AI/ML Engineer", score: 95, growth: "+67%", salary: "R55k–R160k" },
  { title: "Cloud Architect", score: 91, growth: "+48%", salary: "R60k–R180k" },
  { title: "Cybersecurity Analyst", score: 90, growth: "+38%", salary: "R35k–R130k" },
  { title: "Data Scientist", score: 94, growth: "+34%", salary: "R35k–R120k" },
  { title: "Renewable Energy Eng", score: 91, growth: "+45%", salary: "R35k–R120k" },
];

function DemandBar({ score, color = "indigo" }: { score: number; color?: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${colorMap[color] || "bg-indigo-500"}`}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B1A] text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#050B1A]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Career<span className="text-indigo-400">Intel</span>
              <span className="text-xs ml-1 text-amber-400 font-medium">SA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            {["Features", "Careers", "Pricing", "About"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/sign-in" className="hidden sm:inline-flex text-sm text-white/70 hover:text-white transition-colors px-3 sm:px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
            >
              <span className="sm:hidden">Sign Up</span>
              <span className="hidden sm:inline">Get Started Free</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-14 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-600/8 blur-[100px] animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium mb-5 sm:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            South Africa&apos;s First AI Career Intelligence Engine
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight sm:leading-[1.05] mb-4 sm:mb-6"
          >
            Your Career,{" "}
            <span className="gradient-text">Intelligently</span>
            <br />
            <span className="text-white/90">Engineered for SA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-7 sm:mb-10 leading-relaxed px-2 sm:px-0"
          >
            AI-powered career guidance, skills gap analysis, salary intelligence, and personalised career coaching — built for South Africa&apos;s 24.5 million workforce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16"
          >
            <Link
              href="/sign-up"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Start For Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-medium text-base sm:text-lg transition-all duration-200 hover:bg-white/5"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="glass-card rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative max-w-5xl mx-auto mt-10 sm:mt-16 md:mt-20 px-3 sm:px-4"
        >
          <div className="relative rounded-xl sm:rounded-2xl border border-white/10 bg-[#0D1526]/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            {/* Faux window bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5 bg-white/2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 sm:ml-4 text-white/30 text-[10px] sm:text-xs">CareerIntel SA — Dashboard</span>
            </div>

            <div className="p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Score card — full width on mobile, 1/3 on sm+ */}
              <div className="col-span-1 bg-white/3 rounded-xl p-3 sm:p-5 border border-white/5 flex sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0">
                <div className="text-xs text-white/40 font-medium uppercase tracking-wide hidden sm:block mb-3">Employability Score</div>
                <div className="flex items-center justify-center sm:justify-center">
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.78} ${2 * Math.PI * 40}`}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-bold text-white">78</span>
                      <span className="text-xs text-white/40">/ 100</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 sm:flex-none">
                  <div className="text-xs text-white/40 font-medium uppercase tracking-wide sm:hidden mb-0.5">Employability Score</div>
                  <div className="text-xs sm:text-center sm:mt-3 text-emerald-400 font-medium">Strong Market Fit</div>
                </div>
              </div>

              {/* Top careers — full width on mobile, 2/3 on sm+ */}
              <div className="col-span-1 sm:col-span-2 bg-white/3 rounded-xl p-3 sm:p-5 border border-white/5">
                <div className="text-xs text-white/40 mb-3 sm:mb-4 font-medium uppercase tracking-wide">Top Demand Careers 2025</div>
                <div className="space-y-2.5 sm:space-y-3">
                  {TOP_CAREERS.map((career, i) => (
                    <div key={career.title} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs text-white/30 w-3 sm:w-4 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] sm:text-xs text-white/80 font-medium truncate pr-1">{career.title}</span>
                          <span className="text-[11px] sm:text-xs text-emerald-400 font-medium flex-shrink-0">{career.growth}</span>
                        </div>
                        <DemandBar score={career.score} />
                      </div>
                      <span className="hidden sm:block text-xs text-white/40 w-20 lg:w-24 text-right flex-shrink-0">{career.salary}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-600/20 blur-3xl" />
        </motion.div>
      </section>

      {/* Who it's for */}
      <section className="py-10 sm:py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/50">
            <span className="font-medium text-white/30 mr-2">Built for:</span>
            {USERS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">win in SA&apos;s job market</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/50 max-w-2xl mx-auto">
              Six AI-powered modules working together to turn career uncertainty into a clear, data-backed roadmap.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative group rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <feature.icon className={`w-10 h-10 mb-4 ${
                    feature.color === "indigo" ? "text-indigo-400" :
                    feature.color === "emerald" ? "text-emerald-400" :
                    feature.color === "violet" ? "text-violet-400" :
                    feature.color === "amber" ? "text-amber-400" :
                    feature.color === "blue" ? "text-blue-400" : "text-pink-400"
                  }`} />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it free <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / problem statement */}
      <section id="about" className="py-14 sm:py-20 bg-gradient-to-r from-indigo-900/20 via-violet-900/10 to-purple-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-medium mb-6">
                The SA Career Crisis
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-6 leading-tight">
                45% youth unemployment.{" "}
                <span className="text-red-400">Skills mismatch.</span>{" "}
                No clear guidance.
              </h2>
              <div className="space-y-4">
                {[
                  "7.7 million South Africans unemployed",
                  "Graduates struggle to match skills to demand",
                  "No affordable, data-driven career guidance exists",
                  "Labour market intelligence locked behind expensive consulting",
                  "Youth don&apos;t know which careers will survive automation",
                ].map((problem) => (
                  <div key={problem} className="flex items-start gap-3 text-white/70">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                    <span className="text-sm" dangerouslySetInnerHTML={{ __html: problem }} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-medium mb-6">
                The CareerIntel Solution
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-6 leading-tight">
                AI-powered intelligence{" "}
                <span className="gradient-text-emerald">accessible to everyone.</span>
              </h2>
              <div className="space-y-4">
                {[
                  "Real-time SA job market demand data for 249+ careers",
                  "AI that understands NQF levels, SETAs, and local employers",
                  "Personalised skills gap analysis with actionable learning paths",
                  "Salary predictions based on SA market data",
                  "Career simulations showing exactly where you can be in 5 years",
                ].map((solution) => (
                  <div key={solution} className="flex items-start gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{solution}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why CareerIntel SA */}
      <section id="careers" className="py-16 sm:py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">South Africa</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              CareerIntel SA just launched. Here&apos;s why it was built specifically for South Africans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {EARLY_ACCESS_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Early access CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 border border-white/10 rounded-2xl px-6 py-10 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-4">
              🇿🇦 Proudly South African
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Be an early user</h3>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              CareerIntel SA is new — and that means you get to shape it. Try it free, give us feedback, and be part of building the career platform SA deserves.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@careerintelsa.co.za"
                className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Share Feedback
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-violet-900/15 to-purple-900/20" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
              <Award className="w-3.5 h-3.5" />
              Your future starts today
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6">
              Don&apos;t leave your career to chance.{" "}
              <span className="gradient-text">Let AI guide you.</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/55 mb-8 sm:mb-10">
              Join South Africans using AI-powered, data-driven intelligence to build careers they love.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/30"
              >
                Start Free — No Credit Card
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/30 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Secure · Private · POPIA Compliant
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold">CareerIntel <span className="text-amber-400">SA</span></span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                South Africa&apos;s AI career intelligence platform. Empowering every South African to build a future-proof career.
              </p>
            </div>
            {[
              {
                heading: "Platform",
                links: [
                  { label: "CV Builder", href: "/cv-builder" },
                  { label: "Career Coach", href: "/career-coach" },
                  { label: "Skills Gap", href: "/skills-gap" },
                  { label: "Job Market", href: "/job-market" },
                ],
              },
              {
                heading: "Resources",
                links: [
                  { label: "Career Guides", href: "/#features" },
                  { label: "Salary Reports", href: "/job-market" },
                  { label: "SETA Learnerships", href: "/courses" },
                  { label: "Interview Prep", href: "/interview-prep" },
                ],
              },
              {
                heading: "Company",
                links: [
                  { label: "About", href: "/#about" },
                  { label: "Pricing", href: "/#pricing" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((section) => (
              <div key={section.heading}>
                <h4 className="text-sm font-semibold text-white/80 mb-4">{section.heading}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>© 2026 CareerIntel SA. All rights reserved. Built for South Africa.</p>
            <div className="flex items-center gap-4">
              <p>POPIA Compliant · South African Company</p>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
