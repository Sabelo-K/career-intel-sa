/**
 * Deterministic, code-based ATS + recruiter scoring.
 *
 * The AI rewrites the CV; THIS file scores it. Same input always yields the
 * same score (no LLM guessing, no temperature noise), so before/after deltas
 * are real and defensible. Scoring is grounded in the actual mechanics ATS
 * software and recruiters use: keyword match, section presence, contact
 * completeness, quantification, action verbs, formatting and length.
 */

import { SA_CAREERS } from "@/lib/data/sa-careers";

// Strong action verbs recruiters/ATS reward at the start of bullets
const ACTION_VERBS = new Set([
  "spearheaded","streamlined","championed","engineered","negotiated","deployed",
  "reduced","grew","secured","delivered","overhauled","introduced","accelerated",
  "conceptualised","conceptualized","drove","established","led","managed","built",
  "designed","developed","implemented","launched","increased","improved","created",
  "optimised","optimized","automated","migrated","architected","directed","coordinated",
  "generated","boosted","cut","saved","won","achieved","exceeded","transformed",
  "mentored","scaled","integrated","forecasted","analysed","analyzed","resolved",
]);

// Every known skill across the SA careers dataset — used to mine a job
// description for real, recognised keywords (your proprietary data as the source).
const ALL_SKILLS: string[] = Array.from(
  new Set(SA_CAREERS.flatMap((c) => c.topSkills.map((s) => s.trim())).filter(Boolean))
);

/** Normalise for matching: lowercase, collapse whitespace/punctuation. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#./ ]/g, " ").replace(/\s+/g, " ").trim();
}

/** True if `keyword` appears as a token/phrase inside `haystack` (both normalised). */
function contains(haystack: string, keyword: string): boolean {
  const k = norm(keyword);
  if (!k) return false;
  return haystack.includes(k);
}

/**
 * Build the target keyword set from (a) the SA-careers topSkills for the chosen
 * role and (b) any recognised skills mentioned in the pasted job description.
 * This is what "ATS optimisation" actually optimises against.
 */
export function getTargetKeywords(targetRole?: string, jobDescription?: string): string[] {
  const out = new Set<string>();

  if (targetRole) {
    const t = norm(targetRole);
    // Best-effort match a career by title (exact-ish, then partial)
    const match =
      SA_CAREERS.find((c) => norm(c.title) === t) ??
      SA_CAREERS.find((c) => norm(c.title).includes(t) || t.includes(norm(c.title)));
    match?.topSkills.forEach((s) => out.add(s));
  }

  if (jobDescription) {
    const jd = norm(jobDescription);
    for (const skill of ALL_SKILLS) {
      if (contains(jd, skill)) out.add(skill);
    }
  }

  return Array.from(out);
}

export interface AtsBreakdown {
  keywords: number;        // 0-100 — % of target keywords present
  sections: number;        // 0-100 — required sections present
  contact: number;         // 0-100 — email/phone/location present
  quantification: number;  // 0-100 — % of bullets with a metric
  actionVerbs: number;     // 0-100 — % of bullets starting with a strong verb
  formatting: number;      // 0-100 — dates present, no red flags
  length: number;          // 0-100 — sensible word count
}

export interface AtsResult {
  atsScore: number;
  recruiterScore: number;
  keywordMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  breakdown: AtsBreakdown;
}

export interface ScoreableCv {
  summary?: string;
  skills?: string[];
  bullets?: string[];                 // all experience bullet lines
  contact?: { email?: string; phone?: string; location?: string };
  hasExperience?: boolean;
  hasEducation?: boolean;
  fullText: string;                   // everything, for keyword scanning
}

const METRIC_RE = /(\d+\s?%|r\s?\d|\$\d|\d{2,}|\bzar\b|\bmillion\b|\bthousand\b|\bx\b)/i;

/** Deterministically score a CV against a target keyword set. */
export function scoreCv(cv: ScoreableCv, keywords: string[]): AtsResult {
  const hay = norm(cv.fullText);

  // ── Keywords ──────────────────────────────────────────────────────────────
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of keywords) (contains(hay, k) ? matched : missing).push(k);
  const keywordMatch = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  // With no target keywords we can't judge match — give a neutral-but-honest 60.
  const keywordsScore = keywords.length ? keywordMatch : 60;

  // ── Sections ──────────────────────────────────────────────────────────────
  const sectionChecks = [
    !!cv.summary && cv.summary.trim().length > 40,
    !!cv.hasExperience,
    !!cv.hasEducation,
    Array.isArray(cv.skills) && cv.skills.length >= 3,
  ];
  const sections = Math.round((sectionChecks.filter(Boolean).length / sectionChecks.length) * 100);

  // ── Contact ───────────────────────────────────────────────────────────────
  const c = cv.contact ?? {};
  const contactChecks = [!!c.email, !!c.phone, !!c.location];
  const contact = Math.round((contactChecks.filter(Boolean).length / contactChecks.length) * 100);

  // ── Bullet quality ────────────────────────────────────────────────────────
  const bullets = (cv.bullets ?? []).map((b) => b.trim()).filter(Boolean);
  const quantified = bullets.filter((b) => METRIC_RE.test(b)).length;
  const quantification = bullets.length ? Math.round((quantified / bullets.length) * 100) : 0;

  const strongStart = bullets.filter((b) => {
    const first = norm(b).split(" ")[0];
    return ACTION_VERBS.has(first);
  }).length;
  const actionVerbs = bullets.length ? Math.round((strongStart / bullets.length) * 100) : 0;

  // ── Formatting: dates present, no obvious ATS red flags ───────────────────
  const hasDates = /\b(19|20)\d{2}\b/.test(cv.fullText) || /present/i.test(cv.fullText);
  const formatting = hasDates ? 100 : 55;

  // ── Length ────────────────────────────────────────────────────────────────
  const words = cv.fullText.split(/\s+/).filter(Boolean).length;
  const length = words < 150 ? 40 : words > 1200 ? 70 : 100;

  const breakdown: AtsBreakdown = { keywords: keywordsScore, sections, contact, quantification, actionVerbs, formatting, length };

  // ATS machines care most about parse-ability + keyword match.
  const atsScore = Math.round(
    keywordsScore * 0.40 + sections * 0.20 + contact * 0.15 + formatting * 0.15 + length * 0.10
  );

  // Recruiters (human) care most about impact: metrics + strong verbs + a real summary.
  const summaryQuality = cv.summary && cv.summary.trim().length > 60 ? 100 : cv.summary ? 60 : 20;
  const recruiterScore = Math.round(
    quantification * 0.30 + actionVerbs * 0.25 + summaryQuality * 0.20 + keywordsScore * 0.15 + sections * 0.10
  );

  return {
    atsScore: clamp(atsScore),
    recruiterScore: clamp(recruiterScore),
    keywordMatch,
    matchedKeywords: matched,
    missingKeywords: missing,
    breakdown,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Flatten a revamped CV object into scoreable parts. */
export function toScoreable(cv: Record<string, unknown>): ScoreableCv {
  const personal = (cv.personal ?? {}) as Record<string, string>;
  const summary  = typeof cv.summary === "string" ? cv.summary : "";
  const skills   = Array.isArray(cv.skills) ? (cv.skills as string[]) : [];
  const experience = Array.isArray(cv.experience) ? (cv.experience as Record<string, unknown>[]) : [];
  const education  = Array.isArray(cv.education) ? (cv.education as Record<string, unknown>[]) : [];
  const certs      = Array.isArray(cv.certifications) ? (cv.certifications as string[]) : [];

  const bullets: string[] = experience.flatMap((e) =>
    typeof e.description === "string" ? (e.description as string).split(/\n+/) : []
  );

  const fullText = [
    summary,
    skills.join(" "),
    certs.join(" "),
    experience.map((e) => `${e.jobTitle ?? ""} ${e.company ?? ""} ${e.description ?? ""}`).join(" "),
    education.map((e) => `${e.qualification ?? ""} ${e.fieldOfStudy ?? ""} ${e.institution ?? ""}`).join(" "),
  ].join(" ");

  return {
    summary,
    skills,
    bullets,
    contact: { email: personal.email, phone: personal.phone, location: personal.location || personal.province },
    hasExperience: experience.length > 0,
    hasEducation: education.length > 0,
    fullText,
  };
}
