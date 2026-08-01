/**
 * Payment attempt tracking.
 *
 * Every checkout writes an INITIATED row BEFORE the user leaves for PayFast.
 * The ITN then marks it COMPLETE and fulfilled. This gives us:
 *   - detection of lost/failed ITNs (an INITIATED row that never completed)
 *   - self-healing (a COMPLETE row that was never fulfilled can be retried)
 *   - an exact, auditable revenue record
 *
 * All failures here are swallowed — tracking must NEVER block a real payment.
 */
import { db } from "@/lib/db";

export type PaymentType = "credits" | "plan";

/** Record a payment attempt as the user is sent to PayFast. */
export async function recordPaymentIntent(opts: {
  userId:      string;
  mPaymentId:  string;
  type:        PaymentType;
  amountRands: number | string;
  packId?:     string;
  planKey?:    string;
}): Promise<void> {
  try {
    const amountCents = Math.round(Number(opts.amountRands) * 100);
    await db.payment.create({
      data: {
        userId:      opts.userId,
        mPaymentId:  opts.mPaymentId,
        type:        opts.type,
        packId:      opts.packId ?? null,
        planKey:     opts.planKey ?? null,
        amountCents: Number.isFinite(amountCents) ? amountCents : 0,
        status:      "INITIATED",
      },
    });
  } catch (err) {
    console.error("[payments] failed to record intent (non-fatal):", err);
  }
}

/** Mark a payment completed + fulfilled after a verified ITN. */
export async function markPaymentComplete(opts: {
  mPaymentId:  string;
  pfPaymentId?: string;
  fulfilled:   boolean;
}): Promise<void> {
  try {
    await db.payment.updateMany({
      where: { mPaymentId: opts.mPaymentId },
      data: {
        status:      "COMPLETE",
        pfPaymentId: opts.pfPaymentId ?? null,
        fulfilled:   opts.fulfilled,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[payments] failed to mark complete (non-fatal):", err);
  }
}

/** Record a non-successful outcome (cancelled, failed, rejected ITN). */
export async function markPaymentFailed(opts: {
  mPaymentId: string;
  status:     "FAILED" | "CANCELLED";
  reason?:    string;
}): Promise<void> {
  try {
    await db.payment.updateMany({
      where: { mPaymentId: opts.mPaymentId },
      data:  { status: opts.status, failureReason: opts.reason ?? null },
    });
  } catch (err) {
    console.error("[payments] failed to mark failed (non-fatal):", err);
  }
}

export const rands = (cents: number): number => Math.round(cents) / 100;
