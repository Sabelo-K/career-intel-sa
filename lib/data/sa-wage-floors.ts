/**
 * South African statutory wage floors.
 *
 * Elementary and service occupations are the only part of the SA labour market
 * with a LEGALLY PUBLISHED wage floor, which makes their salary data far more
 * defensible than a market estimate. Every Tier-1 career anchors to these.
 *
 * ⚠️ MUST BE UPDATED EVERY MARCH, when the Minister gazettes the new National
 * Minimum Wage. An out-of-date figure here silently understates every
 * elementary occupation on the platform.
 *
 * Sources to check at each update:
 *   • National Minimum Wage Act 9 of 2018 — annual gazette (dol.gov.za)
 *   • Sectoral Determinations (domestic work, farm work, wholesale & retail,
 *     hospitality, contract cleaning, private security / PSIRA grades)
 *   • Relevant bargaining council agreements (MEIBC, MIBCO, BCCEI)
 */

/** Gazetted National Minimum Wage, rand per ordinary hour. */
export const NMW_HOURLY_ZAR = 28.79;

/** The rate above was last confirmed for this gazette year — verify on update. */
export const NMW_GAZETTE_YEAR = 2025;

/**
 * Ordinary monthly hours for a full-time 45-hour week (45 × 52 ÷ 12 ≈ 195).
 * This is the conventional conversion used for monthly-equivalent pay.
 */
export const ORDINARY_MONTHLY_HOURS = 195;

/** Full-time monthly equivalent of the National Minimum Wage. */
export const NMW_MONTHLY_ZAR = Math.round(NMW_HOURLY_ZAR * ORDINARY_MONTHLY_HOURS);

/** Multiple of the minimum wage, rounded to the nearest R100 — keeps bands honest. */
export function nmwMultiple(multiple: number): number {
  return Math.round((NMW_MONTHLY_ZAR * multiple) / 100) * 100;
}
