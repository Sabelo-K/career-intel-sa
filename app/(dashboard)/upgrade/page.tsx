"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown, Check, Zap, Star, Users, ChevronRight, ArrowLeft,
  MessageCircle, BarChart2, FileText, Target, Shield, TrendingUp, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

type PlanKey = "graduate" | "professional" | "recruiter";

interface PlanConfig {
  key:         PlanKey;
  name:        string;
  price:       string;
  period:      string;
  tagline:     string;
  color:       string;
  badgeColor:  string;
  textColor:   string;
  icon:        React.ElementType;
  badge?:      string;
  highlight:   boolean;
  features:    string[];
}

// ── Plan definitions ──────────────────────────────────────────────────────────

// Once-off prices
const ONCE_OFF_PRICES: Record<PlanKey, string> = {
  graduate:     "R29",
  professional: "R79",
  recruiter:    "R499",
};

// Subscription prices
const SUBSCRIPTION_PRICES: Record<PlanKey, string> = {
  graduate:     "R24",
  professional: "R65",
  recruiter:    "R399",
};

const PLANS: PlanConfig[] = [
  {
    key:        "graduate",
    name:       "Graduate",
    price:      "R29",
    period:     "/month",
    tagline:    "Perfect for students & job seekers",
    color:      "border-violet-500/30 bg-violet-500/5",
    badgeColor: "bg-violet-600",
    textColor:  "text-violet-300",
    icon:       Star,
    badge:      "For Youth",
    highlight:  false,
    features: [
      "Everything in Free",
      "Full career demand access (all sectors)",
      "Unlimited skills gap analysis",
      "50 AI coach messages/month",
      "AI interview prep (role-specific questions)",
      "1 career path simulation/month",
      "Trade & artisan career insights",
    ],
  },
  {
    key:        "professional",
    name:       "Professional",
    price:      "R79",
    period:     "/month",
    tagline:    "Serious about your career growth",
    color:      "border-indigo-500/40 bg-indigo-500/10",
    badgeColor: "bg-indigo-600",
    textColor:  "text-indigo-300",
    icon:       Crown,
    badge:      "Most Popular",
    highlight:  true,
    features: [
      "Everything in Graduate",
      "Unlimited AI career coach",
      "Unlimited career path simulations",
      "Advanced salary forecasting (ZAR)",
      "Unlimited skills gap analysis",
      "Daily job alert digest emails",
      "Early access to new features",
    ],
  },
  {
    key:        "recruiter",
    name:       "Recruiter",
    price:      "R399",
    period:     "/month",
    tagline:    "Market intelligence for HR & talent teams",
    color:      "border-white/10 bg-white/3",
    badgeColor: "bg-white/20",
    textColor:  "text-white/40",
    icon:       Users,
    badge:      "Coming Soon",
    highlight:  false,
    features: [
      "Everything in Professional",
      "Province-level salary benchmarking",
      "Skills demand intelligence dashboard",
      "Advanced job market analytics",
      "Unlimited job alert tracking",
      "SA hiring trend reports",
      "Priority email support",
    ],
  },
];

// ── Feature highlights ────────────────────────────────────────────────────────

const HIGHLIGHTS = [
  { icon: MessageCircle, label: "Unlimited AI Coach",       desc: "Chat without limits — career advice, interview prep, salary negotiation" },
  { icon: Target,        label: "Skills Gap Analysis",      desc: "Know exactly what skills you need for your target role" },
  { icon: BarChart2,     label: "Career Path Simulations",  desc: "See your full career trajectory with realistic SA salary projections" },
  { icon: FileText,      label: "CV Intelligence",          desc: "ATS scoring, recruiter rating, and AI-powered rewrites" },
  { icon: TrendingUp,    label: "Real SA Market Data",      desc: "Live demand scores, salary benchmarks, and provincial insights" },
  { icon: Shield,        label: "POPIA Compliant",          desc: "Your data is safe, secure, and never sold to third parties" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const router         = useRouter();
  const [loading, setLoading]           = useState<PlanKey | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [pending, setPending]           = useState<{ url: string; params: Record<string, unknown> } | null>(null);
  const [currentPlan, setCurrentPlan]   = useState<string>("FREE");
  const [currentPlanKey, setCurrentPlanKey] = useState<string | null>(null);
  const [isNewUser, setIsNewUser]       = useState(false);
  const [daysLeft, setDaysLeft]         = useState(0);
  const [billingType, setBillingType]   = useState<"once_off" | "subscription">("subscription");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) setCurrentPlan(d.plan);
        if (d.planKey) setCurrentPlanKey(d.planKey);
        if (d.isNewUser) { setIsNewUser(true); setDaysLeft(d.daysLeftOnDiscount ?? 0); }
      })
      .catch(() => {});
  }, []);

  const submitCheckoutForm = (url: string, params: Record<string, unknown>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    for (const [k, v] of Object.entries(params)) {
      const input    = document.createElement("input");
      input.type     = "hidden";
      input.name     = k;
      input.value    = String(v);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const handleUpgrade = async (planKey: PlanKey) => {
    setLoading(planKey);
    setError(null);
    setPending(null);

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/payfast/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: planKey, billingType }),
        signal:  controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Checkout failed");
      }

      const { url, params } = await res.json();
      if (!url || !params) throw new Error("Payment could not be prepared. Please try again.");

      // Attempt immediate redirect; if the browser blocks a programmatic
      // submit after the await (transient-activation loss), the "Continue"
      // button lets the user finish with a real click.
      setPending({ url, params });
      submitCheckoutForm(url, params);
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setError(
        aborted
          ? "The payment service took too long to respond. Please try again."
          : err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      clearTimeout(timeout);
      setLoading(null);
    }
  };

  const isAlreadyPaid = currentPlan !== "FREE";

  // Discounted prices (50% off) — matches DISCOUNT_PLANS in lib/payfast.ts
  const DISCOUNTED_PRICES: Record<PlanKey, string> = {
    graduate:     "R15",
    professional: "R40",
    recruiter:    "R250",
  };

  return (
    <div className="max-w-5xl space-y-10">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-medium">
          <Zap className="w-3.5 h-3.5" />
          Unlock Your Full Career Potential
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Join thousands of South African professionals accelerating their careers with AI-powered intelligence.
        </p>
        {isAlreadyPaid && (
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            You are on the {currentPlanKey
            ? currentPlanKey.charAt(0).toUpperCase() + currentPlanKey.slice(1)
            : currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()} plan
          </div>
        )}
      </div>

      {/* New-user discount banner */}
      {isNewUser && !isAlreadyPaid && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 rounded-xl px-4 py-3.5"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              🎉 New user offer — 50% off your first month!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prices shown below are your discounted rate. Full price applies from month 2.
            </p>
          </div>
          {daysLeft > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg px-2.5 py-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
          <button
            onClick={() => setBillingType("once_off")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingType === "once_off"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Once-off (30 days)
          </button>
          <button
            onClick={() => setBillingType("subscription")}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingType === "subscription"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Subscription
            <span className="absolute -top-2.5 -right-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold">SAVE</span>
          </button>
        </div>
        {billingType === "subscription" ? (
          <p className="text-xs text-emerald-400">✓ Lower monthly rate · Auto-renews · Cancel anytime</p>
        ) : (
          <p className="text-xs text-muted-foreground">Pay once, access for 30 days · No auto-renewal</p>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {PLANS.map((plan, i) => {
          const Icon      = plan.icon;
          const isLoading    = loading === plan.key;
          const isComingSoon = plan.key === "recruiter";
          // Use planKey for exact match; fall back to tier for legacy records
          const isCurrent = currentPlanKey
            ? plan.key === currentPlanKey
            : (currentPlan === "RECRUITER" && plan.key === "recruiter");

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border p-5 flex flex-col ${plan.color} ${
                plan.highlight ? "ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10" : ""
              } ${plan.badge ? "mt-3" : ""} ${isComingSoon ? "opacity-60" : ""}`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-0.5 rounded-full ${plan.badgeColor} text-white font-semibold whitespace-nowrap`}>
                  {plan.badge}
                </span>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${plan.badgeColor}/20`}>
                  <Icon className={`w-4 h-4 ${plan.textColor}`} />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${plan.textColor}`}>{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                </div>
              </div>

              {/* Price */}
              {isComingSoon ? (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white/30">Coming Soon</p>
                  <p className="text-[11px] text-white/25 mt-1">We&apos;re building this — join the waitlist to be first in line</p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-3xl font-bold text-foreground">
                      {billingType === "subscription"
                        ? SUBSCRIPTION_PRICES[plan.key]
                        : isNewUser && !isAlreadyPaid
                          ? DISCOUNTED_PRICES[plan.key]
                          : ONCE_OFF_PRICES[plan.key]}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                    {billingType === "once_off" && isNewUser && !isAlreadyPaid && (
                      <span className="text-sm text-muted-foreground line-through">{ONCE_OFF_PRICES[plan.key]}</span>
                    )}
                  </div>
                  {billingType === "subscription" ? (
                    <p className="text-[11px] text-emerald-400 mb-3">
                      Save {plan.key === "graduate" ? "R5" : plan.key === "professional" ? "R14" : "R100"}/mo vs once-off · Cancel anytime
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mb-3">Once-off · 30 days access · No auto-renewal</p>
                  )}
                </>
              )}

              {/* Features */}
              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isComingSoon ? (
                <a
                  href="mailto:hello@careerintelsa.co.za?subject=Recruiter Plan Waitlist"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border border-white/15 text-white/40 text-sm font-medium hover:border-white/25 hover:text-white/60 transition-colors"
                >
                  Join Waitlist
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              ) : isCurrent ? (
                <Button variant="outline" size="sm" disabled className="w-full opacity-60">
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant={plan.highlight ? "indigo" : "outline"}
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={!!loading}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Redirecting…
                    </span>
                  ) : (
                    <>
                      {isNewUser && !isAlreadyPaid ? `Get ${plan.name} — 50% Off` : `Choose ${plan.name}`}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error} — please try again or contact support@careerintel.co.za
        </div>
      )}

      {/* Continue-to-payment fallback if the automatic redirect was blocked */}
      {pending && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3.5">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Almost there</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              If you weren&apos;t redirected automatically, continue to PayFast&rsquo;s secure checkout.
            </p>
          </div>
          <button
            onClick={() => submitCheckoutForm(pending.url, pending.params)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors active:scale-95 whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            Continue to secure payment
          </button>
        </div>
      )}

      {/* Trust signals */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Secure payments via <span className="text-foreground font-medium">PayFast</span> · South Africa&apos;s #1 payment gateway
        </p>
        <p className="text-xs text-muted-foreground">
          30-day access · No automatic renewal · POPIA compliant
          {isNewUser && !isAlreadyPaid && (
            <span className="text-amber-400 font-medium"> · 50% off your first month — no code needed</span>
          )}
        </p>
      </div>

      {/* Feature highlights */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-bold text-foreground text-center mb-6">Everything You Get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{h.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border pt-8 space-y-4">
        <h2 className="text-lg font-bold text-foreground text-center mb-6">Common Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: "Once-off vs subscription — what's the difference?",
              a: "Once-off gives you 30 days of access with no auto-renewal — you choose when to pay again. Subscription auto-renews monthly at a lower rate and can be cancelled anytime.",
            },
            {
              q: "How do I cancel a subscription?",
              a: "Email hello@careerintelsa.co.za with your account email and we'll cancel within 24 hours. Your access continues until the end of the current billing period.",
            },
            {
              q: "How do I pay?",
              a: "Via PayFast — South Africa's leading payment gateway. We accept EFT, credit/debit cards, and Ozow instant EFT.",
            },
            {
              q: "What happens when my plan expires?",
              a: "Your account reverts to the Free tier automatically. All your data (CVs, analyses, history) is fully preserved.",
            },
            {
              q: "Is my data secure?",
              a: "Yes. We are POPIA compliant. Your data is stored securely on South African-based servers and never sold to third parties.",
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{faq.q}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
