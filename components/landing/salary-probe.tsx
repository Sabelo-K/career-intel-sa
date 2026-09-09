"use client";

/**
 * Salary Probe — the landing-page hero.
 *
 * Replaces the faux-browser dashboard mockup. That mockup performed the product
 * with a hard-coded score ring; this is the product, answering in place, before
 * any account exists.
 *
 * Two structural rules hold this together, both deliberate:
 *
 *  1. GLASS ON THE SHELL, FLAT INSIDE. `backdrop-filter` forces the browser to
 *     recomposite the blurred layer whenever anything inside it changes. This
 *     panel updates on every keystroke, so the frost lives on the outer card
 *     only and every live-updating element (band, marker, verdict) uses a plain
 *     translucent fill. Same look, no dropped frames on mid-range Android.
 *
 *  2. RESULT ABOVE CONTROLS ON MOBILE. The whole effect is watching the number
 *     move while you change things. On a phone the two cannot both be on screen,
 *     so the figure comes first in DOM order and the controls sit beneath it.
 *     On lg+ they sit side by side with the controls on the left.
 */

import { useState, useMemo, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { Search, Share2, Check, ArrowRight, Info } from "lucide-react";
import { CAREER_INDEX, CAREER_INDEX_COUNT, type ProbeCareer } from "@/lib/data/career-index.generated";
import { matchesQuery, matchRank } from "@/lib/data/search-aliases";
import {
  PROVINCES,
  PROVINCE_NAME,
  EXPERIENCE_BANDS,
  DEFAULT_EXPERIENCE,
  computeBand,
  provinceLadder,
  positionInBand,
  formatZar,
  formatZarShort,
  confidenceLabel,
  SALARY_SOURCES,
} from "@/lib/data/salary-model";
import { track } from "@/lib/analytics";

/** Opens on a real role rather than an empty form, so the hero shows what it does. */
const DEFAULT_ROLE_ID = "nurse-professional";
const MAX_SUGGESTIONS = 7;

function findDefaultRole(): ProbeCareer {
  return CAREER_INDEX.find((c) => c.id === DEFAULT_ROLE_ID) ?? CAREER_INDEX[0];
}

export function SalaryProbe() {
  const listboxId = useId();
  const [role, setRole] = useState<ProbeCareer>(findDefaultRole);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [province, setProvince] = useState("GAUTENG");
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [salary, setSalary] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return CAREER_INDEX.filter((c) => matchesQuery(c, q))
      .sort((a, b) => matchRank(a, q) - matchRank(b, q) || b.avgSalaryZar - a.avgSalaryZar)
      .slice(0, MAX_SUGGESTIONS);
  }, [query]);

  const currentSalary = useMemo(() => {
    const digits = salary.replace(/\D/g, "");
    return digits ? parseInt(digits, 10) : null;
  }, [salary]);

  const band = useMemo(
    () => computeBand(role, { province, experience, currentSalary }),
    [role, province, experience, currentSalary]
  );

  const ladder = useMemo(
    () => provinceLadder(role, { experience, include: province, limit: 4 }),
    [role, experience, province]
  );

  // One funnel event per role actually benchmarked, not one per keystroke.
  useEffect(() => {
    if (!currentSalary || hasRun) return;
    setHasRun(true);
    track("tool_salary_probe_run", { role: role.title, province });
  }, [currentSalary, hasRun, role.title, province]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function choose(c: ProbeCareer) {
    setRole(c);
    setQuery("");
    setOpen(false);
    setCursor(-1);
    setHasRun(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(suggestions[cursor < 0 ? 0 : cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setCursor(-1);
    }
  }

  const shareUrl = useMemo(() => {
    const p = new URLSearchParams({
      role: role.title,
      province: PROVINCE_NAME[province] ?? province,
      avg: String(band.avg),
    });
    if (band.verdict) p.set("verdict", band.verdict);
    if (band.pctOfAvg) p.set("pct", String(band.pctOfAvg));
    return `https://careerintelsa.co.za/salary-check?${p.toString()}`;
  }, [role.title, province, band.avg, band.verdict, band.pctOfAvg]);

  async function onShare() {
    const line =
      band.verdict === "underpaid"
        ? `I'm on ${band.pctOfAvg}% of the market rate.`
        : band.verdict === "overpaid"
          ? `I'm above the market rate for my role.`
          : band.verdict === "fair"
            ? `I'm earning market rate.`
            : "";
    const text = `${role.title} in ${PROVINCE_NAME[province]} — market average is ${formatZar(band.avg)}/month. ${line}\nCheck yours free:`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "CareerIntel SA — Salary Check", text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* user dismissed the share sheet — nothing to report */
    }
  }

  const verdictTone =
    band.verdict === "underpaid"
      ? { pill: "bg-[#A5423F]/20 text-[#F0AEAA] border-[#A5423F]/45", label: "Underpaid" }
      : band.verdict === "overpaid"
        ? { pill: "bg-indigo-500/20 text-indigo-200 border-indigo-500/50", label: "Above market" }
        : band.verdict === "fair"
          ? { pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", label: "Market rate" }
          : { pill: "bg-white/5 text-white/45 border-white/10", label: "Add your salary" };

  return (
    /* Glass lives here, on the shell. Nothing inside re-blurs on keystroke. */
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border-b border-white/10">
        <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/35">
          Free salary benchmark
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          No sign-up
        </span>
      </div>

      <div className="p-4 sm:p-6 lg:p-7 grid gap-6 lg:grid-cols-[290px_1fr] lg:gap-8">
        {/* ── Result. First in DOM so it leads on mobile; second column on lg+. ── */}
        <div className="lg:order-2 flex flex-col gap-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/40">
                Market rate · <span className="text-indigo-300">{role.title}</span>
              </p>
              <div
                className="mt-1.5 text-4xl sm:text-5xl font-bold tracking-tight tabular-nums"
                aria-live="polite"
              >
                {formatZar(band.avg)}
              </div>
              <p className="mt-1.5 text-sm text-white/45">
                {EXPERIENCE_BANDS.find((b) => b.value === experience)?.label} ·{" "}
                {PROVINCE_NAME[province]} · per month
              </p>
            </div>
            <span
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${verdictTone.pill}`}
            >
              {verdictTone.label}
            </span>
          </div>

          {/* Band ruler — flat fills only, this repaints on every keystroke. */}
          <div>
            <div className="relative h-[70px]" role="img"
              aria-label={`Salary band from ${formatZar(band.min)} to ${formatZar(band.max)}, average ${formatZar(band.avg)}${band.current ? `, you earn ${formatZar(band.current)}` : ""}`}
            >
              <div className="absolute inset-x-0 top-[26px] h-3 rounded-full border border-white/10 bg-gradient-to-r from-indigo-500/20 via-indigo-500/55 to-[#A5423F]/45" />

              <div className="absolute top-[18px] w-px h-7 bg-white/25" style={{ left: 0 }}>
                <span className="absolute top-8 left-0 text-[11px] font-mono text-white/40 whitespace-nowrap">
                  {formatZarShort(band.min)}
                </span>
              </div>
              <div
                className="absolute top-[18px] w-0.5 h-7 bg-indigo-300 transition-[left] duration-500 ease-out"
                style={{ left: `${positionInBand(band.avg, band, 8)}%` }}
              >
                <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[11px] font-mono text-indigo-300 whitespace-nowrap">
                  {formatZarShort(band.avg)} avg
                </span>
              </div>
              <div className="absolute top-[18px] w-px h-7 bg-white/25" style={{ right: 0 }}>
                <span className="absolute top-8 right-0 text-[11px] font-mono text-white/40 whitespace-nowrap">
                  {formatZarShort(band.max)}
                </span>
              </div>

              {band.current !== null && (
                <div
                  className="absolute top-2 w-0.5 h-12 bg-amber-400 transition-[left] duration-500 ease-out"
                  style={{ left: `${positionInBand(band.current, band)}%` }}
                >
                  <span className="absolute -top-1.5 -left-[3px] w-2 h-2 rotate-45 bg-amber-400" />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-mono text-amber-400 whitespace-nowrap">
                    {formatZarShort(band.current)} you
                  </span>
                </div>
              )}
            </div>

            <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/30">
              <Info className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {confidenceLabel(role.dataConfidence)}. {SALARY_SOURCES}
              </span>
            </p>
          </div>

          {/* Where this role pays best */}
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2.5">
              Where this role pays best
            </p>
            <div className="flex flex-col gap-2">
              {ladder.map((p) => (
                <div key={p.code} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-[104px] shrink-0 truncate ${p.code === province ? "text-indigo-300 font-medium" : "text-white/65"}`}
                  >
                    {p.name}
                  </span>
                  <span className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <span
                      className={`block h-full rounded-full transition-[width] duration-500 ease-out ${p.code === province ? "bg-indigo-400" : "bg-indigo-500/70"}`}
                      style={{ width: `${Math.round((p.pay / (ladder[0]?.pay || 1)) * 100)}%` }}
                    />
                  </span>
                  <span className="w-[74px] text-right font-mono text-xs tabular-nums text-white/80">
                    {formatZarShort(p.pay)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* The share moment — only once there is a verdict worth sharing. */}
          {band.verdict && (
            <div className="flex items-center gap-3 flex-wrap rounded-xl border border-[#A5423F]/30 bg-[#A5423F]/10 px-4 py-3">
              <p className="flex-1 min-w-[190px] text-sm text-[#E4BDBB]">
                {band.verdict === "underpaid"
                  ? `You're on ${band.pctOfAvg}% of market rate — ${formatZar(Math.abs(band.gap ?? 0))} a month below the median.`
                  : band.verdict === "overpaid"
                    ? `You're on ${band.pctOfAvg}% of market rate for this role.`
                    : `You're inside the market band — ${band.pctOfAvg}% of the median.`}
              </p>
              <button
                type="button"
                onClick={onShare}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/15 text-sm text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Share result"}
              </button>
            </div>
          )}
        </div>

        {/* ── Controls ─────────────────────────────────────────────────── */}
        <div className="lg:order-1 flex flex-col gap-4">
          <div ref={wrapRef} className="relative">
            <label
              htmlFor="probe-role"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2"
            >
              Your role
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="probe-role"
                type="text"
                autoComplete="off"
                role="combobox"
                aria-expanded={open && query.trim().length >= 2}
                aria-controls={listboxId}
                aria-autocomplete="list"
                value={open ? query : role.title}
                onFocus={() => {
                  setQuery("");
                  setOpen(true);
                }}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setCursor(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search 307 SA careers…"
                className="w-full bg-white/5 border border-white/12 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-colors"
              />
            </div>

            {open && query.trim().length >= 2 && (
              <div
                id={listboxId}
                /* Only a listbox when it actually holds options — the no-match
                   panel is guidance, not a set of choices, and labelling it as
                   a listbox would announce zero options to a screen reader. */
                role={suggestions.length > 0 ? "listbox" : undefined}
                className="absolute z-30 left-0 right-0 mt-1.5 max-h-[228px] overflow-y-auto rounded-lg border border-white/12 bg-[#12152a] shadow-2xl shadow-black/60"
              >
                {suggestions.length > 0 ? (
                  suggestions.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      role="option"
                      aria-selected={i === cursor}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => choose(c)}
                      className={`w-full text-left px-3 py-2 border-b border-white/5 last:border-0 transition-colors ${
                        i === cursor ? "bg-indigo-500/25 text-indigo-100" : "text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <span className="block text-sm">{c.title}</span>
                      <span className="block text-[11px] text-white/40">
                        {c.sector} · {formatZarShort(c.avgSalaryZar)} avg
                      </span>
                    </button>
                  ))
                ) : (
                  /* Never a dead end: no match still offers a way forward. */
                  <div className="px-3 py-3">
                    <p className="text-sm text-white/60">
                      No match for &ldquo;{query.trim()}&rdquo;.
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      Try a broader word — &ldquo;nurse&rdquo;, &ldquo;electrician&rdquo;,
                      &ldquo;admin&rdquo; — or{" "}
                      <Link href="/job-market" className="text-indigo-300 hover:text-indigo-200 underline">
                        browse all {CAREER_INDEX_COUNT} careers
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="probe-province"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2"
            >
              Province
            </label>
            <select
              id="probe-province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors"
            >
              {PROVINCES.map((p) => (
                <option key={p.code} value={p.code} className="bg-[#12152a]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2">
              Experience
            </span>
            <div className="flex rounded-lg border border-white/12 overflow-hidden" role="group">
              {EXPERIENCE_BANDS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  aria-pressed={experience === b.value}
                  onClick={() => setExperience(b.value)}
                  className={`flex-1 px-1 py-2.5 text-xs border-r border-white/8 last:border-r-0 transition-colors ${
                    experience === b.value
                      ? "bg-indigo-500/28 text-indigo-100 font-medium"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  {b.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="probe-salary"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/40 mb-2"
            >
              What you earn now{" "}
              <span className="normal-case tracking-normal text-white/25">(optional)</span>
            </label>
            <input
              id="probe-salary"
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="R per month"
              className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-colors"
            />
          </div>

          <Link
            href="/sign-up"
            className="group flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Get your full career report
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
