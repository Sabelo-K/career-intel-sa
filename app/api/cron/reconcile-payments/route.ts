/**
 * GET /api/cron/reconcile-payments
 * Runs every 15 minutes. Two jobs:
 *
 *  1. SELF-HEAL — a payment PayFast already confirmed (status COMPLETE) but
 *     which was never fulfilled (credits not granted, e.g. a DB blip during the
 *     ITN). This is safe to fix automatically because PayFast already verified
 *     the money: we simply grant what was paid for. Idempotent.
 *
 *  2. FLAG — a payment that was started but never confirmed (still INITIATED
 *     after 30 min). We CANNOT auto-credit these: we have no proof the customer
 *     was actually charged (most are just abandoned checkouts). These are
 *     marked STALE and emailed to the owner to check against PayFast.
 *
 * Deliberately NOT AI-driven: money movement follows exact rules only.
 * Protected by CRON_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addCredits, CREDIT_PACKS, type CreditPackId } from "@/lib/credits";
import { sendReconciliationReport } from "@/lib/email";
import { rands } from "@/lib/payments";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

const STALE_AFTER_MINUTES = 30;

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const healed: { reference: string; amountRands: number }[] = [];
  const stuck:  { reference: string; amountRands: number; ageMinutes: number; email: string }[] = [];

  try {
    // ── 1. Self-heal: confirmed by PayFast but never fulfilled ──────────────
    const unfulfilled = await db.payment.findMany({
      where: { status: "COMPLETE", fulfilled: false, type: "credits" },
      take:  50,
    });

    for (const p of unfulfilled) {
      const packId = p.packId as CreditPackId | null;
      if (!packId || !(packId in CREDIT_PACKS)) {
        console.error("[cron/reconcile-payments] unknown pack on payment", p.id, p.packId);
        continue;
      }
      try {
        // Idempotent on the PayFast reference — safe if the ITN also lands.
        await addCredits(p.userId, packId, p.pfPaymentId ?? p.mPaymentId);
        await db.payment.update({
          where: { id: p.id },
          data:  { fulfilled: true },
        });
        healed.push({
          reference:   p.pfPaymentId ?? p.mPaymentId,
          amountRands: rands(p.amountCents),
        });
        console.log(`[cron/reconcile-payments] healed ${p.mPaymentId} (+${CREDIT_PACKS[packId].credits} credits)`);
      } catch (err) {
        console.error("[cron/reconcile-payments] heal failed for", p.mPaymentId, err);
      }
    }

    // ── 2. Flag: started but never confirmed ────────────────────────────────
    const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60_000);
    const abandoned = await db.payment.findMany({
      where:   { status: "INITIATED", createdAt: { lt: cutoff }, alertedAt: null },
      include: { user: { select: { email: true } } },
      take:    50,
    });

    for (const p of abandoned) {
      stuck.push({
        reference:   p.mPaymentId,
        amountRands: rands(p.amountCents),
        ageMinutes:  Math.round((Date.now() - p.createdAt.getTime()) / 60_000),
        email:       p.user?.email ?? "(unknown)",
      });
    }

    if (abandoned.length) {
      // Mark as alerted + STALE so we report each payment only once.
      await db.payment.updateMany({
        where: { id: { in: abandoned.map((p) => p.id) } },
        data:  { status: "STALE", alertedAt: new Date() },
      });
    }

    // ── Report (only when there's something to say) ─────────────────────────
    if (healed.length || stuck.length) {
      await sendReconciliationReport({ healed, stuck });
    }

    console.log(`[cron/reconcile-payments] healed=${healed.length} flagged=${stuck.length}`);
    return NextResponse.json({ ok: true, healed: healed.length, flagged: stuck.length });
  } catch (err) {
    console.error("[cron/reconcile-payments] error:", err);
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}
