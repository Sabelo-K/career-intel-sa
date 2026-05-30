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

const PLANS: PlanConfig[] = [
  {
    key:        "graduate",
    name:       "Graduate",
    price:      "R49",
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
    price:      "R99",
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
    price:      "R499",
    period:     "/month",
    tagline:    "Market intelligence for HR & talent teams",
    color:      "border-amber-500/30 bg-amber-500/5",
    badgeColor: "bg-amber-600",
    textColor:  "text-amber-300",
    icon:       Users,
    badge:      "For Business",
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
  const [currentPlan, setCurrentPlan]   = useState<string>("FREE");
  const [currentPlanKey, setCurrentPlanKey] = useState<string | null>(null);
  const [isNewUser, setIsNewUser]       = useState(false);
  const [daysLeft, setDaysLeft]         = useState(0);

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

  const handleUpgrade = async (planKey: PlanKey) => {
    setLoading(planKey);
    setError(null);

    try {
      const res = await fetch("/api/payfast/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: planKey }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Checkout failed");
      }

      const { url, params } = await res.json();

      // Auto-submit a hidden form to PayFast (required for POST redirect)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  const isAlreadyPaid = currentPlan !== "FREE";

  // Discounted prices (50% off) — matches DISCOUNT_PLANS in lib/payfast.ts
  const DISCOUNTED_PRICES: Record<PlanKey, string> = {
    graduate:     "R25",
    professional: "R50",
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

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {PLANS.map((plan, i) => {
          const Icon      = plan.icon;
          const isLoading = loading === plan.key;
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
              } ${plan.badge ? "mt-3" : ""}`}
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
              <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                <span className="text-3xl font-bold text-foreground">
                  {isNewUser && !isAlreadyPaid ? DISCOUNTED_PRICES[plan.key] : plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
                {isNewUser && !isAlreadyPaid && (
                  <span className="text-sm text-muted-foreground line-through">{plan.price}</span>
                )}
              </div>

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
              {isCurrent ? (
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
              q: "Is this a subscription?",
              a: "No — each payment gives you 30 days of access. There is no automatic renewal. You choose when to pay again.",
            },
            {
              q: "How do I pay?",
              a: "Via PayFast — South Africa's leading payment gateway. We accept EFT, credit/debit cards, and Ozow instant EFT.",
            },
            {
              q: "What happens when my plan expires?",
              a: "Your account reverts to the Free tier automatically. All your data (CVs, analyses, history) is preserved.",
            },
            {
              q: "Is my data secure?",
              a: "Yes. We are POPIA compliant. Your data is stored securely and never sold to third parties.",
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
