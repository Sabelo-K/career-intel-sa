"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export function ReferralWidget() {
  const [link, setLink]           = useState("");
  const [count, setCount]         = useState(0);
  const [copied, setCopied]       = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/referral/claim")
      .then(r => r.json())
      .then(d => { setLink(d.link ?? ""); setCount(d.referralCount ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) return null;

  return (
    <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-5 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-foreground">Refer a Friend — Get 7 Free Days</h3>
            {count > 0 && (
              <span className="flex items-center gap-1 text-xs text-violet-400 font-semibold">
                <Users className="w-3 h-3" />
                {count} referred
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Share your link. When a friend signs up and completes onboarding, <strong className="text-foreground">you both get 7 free days</strong> added to your plan.
          </p>

          {link ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                {link}
              </div>
              <button
                onClick={copy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
              >
                {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Loading your referral link…</p>
          )}

          {count === 0 && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              Share on WhatsApp, LinkedIn, or with classmates — no limit on referrals.
            </p>
          )}
          {count > 0 && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">
              {count} friend{count !== 1 ? "s" : ""} joined via your link — you&apos;ve earned {count * 7} bonus days total 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
