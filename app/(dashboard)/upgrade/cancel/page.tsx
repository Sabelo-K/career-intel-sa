"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UpgradeCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center"
      >
        <XCircle className="w-10 h-10 text-muted-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-foreground">Payment Cancelled</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No charge was made. You are still on the Free plan — you can upgrade whenever you are ready.
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
          onClick={() => router.push("/upgrade")}
        >
          <Zap className="w-4 h-4" />
          Try Again
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
