"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Crown, X, Coins } from "lucide-react";
import Link from "next/link";

interface OutOfCreditsModalProps {
  open:         boolean;
  onClose:      () => void;
  featureLabel: string;    // e.g. "AI Coach messages"
  creditCost:   number;    // e.g. 1 or 3
  currentBalance: number;
}

export function OutOfCreditsModal({
  open,
  onClose,
  featureLabel,
  creditCost,
  currentBalance,
}: OutOfCreditsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.92, y: 20  }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Out of credits</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {featureLabel} costs {creditCost} credit{creditCost !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Balance display */}
              <div className="bg-secondary rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your balance</span>
                <span className="text-sm font-bold text-foreground">
                  {currentBalance} credit{currentBalance !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Monthly limit notice */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                You&apos;ve used your free monthly allocation. Top up with credits to keep going,
                or subscribe for unlimited access — no limits, ever.
              </p>

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <Link
                  href="/buy-credits"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-sm font-semibold transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Buy credits — from R20
                </Link>

                <Link
                  href="/upgrade"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade — unlimited from R49/mo
                </Link>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
