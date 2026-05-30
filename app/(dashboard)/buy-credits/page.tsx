"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Crown, CheckCircle2, Coins, MessageCircle, Target, GitBranch, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { CREDIT_PACKS } from "@/lib/credits";

// What each credit buys — shown below the packs
const CREDIT_USES = [
  { icon: MessageCircle, label: "AI Coach message",     cost: 1, color: "text-violet-400" },
  { icon: Target,        label: "Skills Gap analysis",  cost: 3, color: "text-emerald-400" },
  { icon: GitBranch,     label: "Career Path simulation",cost: 3, color: "text-amber-400"  },
];

function submitPayFastForm(url: string, params: Record<string, string>) {
  const form = document.createElement("form");
  form.method  = "POST";
  form.action  = url;
  for (const [key, value] of Object.entries(params)) {
    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function BuyCreditsPage() {
  const [balance,   setBalance]   = useState<number | null>(null);
  const [loading,   setLoading]   = useState<string | null>(null); // packId being purchased
  const [isPaid,    setIsPaid]    = useState(false);
  const [buyError,  setBuyError]  = useState<string | null>(null);

  useEffect(() => {
    // Load current balance + plan status
    Promise.all([
      fetch("/api/credits/balance").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(([bal, dash]) => {
      setBalance(bal.balance ?? 0);
      if (dash.plan && dash.plan !== "FREE") setIsPaid(true);
    }).catch(() => setBalance(0));
  }, []);

  async function handleBuy(packId: string) {
    setLoading(packId);
    setBuyError(null);
    try {
      const res  = await fetch("/api/credits/purchase", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Purchase failed");
      submitPayFastForm(data.url, data.params);
    } catch (err) {
      console.error(err);
      setBuyError(err instanceof Error ? err.message : "Could not initiate payment. Please try again.");
      setLoading(null);
    }
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
                ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
                : "border-border"
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
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
                  Redirecting…
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
        <h3 className="text-sm font-semibold text-foreground">What do credits buy?</h3>
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
          no counting credits. Starting from <strong className="text-white/80">R49/month</strong>.
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
