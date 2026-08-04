/**
 * Product analytics — the funnel events that answer the questions that matter:
 *
 *   Where do people come from, and which free tool actually drives sign-ups?
 *   How many who land actually sign up? Where do they drop off in onboarding?
 *   Which features get used? Who hits a limit, and do they then pay?
 *
 * PRIVACY: cookieless by design. Our cookie banner states plainly that we use
 * no advertising or tracking cookies — that must stay TRUE. Vercel Web
 * Analytics does not set cookies and does not fingerprint individuals, so the
 * claim holds and no extra POPIA consent is required. Never add a
 * cookie-setting analytics provider here without updating the banner, the
 * privacy policy, and the consent flow.
 *
 * We also never send personally identifying data (no email, name, or CV
 * content) — only the event and coarse, non-identifying properties.
 */
import { track as vercelTrack } from "@vercel/analytics";

/** Every event we track. Keeping them in one union avoids typo'd event names. */
export type AnalyticsEvent =
  // ── Acquisition: free tools (no sign-up required) ──────────────────────────
  | "tool_salary_check_run"
  | "tool_matric_run"
  | "tool_degree_roi_run"
  // ── Activation ────────────────────────────────────────────────────────────
  | "onboarding_completed"
  // ── Core feature usage ────────────────────────────────────────────────────
  | "cv_revamp_completed"
  // ── Monetisation funnel ───────────────────────────────────────────────────
  | "limit_reached"
  | "buy_credits_viewed"
  | "credits_checkout_started"
  | "upgrade_viewed"
  | "plan_checkout_started";

/** Non-identifying properties only. */
type Props = Record<string, string | number | boolean | null>;

/**
 * Record an event. Safe to call anywhere, including during SSR — failures are
 * swallowed so analytics can never break a user flow.
 */
export function track(event: AnalyticsEvent, props?: Props): void {
  try {
    if (typeof window === "undefined") return;
    vercelTrack(event, props);
  } catch {
    /* analytics must never throw into the UI */
  }
}
