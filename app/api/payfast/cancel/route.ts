/**
 * POST /api/payfast/cancel
 *
 * Cancels a user's active PayFast subscription using their stored token.
 * PayFast subscription cancellations are done via their API:
 * PUT https://api.payfast.co.za/subscriptions/{token}/cancel
 *
 * After cancellation, the user retains access until planExpiresAt,
 * then the plan auto-reverts to FREE via getEffectivePlan().
 */
import { NextResponse }     from "next/server";
import { auth }              from "@clerk/nextjs/server";
import { db }                from "@/lib/db";
import {
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  generateSignature,
} from "@/lib/payfast";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where:  { clerkId: userId },
      select: { id: true, payfastToken: true, billingType: true, planExpiresAt: true },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (dbUser.billingType !== "SUBSCRIPTION") {
      return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
    }

    if (!dbUser.payfastToken) {
      // Token missing — mark as cancelled in DB anyway so plan reverts on expiry
      await db.user.update({
        where: { id: dbUser.id },
        data:  { billingType: "ONCE_OFF" },
      });
      return NextResponse.json({ success: true, message: "Subscription marked as cancelled. Access continues until plan expiry." });
    }

    // ── Call PayFast cancellation API ─────────────────────────────────────────
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const version   = "v1";

    const headers: Record<string, string> = {
      "merchant-id": PAYFAST_MERCHANT_ID,
      "version":     version,
      "timestamp":   timestamp,
    };

    // Signature for PayFast API = MD5 of header key=value pairs sorted alphabetically
    const signatureData = Object.fromEntries(
      Object.entries(headers).sort(([a], [b]) => a.localeCompare(b))
    );
    const signature = generateSignature(signatureData, process.env.PAYFAST_PASSPHRASE ?? "", false);
    headers["signature"] = signature;

    const IS_PRODUCTION = process.env.NODE_ENV === "production" && process.env.PAYFAST_SANDBOX !== "true";
    const cancelUrl = IS_PRODUCTION
      ? `https://api.payfast.co.za/subscriptions/${dbUser.payfastToken}/cancel`
      : `https://api.sandbox.payfast.co.za/subscriptions/${dbUser.payfastToken}/cancel`;

    const pfRes = await fetch(cancelUrl, {
      method:  "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
    });

    if (!pfRes.ok) {
      console.error("[PayFast Cancel] API error:", pfRes.status, await pfRes.text());
      // Even if PayFast API fails, mark in DB so we can manually follow up
    }

    // Mark subscription as cancelled in DB — plan reverts to FREE on planExpiresAt
    await db.user.update({
      where: { id: dbUser.id },
      data:  { billingType: "ONCE_OFF" },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled. You retain access until your current billing period ends.",
      accessUntil: dbUser.planExpiresAt,
    });
  } catch (err) {
    console.error("[PayFast Cancel] Error:", err);
    return NextResponse.json({ error: "Cancellation failed. Please email hello@careerintelsa.co.za" }, { status: 500 });
  }
}
