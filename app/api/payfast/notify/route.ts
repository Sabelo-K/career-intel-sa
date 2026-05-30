/**
 * PayFast Instant Transaction Notification (ITN) webhook.
 *
 * PayFast POSTs form-encoded data to this URL after every payment event.
 * We validate the request then upgrade the user's plan in the DB.
 *
 * Validation steps (PayFast docs):
 *  1. Verify the posting IP is a known PayFast server IP
 *  2. Verify the MD5 signature
 *  3. Validate the data by POSTing it back to PayFast's validate endpoint
 *  4. Check payment_status === "COMPLETE"
 *  5. Update user plan
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";
import {
  verifyITNSignature,
  isValidPayFastIP,
  validateITNWithPayFast,
  PLANS,
  type PlanKey,
} from "@/lib/payfast";

export const runtime = "nodejs";

// PayFast requires a raw body — disable Next.js body parsing
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ── Parse raw form-encoded body ─────────────────────────────────────────
    console.log("[PayFast ITN] Received request from:", req.headers.get("x-forwarded-for"));
    const text = await req.text();
    const params: Record<string, string> = {};

    for (const pair of text.split("&")) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const val = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, " "));
      params[key] = val;
    }

    // ── 1. IP validation ────────────────────────────────────────────────────
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const ip        = forwarded.split(",")[0].trim();

    if (!isValidPayFastIP(ip)) {
      console.error("[PayFast ITN] Invalid IP:", ip);
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── 2. Signature validation ─────────────────────────────────────────────
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
    if (!verifyITNSignature(params)) {
      console.error("[PayFast ITN] Signature mismatch");
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── 3. Server-side validation with PayFast ──────────────────────────────
    const isValid = await validateITNWithPayFast(params);
    if (!isValid) {
      console.error("[PayFast ITN] PayFast validation failed");
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── 4. Only act on COMPLETE payments ────────────────────────────────────
    if (params.payment_status !== "COMPLETE") {
      console.log("[PayFast ITN] Ignoring status:", params.payment_status);
      return new NextResponse("OK");
    }

    // ── 5. Update user plan ─────────────────────────────────────────────────
    const dbUserId = params.custom_str1;
    const planKey  = params.custom_str2 as PlanKey;

    if (!dbUserId || !planKey || !(planKey in PLANS)) {
      console.error("[PayFast ITN] Missing custom_str1/str2:", { dbUserId, planKey });
      return new NextResponse("INVALID", { status: 400 });
    }

    const planConfig  = PLANS[planKey];
    const planExpiresAt = new Date();
    planExpiresAt.setDate(planExpiresAt.getDate() + planConfig.days);

    await db.user.update({
      where: { id: dbUserId },
      data:  {
        plan:          planConfig.dbPlan as Plan,
        planKey,          // "graduate" | "professional" | "recruiter"
        planExpiresAt,
      },
    });

    console.log(
      `[PayFast ITN] User ${dbUserId} → ${planKey} (${planConfig.dbPlan}) until ${planExpiresAt.toISOString()}`
    );

    return new NextResponse("OK");
  } catch (err) {
    console.error("[PayFast ITN] Error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}
