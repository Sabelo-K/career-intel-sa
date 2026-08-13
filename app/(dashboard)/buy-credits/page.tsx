"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Crown, CheckCircle2, Coins, MessageCircle, Target, GitBranch, Loader2, AlertCircle, X, Info } from "lucide-react";
import Link from "next/link";
import { CREDIT_PACKS } from "@/lib/credits";
import { track } from "@/lib/analytics";

// What each credit buys — shown below the packs
const CREDIT_USES = [
  { icon: MessageCircle, label: "AI Coach message",     cost: 1, color: "text-violet-400" },
  { icon: Target,        label: "Skills Gap analysis",  cost: 3, color: "text-emerald-400" },
  { icon: GitBranch,     label: "Career Path simulation",cost: 3, color: "text-amber-400"  },
];


interface Allowance {
  key: string; label: string; used: number;
  limit: number | null; remaining: number | null; creditCost: number;
}

export default function BuyCreditsPage() {
  const [balance,   setBalance]   = useState<number | null>(null);
  const [loading,   setLoading]   = useState<string | null>(null); // packId being fetched
  const [isPaid,    setIsPaid]    = useState(false);
  const [buyError,  setBuyError]  = useState<string | null>(null);
  const [allowance, setAllowance] = useState<Allowance[]>([]);
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    track("buy_credits_viewed");
    // Load current balance + free allowance + plan status
    Promise.all([
      fetch("/api/credits/balance").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(([bal, dash]) => {
      setBalance(bal.balance ?? 0);
      setAllowance(Array.isArray(bal.allowance) ? bal.allowance : []);
      setUnlimited(Boolean(bal.unlimited));
      if (dash.plan && dash.plan !== "FREE") setIsPaid(true);
    }).catch(() => setBalance(0));
  }, []);

  // Anything still free this month? Used to tell the user they may not need
  // to buy yet — better than quietly taking money for unused capacity.
  const hasFreeLeft = allowance.some((a) => a.remaining === null || a.remaining > 0);

  function handleBuy(packId: string) {
    setLoading(packId);
    setBuyError(null);
    track("credits_checkout_started", { packId });
    // Full-page navigation to the server-driven checkout. A fresh top-level
    // document gets the current CSP and reliably posts to PayFast — no in-app
    // fetch/form that a stale SPA-session CSP could block.
    window.location.href = `/api/credits/checkout?packId=${encodeURIComponent(packId)}`;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Coins className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Buy Credits</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Top up your account when you need more usage — no subscription required.
          Credits never expire.
        </p>
        {balance !== null && (
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mt-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              Current balance: <strong>{balance}</strong> credit{balance !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Free allowance — explains why credits may not be moving yet */}
      {allowance.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Your free allowance this month
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Credits are a top-up. They&apos;re only used <strong className="text-foreground">after</strong> your
                free monthly allowance runs out — so your balance won&apos;t change until then.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {allowance.map((a) => {
              const isUnlimited = a.remaining === null;
              const exhausted   = !isUnlimited && a.remaining === 0;
              const pct = isUnlimited || !a.limit ? 0 : Math.min(100, (a.used / a.limit) * 100);
              return (
                <div key={a.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {a.label}
                      <span className="ml-1.5 text-[10px] text-muted-foreground/70">
                        then {a.creditCost} credit{a.creditCost !== 1 ? "s" : ""} each
                      </span>
                    </span>
                    <span className={`font-semibold ${exhausted ? "text-amber-400" : "text-foreground"}`}>
                      {isUnlimited
                        ? "Unlimited"
                        : exhausted
                          ? "Using credits now"
                          : `${a.remaining} of ${a.limit} left`}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${exhausted ? "bg-amber-500" : "bg-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasFreeLeft && (
            <p className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 leading-relaxed">
              You still have free usage left this month — you may not need credits yet.
              Buy them now only if you want them ready in advance. Credits never expire.
            </p>
          )}
        </div>
      )}

      {/* Unlimited plans don't consume credits at all */}
      {unlimited && (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your plan includes <strong className="text-foreground">unlimited</strong> AI coaching, skills gap
            analyses and career simulations, so credits aren&apos;t consumed while it&apos;s active.
            Any credits you buy stay banked for when your plan ends.
          </p>
        </div>
      )}

      {/* Payment error */}
      {buyError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{buyError}</span>
          <button onClick={() => setBuyError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* Paid user notice */}
      {isPaid && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <p className="text-sm text-indigo-300">
            You&apos;re on a paid plan with unlimited access. Credits are only needed for Free plan users —
            but you can still buy them to gift or accumulate for when your plan expires.
          </p>
        </div>
      )}

      {/* Packs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.values(CREDIT_PACKS).map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * 0.08 }}
            className={`relative bg-card border rounded-2xl p-5 flex flex-col gap-4 ${
              pack.popular
                ? "border-amber-500/40 shadow-lg shadow-amber-500/10 mt-3 pt-7"
                : "border-border"
            }`}
          >
            {pack.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="block whitespace-nowrap bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                  Most Popular
                </span>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-sm">{pack.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">R{pack.amountRands}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {pack.credits} credits · R{(pack.amountRands / pack.credits).toFixed(2)}/credit
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-muted-foreground flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {pack.credits} AI coach messages
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {Math.floor(pack.credits / 3)} skills gap analyses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {Math.floor(pack.credits / 3)} career simulations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Credits never expire
              </li>
            </ul>

            <button
              onClick={() => handleBuy(pack.id)}
              disabled={loading !== null}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                pack.popular
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading === pack.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Buy for R{pack.amountRands}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* What credits buy */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">What do credits buy?</h3>
          <Link href="/how-credits-work" className="text-xs text-indigo-400 hover:underline whitespace-nowrap">
            Full breakdown →
          </Link>
        </div>
        <p className="text-xs text-muted-foreground -mt-2 leading-relaxed">
          Used only once your free monthly allowance is finished. The CV Builder is free
          for everyone and never costs credits.
        </p>
        <div className="space-y-3">
          {CREDIT_USES.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {item.cost} credit{item.cost !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade nudge */}
      <div className="bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Better value: go unlimited</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          A subscription gives you unlimited AI coaching, skills gap analyses, and career simulations —
          no counting credits. Starting from <strong className="text-white/80">R24/month</strong>.
        </p>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          See subscription plans
        </Link>
      </div>

    </div>
  );
}
