"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain, BookOpen, ArrowRight, AlertTriangle, CheckCircle2,
  Lock, Unlock, Share2, TrendingUp, Sparkles,
} from "lucide-react";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { CAREER_SUBJECTS, SUBJECT_GROUPS } from "@/lib/data/sa-subjects";
import { track } from "@/lib/analytics";

// Only careers with a real subject mapping can be reasoned about honestly.
const MAPPED = SA_CAREERS.filter((c) => CAREER_SUBJECTS[c.id]);

// Subjects that actually gate careers — the ones a Grade 9 choice turns on.
const GATEKEEPERS = ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting"];

function countUnlockedBy(subject: string): number {
  return MAPPED.filter((c) => CAREER_SUBJECTS[c.id].required.includes(subject)).length;
}

function fmtSalary(n: number) {
  return `R${Math.round(n / 1000)}k`;
}

// In the CAPS system a learner takes Mathematics OR Mathematical Literacy —
// never both — and Mathematics is accepted anywhere Maths Lit is required.
// Encoding this stops the tool giving advice a teacher would laugh at.
const MATHS      = "Mathematics";
const MATHS_LIT  = "Mathematical Literacy";

function satisfies(chosen: string[], required: string): boolean {
  if (chosen.includes(required)) return true;
  if (required === MATHS_LIT && chosen.includes(MATHS)) return true;  // Maths is stronger
  return false;
}

export default function SubjectChoicePage() {
  const [chosen, setChosen] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toggle = (s: string) =>
    setChosen((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      // Maths and Maths Lit are mutually exclusive
      const cleared =
        s === MATHS     ? prev.filter((x) => x !== MATHS_LIT) :
        s === MATHS_LIT ? prev.filter((x) => x !== MATHS)     : prev;
      return [...cleared, s];
    });

  const result = useMemo(() => {
    if (chosen.length === 0) return null;

    // `required` decides whether a door is open. `recommended` decides how
    // GOOD a fit it is — without it, choosing Tourism vs Visual Arts would
    // give identical results, since electives never gate entry.
    const open: { career: (typeof MAPPED)[0]; fit: number }[] = [];
    const oneAway: { career: (typeof MAPPED)[0]; missing: string }[] = [];
    const closed: typeof MAPPED = [];

    for (const c of MAPPED) {
      const { required, recommended } = CAREER_SUBJECTS[c.id];
      const missing = required.filter((r) => !satisfies(chosen, r));
      if (missing.length === 0) {
        const fit = recommended.filter((r) => chosen.includes(r)).length;
        open.push({ career: c, fit });
      } else if (missing.length === 1) {
        oneAway.push({ career: c, missing: missing[0] });
      } else {
        closed.push(c);
      }
    }

    // Which single subject would unlock the most additional careers?
    // Never suggest Maths Lit to someone who has Mathematics — it's a downgrade,
    // and they can't take both anyway.
    const gains: Record<string, number> = {};
    for (const { missing } of oneAway) {
      if (missing === MATHS_LIT && chosen.includes(MATHS)) continue;
      gains[missing] = (gains[missing] ?? 0) + 1;
    }
    const bestAdd = Object.entries(gains).sort(([, a], [, b]) => b - a)[0] ?? null;

    return {
      // Best fit first (your electives matter), then market demand.
      open: open.sort((a, b) => b.fit - a.fit || b.career.demandScore - a.career.demandScore),
      oneAway: oneAway.sort((a, b) => b.career.demandScore - a.career.demandScore),
      closed,
      bestAdd,
      strongFits: open.filter((o) => o.fit >= 2).length,
    };
  }, [chosen]);

  const hasMaths    = chosen.includes("Mathematics");
  const hasMathsLit = chosen.includes("Mathematical Literacy");
  const mathsUnlocks = countUnlockedBy("Mathematics");

  async function share() {
    if (!result) return;
    const text =
      `I checked which careers my school subjects open up on CareerIntel SA.\n` +
      `My subjects unlock ${result.open.length} careers${result.bestAdd ? `, and adding ${result.bestAdd[0]} would unlock ${result.bestAdd[1]} more` : ""}.\n` +
      `Check yours free: https://careerintelsa.co.za/subject-choice`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-4 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">
            Career<span className="text-indigo-400">Intel</span>
            <span className="text-amber-400 text-xs ml-1">SA</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/matric" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Matric Matcher</Link>
          <Link href="/sign-up" className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Free subject-choice guide — no sign-up
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Which careers do your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">school subjects open?</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Choose the subjects you enjoy and we&apos;ll show you which careers they unlock —
            and which ones close. Made for Grades 9–11, before your subject choice is final.
          </p>
        </div>

        {/* Subject picker */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Pick the subjects you enjoy</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Choose what you actually like — not what you think you should pick.
          </p>

          <div className="space-y-4">
            {SUBJECT_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.subjects.map((s) => {
                    const active = chosen.includes(s);
                    const unlocks = countUnlockedBy(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggle(s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          active
                            ? "bg-indigo-600 border-indigo-500 text-white font-medium"
                            : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-white/20"
                        }`}
                      >
                        {s}
                        {unlocks > 0 && (
                          <span className={`ml-1.5 text-[10px] ${active ? "text-indigo-100" : "text-emerald-400"}`}>
                            {unlocks}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {chosen.length > 0 && (
            <button
              onClick={() => setChosen([])}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* The Mathematics decision — the highest-stakes choice in SA schooling */}
        {chosen.length > 0 && !hasMaths && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  You haven&apos;t chosen Mathematics — that closes {mathsUnlocks} careers
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Mathematics is required for engineering, medicine, actuarial science, CA(SA),
                  and most BSc degrees. {hasMathsLit && "Mathematical Literacy is a valuable subject, but it is not accepted in place of Mathematics for these programmes. "}
                  This is the single biggest subject decision you will make — and it is very hard to reverse after Grade 10.
                </p>
                <button
                  onClick={() => toggle("Mathematics")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  See what Mathematics unlocks
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {chosen.length > 0 && hasMaths && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Mathematics is keeping {mathsUnlocks} careers open for you.</strong>{" "}
              It&apos;s the single most valuable subject choice in the South African system — keep it if you possibly can.
            </p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Headline counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-emerald-500/25 rounded-2xl p-4 text-center">
                  <Unlock className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-3xl font-bold text-foreground">{result.open.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">careers open to you</p>
                  {result.strongFits > 0 && (
                    <p className="text-[11px] text-emerald-400 mt-1">{result.strongFits} a strong fit</p>
                  )}
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 text-center">
                  <Lock className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-3xl font-bold text-muted-foreground">{result.oneAway.length + result.closed.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">need other subjects</p>
                </div>
              </div>

              {/* Best next subject */}
              {result.bestAdd && (
                <div className="bg-card border border-indigo-500/25 rounded-2xl p-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Adding <span className="text-indigo-400">{result.bestAdd[0]}</span> would unlock {result.bestAdd[1]} more career{result.bestAdd[1] !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      It&apos;s the single highest-impact subject you could still add.
                    </p>
                  </div>
                </div>
              )}

              {/* Open careers */}
              {result.open.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    Careers your subjects open ({result.open.length})
                  </h3>
                  <div className="space-y-2">
                    {result.open.slice(0, 12).map(({ career: c, fit }) => (
                      <div key={c.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                            {fit >= 2 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 whitespace-nowrap flex-shrink-0">
                                Strong fit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.sector}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                            {fmtSalary(c.avgSalaryZar)}/mo avg
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                            <TrendingUp className="w-3 h-3" /> demand {c.demandScore}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {result.open.length > 12 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      + {result.open.length - 12} more
                    </p>
                  )}
                </div>
              )}

              {/* One subject away */}
              {result.oneAway.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    One subject away ({result.oneAway.length})
                  </h3>
                  <div className="space-y-2">
                    {result.oneAway.slice(0, 8).map(({ career, missing }) => (
                      <div key={career.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{career.title}</p>
                          <p className="text-xs text-amber-400">needs {missing}</p>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {fmtSalary(career.avgSalaryZar)}/mo
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.open.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No careers in our database match this exact combination yet. Try adding a
                    gatekeeper subject like {GATEKEEPERS.slice(0, 3).join(", ")} to see more options.
                  </p>
                </div>
              )}

              {/* Share + CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={share}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-semibold transition-colors hover:border-white/20"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share my results"}
                </button>
                <Link
                  href="/sign-up"
                  onClick={() => track("tool_subject_choice_run", { subjects: chosen.length, opened: result.open.length })}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Get my full career plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                Based on {MAPPED.length} South African careers with verified subject requirements.
                This is guidance, not a guarantee — always confirm entry requirements with the
                university or college you plan to apply to.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {chosen.length === 0 && (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a few subjects above to see which careers they open.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
