/**
 * Shared SA salary model.
 *
 * These constants used to live inline in `app/(marketing)/salary-check/page.tsx`.
 * They are now shared by the salary checker, the landing-page Probe hero and the
 * dynamic share-card route, so all three can never quote different numbers for
 * the same role — which would be the fastest way to lose a user's trust.
 *
 * The multipliers are deliberately simple and deterministic: no AI anywhere in
 * the path that produces a rand figure, the same rule the payment ledger follows.
 */

export interface ProvinceOption {
  code: string;
  name: string;
}

export const PROVINCES: ProvinceOption[] = [
  { code: "GAUTENG", name: "Gauteng" },
  { code: "WESTERN_CAPE", name: "Western Cape" },
  { code: "KWAZULU_NATAL", name: "KwaZulu-Natal" },
  { code: "EASTERN_CAPE", name: "Eastern Cape" },
  { code: "FREE_STATE", name: "Free State" },
  { code: "LIMPOPO", name: "Limpopo" },
  { code: "MPUMALANGA", name: "Mpumalanga" },
  { code: "NORTH_WEST", name: "North West" },
  { code: "NORTHERN_CAPE", name: "Northern Cape" },
];

export const PROVINCE_NAME: Record<string, string> = Object.fromEntries(
  PROVINCES.map((p) => [p.code, p.name])
);

/** Province premium: the top hiring provinces pay more for the same role. */
export const PROVINCE_PREMIUM: Record<string, number> = {
  GAUTENG: 1.08,
  WESTERN_CAPE: 1.05,
  KWAZULU_NATAL: 0.97,
  EASTERN_CAPE: 0.93,
  FREE_STATE: 0.9,
  LIMPOPO: 0.88,
  MPUMALANGA: 0.91,
  NORTH_WEST: 0.89,
  NORTHERN_CAPE: 0.87,
};

export interface ExperienceBand {
  value: string;
  label: string;
  shortLabel: string;
  multiplier: number;
}

export const EXPERIENCE_BANDS: ExperienceBand[] = [
  { value: "0-2", label: "0 – 2 years", shortLabel: "0–2 yrs", multiplier: 0.72 },
  { value: "3-5", label: "3 – 5 years", shortLabel: "3–5", multiplier: 0.97 },
  { value: "6-10", label: "6 – 10 years", shortLabel: "6–10", multiplier: 1.18 },
  { value: "10+", label: "10+ years", shortLabel: "10+", multiplier: 1.38 },
];

export const DEFAULT_EXPERIENCE = "3-5";

/** Round to the nearest R500 — the granularity the source surveys support. */
export function roundZar(n: number): number {
  return Math.round(n / 500) * 500;
}

/**
 * Format a monthly rand figure. Below R10 000 the exact number matters (these
 * are minimum-wage-anchored roles), above it we round to the nearest R500.
 */
export function formatZar(n: number): string {
  const rounded = Math.round(n / 1000) * 1000;
  return `R${
    rounded < 10000
      ? Math.round(n).toLocaleString("en-ZA")
      : roundZar(n).toLocaleString("en-ZA")
  }`;
}

/** Compact form for axis ticks and share cards: R37 500 -> R38k. */
export function formatZarShort(n: number): string {
  return n >= 10000
    ? `R${Math.round(n / 1000)}k`
    : `R${Math.round(n).toLocaleString("en-ZA")}`;
}

export type Verdict = "underpaid" | "fair" | "overpaid";

/** The bands the verdict copy keys off. Kept here so wording can't drift. */
export const UNDERPAID_BELOW_PCT = 82;
export const OVERPAID_ABOVE_PCT = 115;

export interface SalaryInput {
  minSalaryZar: number;
  avgSalaryZar: number;
  maxSalaryZar: number;
}

export interface SalaryBand {
  min: number;
  avg: number;
  max: number;
  /** The user's own salary, when they gave one. */
  current: number | null;
  /** Their salary as a percentage of the market average. */
  pctOfAvg: number | null;
  /** Rands per month between them and the market average. Positive = short. */
  gap: number | null;
  verdict: Verdict | null;
}

/**
 * Resolve a role's published range into a band for one province and experience
 * level, and place the user inside it if they told us what they earn.
 */
export function computeBand(
  role: SalaryInput,
  opts: { province: string; experience: string; currentSalary?: number | null }
): SalaryBand {
  const band =
    EXPERIENCE_BANDS.find((b) => b.value === opts.experience) ??
    EXPERIENCE_BANDS.find((b) => b.value === DEFAULT_EXPERIENCE)!;
  const premium = PROVINCE_PREMIUM[opts.province] ?? 1;
  const factor = band.multiplier * premium;

  const min = roundZar(role.minSalaryZar * factor);
  const avg = roundZar(role.avgSalaryZar * factor);
  const max = roundZar(role.maxSalaryZar * factor);

  const current =
    opts.currentSalary && opts.currentSalary > 0 ? opts.currentSalary : null;
  const pctOfAvg = current && avg > 0 ? Math.round((current / avg) * 100) : null;
  const gap = current ? avg - current : null;
  const verdict: Verdict | null =
    pctOfAvg === null
      ? null
      : pctOfAvg < UNDERPAID_BELOW_PCT
        ? "underpaid"
        : pctOfAvg > OVERPAID_ABOVE_PCT
          ? "overpaid"
          : "fair";

  return { min, avg, max, current, pctOfAvg, gap, verdict };
}

/** What this role pays across the provinces that actually hire for it. */
export function provinceLadder(
  role: SalaryInput & { topProvinces: string[] },
  opts: { experience: string; include?: string; limit?: number }
): Array<{ code: string; name: string; pay: number }> {
  const band =
    EXPERIENCE_BANDS.find((b) => b.value === opts.experience) ??
    EXPERIENCE_BANDS.find((b) => b.value === DEFAULT_EXPERIENCE)!;
  const codes = new Set(role.topProvinces);
  if (opts.include) codes.add(opts.include);

  return [...codes]
    .filter((code) => PROVINCE_NAME[code])
    .map((code) => ({
      code,
      name: PROVINCE_NAME[code],
      pay: roundZar(role.avgSalaryZar * band.multiplier * (PROVINCE_PREMIUM[code] ?? 1)),
    }))
    .sort((a, b) => b.pay - a.pay)
    .slice(0, opts.limit ?? 4);
}

/**
 * Where a figure sits inside the band, as a percentage across it.
 * Clamped so a marker never renders outside its track.
 */
export function positionInBand(value: number, band: { min: number; max: number }, inset = 3): number {
  const span = Math.max(1, band.max - band.min);
  const raw = ((value - band.min) / span) * 100;
  return Math.min(100 - inset, Math.max(inset, raw));
}

/**
 * How well-grounded a role's figures are. Absent = the original 227-career
 * blend, which we show as an estimate rather than over-claiming.
 */
export function confidenceLabel(c?: "gazetted" | "surveyed" | "estimated"): string {
  return c === "gazetted"
    ? "Anchored to gazetted SA rates"
    : c === "surveyed"
      ? "From published SA salary surveys"
      : "Market estimate";
}

/** The sources behind every figure, shown under the band so it can be checked. */
export const SALARY_SOURCES =
  "Robert Walters SA Salary Guide 2026 · Stats SA QES Q1 2026 · National Minimum Wage (1 Mar 2026)";
