"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const PRICING = [
  {
    name: "Free",
    onceOff: "R0",
    subscription: "R0",
    description: "Start your career journey — no card needed",
    features: [
      "CV builder (upload & build from scratch)",
      "ATS score & recruiter rating",
      "Career demand insights (249+ SA careers)",
      "3 skills gap analyses/month",
      "15 AI coach messages/month",
      "Province job heatmap",
      "All 4 CV templates",
    ],
    cta: "Get Started Free",
    highlight: false,
    badge: null,
    saving: null,
  },
  {
    name: "Graduate",
    onceOff: "R29",
    subscription: "R24",
    description: "Built for students & job seekers",
    features: [
      "Everything in Free",
      "Full career demand access (all sectors)",
      "Unlimited skills gap analysis",
      "50 AI coach messages/month",
      "AI interview prep (role-specific questions)",
      "1 career path simulation/month",
      "Trade & artisan career insights",
    ],
    cta: "Get Graduate Plan",
    highlight: false,
    badge: "For Youth",
    saving: "Save R5/mo",
  },
  {
    name: "Professional",
    onceOff: "R79",
    subscription: "R65",
    description: "Serious about your career growth",
    features: [
      "Everything in Graduate",
      "Unlimited AI career coach",
      "Unlimited career path simulations",
      "Advanced salary forecasting (ZAR)",
      "Unlimited skills gap analysis",
      "Daily job alert digest emails",
      "Early access to new features",
    ],
    cta: "Get Professional Plan",
    highlight: true,
    badge: "Most Popular",
    saving: "Save R14/mo",
  },
  {
    name: "Recruiter",
    onceOff: "R499",
    subscription: "R399",
    description: "Market intelligence for HR & talent teams",
    features: [
      "Everything in Professional",
      "Province-level salary benchmarking",
      "Skills demand intelligence dashboard",
      "Advanced job market analytics",
      "Unlimited job alert tracking",
      "SA hiring trend reports",
      "Priority email support",
    ],
    cta: "Get Recruiter Plan",
    highlight: false,
    badge: "For Business",
    saving: "Save R100/mo",
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"subscription" | "once_off">("subscription");

  return (
    <section id="pricing" className="pt-10 sm:pt-14 pb-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50">Start free, upgrade when you&apos;re ready. No hidden fees.</p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex flex-col items-center gap-2 mb-12">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setBilling("subscription")}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === "subscription"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly Subscription
              <span className="absolute -top-2.5 -right-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">SAVE</span>
            </button>
            <button
              onClick={() => setBilling("once_off")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === "once_off"
                  ? "bg-white/10 text-white shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Once-off (30 days)
            </button>
          </div>
          {billing === "subscription" ? (
            <p className="text-xs text-emerald-400">✓ Lower monthly rate · Auto-renews · Cancel anytime</p>
          ) : (
            <p className="text-xs text-white/40">Pay once · 30 days access · No auto-renewal</p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {PRICING.map((plan, i) => (
            <div key={plan.name} className={`relative ${plan.badge ? "pt-5" : ""}`}>
              {plan.badge && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap ${
                  plan.badge === "Most Popular" ? "bg-indigo-600" :
                  plan.badge === "For Youth"    ? "bg-violet-600" :
                  "bg-amber-600"
                }`}>
                  {plan.badge}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 h-full flex flex-col ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-600/20 to-violet-600/10 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10"
                    : "bg-white/[0.03] border border-white/10"
                }`}
              >
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-bold text-white">
                      {billing === "subscription" ? plan.subscription : plan.onceOff}
                    </span>
                    <span className="text-white/40 text-sm mb-1">/mo</span>
                  </div>
                  {billing === "subscription" && plan.saving && (
                    <p className="text-xs text-emerald-400 mt-1">{plan.saving} vs once-off</p>
                  )}
                  {billing === "once_off" && plan.name !== "Free" && (
                    <p className="text-xs text-white/30 mt-1">30 days · no auto-renewal</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/25"
                      : "border border-white/10 hover:border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-white/30 mt-8">
          All plans include a free tier. Subscriptions can be cancelled anytime. Payments processed securely via PayFast.
        </p>
      </div>
    </section>
  );
}
