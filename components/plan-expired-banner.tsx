"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, X, Crown } from "lucide-react";

/**
 * One-time notice shown when a user's paid plan has lapsed and they've been
 * moved to Free. Turns a silent downgrade into a renewal prompt.
 *
 * Reliability: the server's `planExpired` flag is only true on the first
 * dashboard call after expiry (getEffectivePlan resets the DB immediately, and
 * concurrent callers race), so we ALSO detect the paid→Free transition
 * client-side via localStorage — which survives the race and works even if a
 * gated feature reset the plan before the dashboard loaded.
 */

const LAST_PLAN_KEY = "careerintel-last-plan";
const ACK_KEY       = "careerintel-expiry-ack";

export function PlanExpiredBanner() {
  const [show, setShow]         = useState(false);
  const [prevPlan, setPrevPlan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) return;
        const d = await res.json();
        if (cancelled) return;

        const current: string = d.plan ?? "FREE";
        const lastSeen = localStorage.getItem(LAST_PLAN_KEY);

        // If they're currently paid, clear any prior acknowledgement so a
        // future expiry will surface the banner again.
        if (current !== "FREE") {
          localStorage.removeItem(ACK_KEY);
        }

        const transitioned = !!lastSeen && lastSeen !== "FREE" && current === "FREE";
        const serverFlag   = d.planExpired === true;
        const acknowledged = localStorage.getItem(ACK_KEY) === "1";

        if ((transitioned || serverFlag) && !acknowledged && current === "FREE") {
          setPrevPlan(lastSeen && lastSeen !== "FREE" ? lastSeen : null);
          setShow(true);
        }

        // Remember the current plan for next time.
        localStorage.setItem(LAST_PLAN_KEY, current);
      } catch {
        /* silent — a courtesy banner should never break the dashboard */
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  const planLabel =
    prevPlan === "PREMIUM"   ? "paid" :
    prevPlan === "RECRUITER" ? "Recruiter" :
    prevPlan ? prevPlan.charAt(0) + prevPlan.slice(1).toLowerCase() : "paid";

  const dismiss = () => {
    localStorage.setItem(ACK_KEY, "1");
    setShow(false);
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          Your {planLabel} plan has expired — you&apos;re now on the Free plan
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your data is safe. Renew anytime to restore unlimited access to AI coaching,
          skills gap analysis, and career simulations.
        </p>
        <Link
          href="/upgrade"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Crown className="h-3.5 w-3.5" />
          Renew my plan
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-amber-400/70 transition-colors hover:text-amber-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
