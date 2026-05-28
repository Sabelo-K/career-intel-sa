/**
 * PayFast integration utilities
 * Docs: https://developers.payfast.co.za/docs
 */

import crypto from "crypto";

// ── Environment ───────────────────────────────────────────────────────────────

export const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  ?? "";
export const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? "";
const PAYFAST_PASSPHRASE          = process.env.PAYFAST_PASSPHRASE   ?? "";

// Set PAYFAST_SANDBOX=true in Vercel env vars to use sandbox without real charges.
// Remove it (or set to false) when ready to accept live payments.
const IS_SANDBOX    = process.env.PAYFAST_SANDBOX === "true";
const IS_PRODUCTION = process.env.NODE_ENV === "production" && !IS_SANDBOX;

export const PAYFAST_URL = IS_PRODUCTION
  ? "https://www.payfast.co.za/eng/process"
  : "https://sandbox.payfast.co.za/eng/process";

const PAYFAST_VALIDATE_URL = IS_PRODUCTION
  ? "https://www.payfast.co.za/eng/query/validate"
  : "https://sandbox.payfast.co.za/eng/query/validate";

/** Known PayFast server IPs for ITN validation in production */
const PAYFAST_IPS = [
  "197.97.145.144",
  "197.97.145.145",
  "197.97.145.146",
  "197.97.145.147",
  "41.74.179.194",
  "41.74.179.195",
  "41.74.179.196",
  "41.74.179.197",
];

// ── Plan definitions ──────────────────────────────────────────────────────────

export const PLANS = {
  graduate: {
    name:        "Graduate",
    amount:      "49.00",
    description: "30-day access to CareerIntel SA Graduate Plan",
    dbPlan:      "PREMIUM",
    days:        30,
  },
  professional: {
    name:        "Professional",
    amount:      "99.00",
    description: "30-day access to CareerIntel SA Professional Plan",
    dbPlan:      "PREMIUM",
    days:        30,
  },
  recruiter: {
    name:        "Recruiter",
    amount:      "499.00",
    description: "30-day access to CareerIntel SA Recruiter Plan",
    dbPlan:      "RECRUITER",
    days:        30,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ── Signature generation ──────────────────────────────────────────────────────

/**
 * Generates a PayFast MD5 signature from a parameter object.
 * Params must be in the ORDER they will appear in the form / ITN post.
 * Empty values are excluded.
 */
export function generateSignature(
  data: Record<string, string>,
  passphrase: string = PAYFAST_PASSPHRASE,
  skipEmpty: boolean = true   // checkout: skip empty fields; ITN verify: include all
): string {
  let payload = "";

  for (const [key, val] of Object.entries(data)) {
    if (key === "signature") continue;
    const strVal = String(val ?? "").trim();
    if (skipEmpty && strVal === "") continue;
    payload += `${key}=${encodeURIComponent(strVal).replace(/%20/g, "+")}&`;
  }

  // Remove trailing &
  payload = payload.slice(0, -1);

  if (passphrase) {
    payload += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(payload).digest("hex");
}

// ── ITN validation ────────────────────────────────────────────────────────────

export function verifyITNSignature(
  data: Record<string, string>,
  passphrase: string = PAYFAST_PASSPHRASE
): boolean {
  const { signature, ...rest } = data;
  // PayFast includes ALL fields (even empty) in the ITN signature — skipEmpty must be false
  const calculated = generateSignature(rest, passphrase, false);
  return signature === calculated;
}

/** Allows all IPs in sandbox/dev; enforces whitelist in production */
export function isValidPayFastIP(ip: string): boolean {
  if (!IS_PRODUCTION) return true;
  return PAYFAST_IPS.includes(ip);
}

/**
 * Sends the raw ITN body back to PayFast for server-side validation.
 * PayFast responds with "VALID" or "INVALID".
 */
export async function validateITNWithPayFast(
  itnData: Record<string, string>
): Promise<boolean> {
  try {
    const body = Object.entries(itnData)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const res = await fetch(PAYFAST_VALIDATE_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await res.text();
    return text.trim() === "VALID";
  } catch (err) {
    console.error("PayFast validate error:", err);
    return false;
  }
}
