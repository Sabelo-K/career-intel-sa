"use client";

/**
 * The Ledger — the employability score, made operable.
 *
 * The dashboard used to report a number and stop there. This shows the same
 * number, what it is made of, and what each available move is actually worth —
 * scored with the identical rules the API uses (lib/employability.ts), so the
 * arithmetic on screen is the arithmetic behind the number.
 *
 * Hovering or focusing a move previews it on the dial: the ghost ring holds
 * today's score, the bright ring shows where that one action would put you.
 * Nothing here is a guess — every gain is a re-score with one field changed.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  computeEmployability,
  nextMoves,
  scoreBand,
  SKILLS_MAX,
  PROFILE_MAX,
  ACTIVITY_MAX,
  type EmployabilityInput,
} from "@/lib/employability";

const RADIUS = 66;
const CIRC = 2 * Math.PI * RADIUS;

const KIND_TONE: Record<string, string> = {
  skills: "bg-shweshwe/15 border-shweshwe/30 text-primary",
  profile: "bg-shweshwe/15 border-shweshwe/30 text-primary",
  activity: "bg-seal/15 border-seal/30 text-destructive",
};

export interface CareerLedgerProps {
  input: EmployabilityInput;
  profileMissing?: Array<{ label: string; href: string }>;
}

export function CareerLedger({ input, profileMissing = [] }: CareerLedgerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const current = useMemo(() => computeEmployability(input), [input]);
  const moves = useMemo(() => nextMoves(input, { profileMissing }), [input, profileMissing]);

  const previewed = moves.find((m) => m.id === preview) ?? null;
  const projected = previewed ? current.total + previewed.gain : current.total;
  const band = scoreBand(current.total);

  const parts = [
    { key: "skills", label: "Skills", part: current.skills, max: SKILLS_MAX },
    { key: "profile", label: "Profile", part: current.profile, max: PROFILE_MAX },
    { key: "activity", label: "Activity", part: current.activity, max: ACTIVITY_MAX },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold">Your employability ledger</h2>
        <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
          What moves the number
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[190px_1fr] lg:gap-8">
        {/* ── Dial ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-[170px] h-[170px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80" cy="80" r={RADIUS} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth="11"
              />
              {/* Ghost ring: where you are today, held while previewing a move. */}
              <circle
                cx="80" cy="80" r={RADIUS} fill="none"
                stroke="rgba(74,95,199,0.32)" strokeWidth="11" strokeLinecap="round"
                strokeDasharray={`${(current.total / 100) * CIRC} ${CIRC}`}
              />
              <motion.circle
                cx="80" cy="80" r={RADIUS} fill="none"
                stroke={previewed ? "#3FB380" : band.colour}
                strokeWidth="11" strokeLinecap="round"
                initial={false}
                animate={{ strokeDasharray: `${(projected / 100) * CIRC} ${CIRC}` }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[2.6rem] leading-none font-bold tabular-nums">
                {projected}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="mt-2 min-h-[22px]">
            {previewed ? (
              <span className="text-sm font-mono text-emerald-700">
                +{previewed.gain} with that one step
              </span>
            ) : (
              <span className="text-sm font-semibold" style={{ color: band.colour }}>
                {band.label}
              </span>
            )}
          </div>

          {/* Composition — the three things the score is actually made of. */}
          <div className="w-full mt-4 flex flex-col gap-2">
            {parts.map((p) => (
              <div key={p.key} className="flex items-center gap-2.5 text-xs">
                <span className="w-12 text-left text-muted-foreground">{p.label}</span>
                <span className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-shweshwe transition-[width] duration-500"
                    style={{ width: `${p.part.pct}%` }}
                  />
                </span>
                <span className="w-11 text-right font-mono tabular-nums text-muted-foreground">
                  {p.part.score}/{p.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Moves ────────────────────────────────────────────────────── */}
        <div>
          {moves.length > 0 ? (
            <>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-3">
                Ranked by what each is worth
              </p>
              <div className="flex flex-col gap-2">
                {moves.map((m) => (
                  <Link
                    key={m.id}
                    href={m.href}
                    onMouseEnter={() => setPreview(m.id)}
                    onMouseLeave={() => setPreview(null)}
                    onFocus={() => setPreview(m.id)}
                    onBlur={() => setPreview(null)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-3 transition-colors hover:border-shweshwe/45 hover:bg-shweshwe/5"
                  >
                    <span
                      className={`shrink-0 w-11 text-center rounded-lg border px-1.5 py-1 font-mono text-sm tabular-nums ${KIND_TONE[m.kind]}`}
                    >
                      +{m.gain}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{m.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {m.detail}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Hover a step to see where it puts you. Points are the real scoring
                rules, not an estimate.
              </p>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-8">
              <Sparkles className="w-6 h-6 text-emerald-700" />
              <p className="text-sm font-medium">You&apos;ve maxed every lever.</p>
              <p className="text-xs text-muted-foreground max-w-[34ch]">
                Nothing left to add — your score is as high as these rules go.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
