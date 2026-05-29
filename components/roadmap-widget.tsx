"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, Circle, ChevronRight,
  Target, Sparkles, Clock, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  skills: string[];
  weeks: number;
  completed: boolean;
  completedAt: string | null;
}

interface LearningRoadmap {
  id: string;
  targetRole: string;
  totalMonths: number;
  matchPct: number;
  salaryImpact: string | null;
  phases: RoadmapPhase[];
  createdAt: string;
  updatedAt: string;
}

export function RoadmapWidget() {
  const [roadmap, setRoadmap]       = useState<LearningRoadmap | null>(null);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/roadmap/active")
      .then((r) => r.json())
      .then((d) => setRoadmap(d.roadmap ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePhase = async (phase: RoadmapPhase) => {
    if (toggling) return;
    setToggling(phase.id);

    // Optimistic update
    setRoadmap((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phases: prev.phases.map((p) =>
          p.id === phase.id
            ? { ...p, completed: !p.completed, completedAt: !p.completed ? new Date().toISOString() : null }
            : p
        ),
      };
    });

    try {
      await fetch(`/api/roadmap/phases/${phase.id}`, { method: "PATCH" });
    } catch {
      // Revert on error
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phases: prev.phases.map((p) =>
            p.id === phase.id ? { ...p, completed: phase.completed, completedAt: phase.completedAt } : p
          ),
        };
      });
    } finally {
      setToggling(null);
    }
  };

  // ── Empty / loading states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 w-40 bg-white/10 rounded mb-4" />
        <div className="h-2 w-full bg-white/5 rounded mb-2" />
        <div className="h-2 w-3/4 bg-white/5 rounded" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 py-8">
        <div className="w-12 h-12 rounded-full bg-indigo-500/15 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">No active roadmap</p>
          <p className="text-xs text-muted-foreground mt-1">
            Run a Skills Gap Analysis to generate your personalised learning roadmap.
          </p>
        </div>
        <Link href="/skills-gap">
          <Button variant="indigo" size="sm" className="gap-2 mt-1">
            <Target className="w-3.5 h-3.5" />
            Start Skills Gap Analysis
          </Button>
        </Link>
      </div>
    );
  }

  const totalPhases     = roadmap.phases.length;
  const donePhases      = roadmap.phases.filter((p) => p.completed).length;
  const progressPct     = totalPhases > 0 ? Math.round((donePhases / totalPhases) * 100) : 0;
  const totalWeeks      = roadmap.phases.reduce((s, p) => s + p.weeks, 0);
  const weeksRemaining  = roadmap.phases.filter((p) => !p.completed).reduce((s, p) => s + p.weeks, 0);
  const displayPhases   = expanded ? roadmap.phases : roadmap.phases.slice(0, 3);
  const allDone         = donePhases === totalPhases && totalPhases > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
      {/* Shimmer accent top-line is handled globally by .bg-card::before */}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            allDone ? "bg-emerald-500/20" : "bg-indigo-500/15"
          )}>
            {allDone
              ? <Trophy className="w-4 h-4 text-emerald-400" />
              : <BookOpen className="w-4 h-4 text-indigo-400" />
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">
              {allDone ? "Roadmap Complete! 🎉" : "My Learning Roadmap"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-xs font-medium text-indigo-300 truncate max-w-[160px]">
                {roadmap.targetRole}
              </span>
            </div>
          </div>
        </div>
        <Link href="/skills-gap">
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
            View full
            <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">
            {donePhases} of {totalPhases} phases complete
          </span>
          <span className={cn(
            "text-xs font-bold",
            allDone ? "text-emerald-400" : progressPct >= 50 ? "text-indigo-400" : "text-amber-400"
          )}>
            {progressPct}%
          </span>
        </div>
        <Progress
          value={progressPct}
          className="h-2"
          indicatorClassName={cn(
            allDone
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          )}
        />
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {weeksRemaining > 0 ? `${weeksRemaining}w remaining` : "All done!"}
          </div>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <div className="text-xs text-muted-foreground">{totalWeeks}w total</div>
        </div>
      </div>

      {/* Phase checklist */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {displayPhases.map((phase, i) => (
            <motion.button
              key={phase.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => togglePhase(phase)}
              disabled={toggling === phase.id}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150",
                "hover:border-indigo-500/30 active:scale-[0.99]",
                phase.completed
                  ? "bg-emerald-500/8 border-emerald-500/20"
                  : "border-border hover:bg-white/[0.04]",
                toggling === phase.id && "opacity-60 pointer-events-none"
              )}
            >
              {/* Checkbox icon */}
              <div className="flex-shrink-0 mt-0.5">
                {phase.completed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <Circle className="w-4 h-4 text-muted-foreground/50" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-xs font-semibold leading-tight",
                    phase.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {phase.phaseNumber}. {phase.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {phase.weeks}w
                  </span>
                </div>

                {/* Skill tags */}
                {phase.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {phase.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border",
                          phase.completed
                            ? "text-muted-foreground border-white/10 bg-white/5"
                            : "text-indigo-300 border-indigo-500/25 bg-indigo-500/10"
                        )}
                      >
                        {s}
                      </span>
                    ))}
                    {phase.skills.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{phase.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more / less */}
      {totalPhases > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 flex items-center justify-center gap-1"
        >
          {expanded ? "Show less" : `Show ${totalPhases - 3} more phase${totalPhases - 3 !== 1 ? "s" : ""}`}
          <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
        </button>
      )}

      {/* CTA — salary impact or run new analysis */}
      {roadmap.salaryImpact && !allDone && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
          <p className="text-xs text-amber-200/80 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
            {roadmap.salaryImpact}
          </p>
        </div>
      )}
    </div>
  );
}
