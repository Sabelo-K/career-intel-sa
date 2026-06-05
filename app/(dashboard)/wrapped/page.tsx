"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, MessageCircle, Target, GitBranch, FileText,
  Bell, Award, Calendar, Share2, ChevronRight, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WrappedData {
  year: number;
  name: string;
  totalMessages: number;
  skillsGapRuns: number;
  careerSimRuns: number;
  topCareer: string | null;
  atsScore: number | null;
  activeAlerts: number;
  employabilityScore: number | null;
  daysActive: number;
  sessionsThisYear: number;
  hasCV: boolean;
}

const STAT_FACTS: Record<string, (v: number) => string> = {
  totalMessages: v =>
    v >= 100 ? "You're in the top 10% of CareerIntel SA users 🔥" :
    v >= 50  ? "That's a lot of career clarity right there." :
    v >= 10  ? "Every conversation moves you forward." :
               "Your career journey is just beginning.",
  skillsGapRuns: v =>
    v >= 10 ? "You took your skills seriously this year." :
    v >= 3  ? "You know exactly what you need to work on." :
    v >= 1  ? "One analysis is all it takes to change direction." :
              "Try a skills gap analysis in the new year.",
  careerSimRuns: v =>
    v >= 5  ? "You explored multiple futures — smart move." :
    v >= 2  ? "You know where you're heading." :
    v >= 1  ? "You simulated your career path — that's ambitious." :
              "Simulate your 5-year career path in the new year.",
};

function StatCard({ icon: Icon, color, value, label, fact, delay }: {
  icon: React.ElementType; color: string; value: string | number;
  label: string; fact?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 text-center"
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-white/60 mb-3">{label}</div>
      {fact && <p className="text-xs text-white/40 italic leading-relaxed">{fact}</p>}
    </motion.div>
  );
}

export default function WrappedPage() {
  const router = useRouter();
  const [data, setData]       = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [step, setStep]       = useState(0);

  useEffect(() => {
    fetch("/api/wrapped")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => setStep(s => s < 5 ? s + 1 : s), 600);
    return () => clearInterval(timer);
  }, [data]);

  async function handleShare() {
    if (!data) return;
    const text = `My ${data.year} CareerIntel SA Wrapped 🇿🇦\n\n💬 ${data.totalMessages} AI coach messages\n🎯 ${data.skillsGapRuns} skills gap analyses\n🚀 ${data.careerSimRuns} career simulations${data.topCareer ? `\n⭐ Most explored career: ${data.topCareer}` : ""}\n\nStart your career journey → https://careerintelsa.co.za`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-muted-foreground">Couldn&apos;t load your Wrapped data. Please try again.</p>
      </div>
    );
  }

  const year = data.year;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-amber-500/10 border border-white/10 rounded-3xl p-8 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              CareerIntel SA {year} Wrapped
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {data.name.split(" ")[0]}&apos;s Year in Review
            </h1>
            <p className="text-white/50 text-sm">
              {data.daysActive} days on CareerIntel SA · Here&apos;s what you achieved in {year}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {step >= 0 && (
          <StatCard
            icon={MessageCircle} color="bg-indigo-600"
            value={data.totalMessages} label={`AI Coach messages in ${year}`}
            fact={STAT_FACTS.totalMessages(data.totalMessages)}
            delay={0.1}
          />
        )}
        {step >= 1 && (
          <StatCard
            icon={Target} color="bg-emerald-600"
            value={data.skillsGapRuns} label="Skills gap analyses"
            fact={STAT_FACTS.skillsGapRuns(data.skillsGapRuns)}
            delay={0.2}
          />
        )}
        {step >= 2 && (
          <StatCard
            icon={GitBranch} color="bg-violet-600"
            value={data.careerSimRuns} label="Career simulations"
            fact={STAT_FACTS.careerSimRuns(data.careerSimRuns)}
            delay={0.3}
          />
        )}
        {step >= 3 && (
          <StatCard
            icon={Calendar} color="bg-amber-600"
            value={data.sessionsThisYear} label="AI coaching sessions"
            fact="Every session = a step closer to your goal."
            delay={0.4}
          />
        )}
      </div>

      {/* Highlights */}
      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {data.topCareer && (
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-white/40 mb-0.5">Most explored career</div>
                <div className="font-bold text-white text-lg">{data.topCareer}</div>
                <div className="text-xs text-white/40">You came back to this one again and again ⭐</div>
              </div>
            </div>
          )}

          {data.atsScore !== null && (
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/40 mb-1">Your CV ATS Score</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-indigo-300">{data.atsScore}</div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${data.atsScore}%` }} />
                  </div>
                  <span className="text-xs text-white/40">/ 100</span>
                </div>
              </div>
            </div>
          )}

          {data.activeAlerts > 0 && (
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-white/40 mb-0.5">Active job alerts</div>
                <div className="font-bold text-white">{data.activeAlerts} alert{data.activeAlerts !== 1 ? "s" : ""} running</div>
                <div className="text-xs text-white/40">Opportunities are coming to you daily 📬</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Share + Next year CTA */}
      {step >= 5 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-3">
          <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-white text-lg mb-1">Make {year + 1} your breakthrough year</h3>
            <p className="text-sm text-white/50 mb-4">
              {data.totalMessages < 20
                ? "Use the AI Career Coach more. The more you engage, the faster you progress."
                : data.atsScore !== null && data.atsScore < 70
                ? "Your next goal: get that CV ATS score above 70."
                : "You've built strong momentum. Keep going."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                {copied ? "Copied!" : "Share Wrapped"}
              </Button>
              <Button variant="indigo" className="gap-2" onClick={() => router.push("/career-coach")}>
                New year, new goals <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
