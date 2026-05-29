"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CreditsPurchaseSuccessPage() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // Poll briefly — ITN may take a few seconds to fire
    let attempts = 0;
    const poll = async () => {
      try {
        const res  = await fetch("/api/credits/balance");
        const data = await res.json();
        setBalance(data.balance ?? 0);
      } catch {}
      if (attempts++ < 6) setTimeout(poll, 2000);
    };
    poll();
  }, []);

  return (
    <div className="max-w-md mx-auto py-16 flex flex-col items-center text-center space-y-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Payment successful!</h1>
        <p className="text-muted-foreground text-sm">
          Your credits have been added to your account and are ready to use.
        </p>
      </div>

      {balance !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 flex items-center gap-3"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">New balance</p>
            <p className="text-2xl font-bold text-foreground">
              {balance} credit{balance !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/career-coach"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all active:scale-95"
        >
          Open AI Career Coach
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-all border border-border"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
