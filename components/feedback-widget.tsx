"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FeedbackFeature =
  | "cv-builder"
  | "career-coach"
  | "skills-gap"
  | "career-paths"
  | "general";

const FEATURE_LABELS: Record<FeedbackFeature, string> = {
  "cv-builder":   "your CV experience",
  "career-coach": "your Career Coach session",
  "skills-gap":   "your Skills Gap analysis",
  "career-paths": "your Career Path simulation",
  "general":      "CareerIntel SA overall",
};

interface Props {
  feature:  FeedbackFeature;
  onClose:  () => void;
}

export default function FeedbackWidget({ feature, onClose }: Props) {
  const [hovered,   setHovered]   = useState(0);
  const [selected,  setSelected]  = useState(0);
  const [comment,   setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,      setDone]      = useState(false);

  const active = hovered || selected;

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rating: selected, comment: comment.trim() || undefined, feature }),
      });
      setDone(true);
      setTimeout(onClose, 2000);
    } catch {
      // non-fatal
      setDone(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{   opacity: 0, y: 40,  scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-indigo-500/8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-foreground">Quick Feedback</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1   }}
              className="flex flex-col items-center py-4 gap-2"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-sm font-medium text-foreground">Thanks for the feedback!</p>
              <p className="text-xs text-muted-foreground text-center">It helps us improve CareerIntel SA for everyone.</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-3">
              <p className="text-sm text-foreground">
                How was <span className="text-indigo-300 font-medium">{FEATURE_LABELS[feature]}</span>?
              </p>

              {/* Stars */}
              <div className="flex items-center gap-1.5 justify-center py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= active
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Label under stars */}
              {selected > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-muted-foreground"
                >
                  {selected === 1 && "😞 Poor"}
                  {selected === 2 && "😐 Fair"}
                  {selected === 3 && "🙂 Good"}
                  {selected === 4 && "😊 Great"}
                  {selected === 5 && "🤩 Excellent!"}
                </motion.p>
              )}

              {/* Comment — only show after star selected */}
              <AnimatePresence>
                {selected > 0 && (
                  <motion.textarea
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    placeholder="Tell us more (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={300}
                    rows={2}
                    className="w-full text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-1 text-left"
                >
                  Maybe later
                </button>
                <Button
                  size="sm"
                  variant="indigo"
                  onClick={submit}
                  disabled={!selected || submitting}
                  className="gap-1.5 text-xs h-7 px-3"
                >
                  <Send className="w-3 h-3" />
                  {submitting ? "Sending…" : "Submit"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
