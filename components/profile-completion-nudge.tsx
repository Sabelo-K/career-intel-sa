"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, X, Sparkles } from "lucide-react";
import Link from "next/link";

interface MissingStep {
  label: string;
  href: string;
}

interface Props {
  profileStrength: number;
  profileMissing: MissingStep[];
}

const DISMISS_KEY = "profile_nudge_dismissed_until";

export function ProfileCompletionNudge({ profileStrength, profileMissing }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (profileStrength >= 100 || profileMissing.length === 0) return;
    const until = localStorage.getItem(DISMISS_KEY);
    if (until && Date.now() < Number(until)) return;
    setVisible(true);
  }, [profileStrength, profileMissing.length]);

  const dismiss = () => {
    // Snooze for 3 days
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 1000 * 60 * 60 * 24 * 3));
    setVisible(false);
  };

  // Show top 3 missing steps only
  const topMissing = profileMissing.slice(0, 3);
  const remaining = profileMissing.length - topMissing.length;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-indigo-500/10 border border-indigo-500/25 rounded-xl px-4 py-4"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">
                  Your profile is {profileStrength}% complete
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                  {profileMissing.length} step{profileMissing.length !== 1 ? "s" : ""} left
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                A complete profile unlocks your full Employability Score and improves recruiter visibility.
              </p>

              <div className="flex flex-wrap gap-2">
                {topMissing.map((step) => (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-medium text-indigo-200 hover:bg-indigo-500/25 hover:border-indigo-500/50 transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    {step.label}
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>
                ))}
                {remaining > 0 && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +{remaining} more
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
