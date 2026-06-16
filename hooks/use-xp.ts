"use client";

import { useCallback, useState } from "react";
import type { XpAction } from "@/lib/gamification";

interface XpResult {
  xpGained: number;
  newBadges: { id: string; name: string; icon: string; description: string }[];
}

export function useXp() {
  const [toast, setToast] = useState<XpResult | null>(null);

  const awardXp = useCallback(async (action: XpAction) => {
    try {
      const res = await fetch("/api/gamification/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      const data: XpResult = await res.json();
      if (data.xpGained > 0) setToast(data);
    } catch {
      // fire-and-forget — never block user flow
    }
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { awardXp, toast, dismissToast };
}
