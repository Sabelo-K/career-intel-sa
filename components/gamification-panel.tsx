"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface GamificationStats {
  xp: number;
  streak: number;
  level: string;
  levelColor: string;
  levelProgress: number;
  nextThreshold: number;
  earnedBadges: BadgeData[];
  lockedBadges: BadgeData[];
}

export function GamificationPanel() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    fetch("/api/gamification/stats")
      .then((r) => r.json())
      .then((d) => { if (d.xp !== undefined) setStats(d); })
      .catch(() => {});

    // Award daily login XP silently
    fetch("/api/gamification/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "daily_login" }),
    }).catch(() => {});
  }, []);

  if (!stats) return null;

  const visibleEarned = showAllBadges ? stats.earnedBadges : stats.earnedBadges.slice(0, 6);
  const visibleLocked = showAllBadges ? stats.lockedBadges.slice(0, 4) : stats.lockedBadges.slice(0, Math.max(0, 6 - stats.earnedBadges.length));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.48 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Career XP</h2>
            <p className="text-xs text-muted-foreground">Earn points by using the platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">{stats.streak}</span>
              <span className="text-xs text-orange-400/70">day streak</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">{stats.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold" style={{ color: stats.levelColor }}>
            {stats.level}
          </span>
          <span className="text-xs text-muted-foreground">
            {stats.xp} / {stats.nextThreshold} XP
          </span>
        </div>
        <Progress
          value={stats.levelProgress}
          className="h-2"
          indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-400"
        />
        {stats.levelProgress < 100 && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {stats.nextThreshold - stats.xp} XP to next level
          </p>
        )}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Achievements · {stats.earnedBadges.length}/{stats.earnedBadges.length + stats.lockedBadges.length}
          </span>
          {(stats.earnedBadges.length + stats.lockedBadges.length) > 6 && (
            <button
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showAllBadges ? "Show less" : "See all"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <AnimatePresence mode="popLayout">
            {visibleEarned.map((badge) => (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-amber-500/8 border border-amber-500/20 cursor-default group relative"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[10px] text-amber-300 font-medium text-center leading-tight">{badge.name}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-32 bg-popover border border-border rounded-md px-2 py-1.5 text-[10px] text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {badge.description}
                  {badge.xpReward > 0 && <div className="text-amber-400 mt-0.5">+{badge.xpReward} XP bonus</div>}
                </div>
              </motion.div>
            ))}

            {visibleLocked.map((badge) => (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary border border-border cursor-default group relative opacity-50"
              >
                <div className="relative">
                  <span className="text-2xl grayscale">{badge.icon}</span>
                  <Lock className="w-3 h-3 text-muted-foreground absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{badge.name}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-32 bg-popover border border-border rounded-md px-2 py-1.5 text-[10px] text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {badge.description}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// XP toast notification — shown briefly when XP is earned
export function XpToast({ xpGained, newBadges, onDismiss }: {
  xpGained: number;
  newBadges: BadgeData[];
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-300">+{xpGained} XP earned!</span>
      </div>
      {newBadges.map((badge) => (
        <div key={badge.id} className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <span className="text-lg">{badge.icon}</span>
          <div>
            <div className="text-xs font-semibold text-foreground">Badge unlocked: {badge.name}</div>
            <div className="text-[10px] text-muted-foreground">{badge.description}</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
