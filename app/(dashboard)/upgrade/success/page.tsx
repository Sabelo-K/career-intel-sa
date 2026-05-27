"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState("Premium");

  useEffect(() => {
    // Refresh plan from server (PayFast may have already fired ITN)
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan && d.plan !== "FREE") {
          const map: Record<string, string> = {
            PREMIUM:   "Professional",
            RECRUITER: "Recruiter",
          };
          setPlanName(map[d.plan] ?? "Premium");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Payment Successful</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to {planName}!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your plan has been activated. You now have full access to all {planName} features for 30 days.
          It may take a moment for your dashboard to reflect the update.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <Button
          variant="indigo"
          className="flex-1 gap-2"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/career-coach")}
        >
          Start Coaching
        </Button>
      </motion.div>
    </div>
  );
}
