/**
 * GET /api/cron/expire-plans
 * Vercel Cron — runs daily at 01:00 UTC (03:00 SAST).
 * Sweeps any paid plan whose planExpiresAt has passed and resets it to FREE.
 *
 * Why: getEffectivePlan() only downgrades a plan when the user next loads the
 * dashboard or hits a gated feature. A user who never returns would stay
 * "PREMIUM/RECRUITER" in the DB indefinitely. This keeps plan state accurate
 * for reporting, emails, and "active paid users" counts.
 *
 * Protected by CRON_SECRET env var (Vercel sends Authorization: Bearer <secret>).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic    = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();

    // Find paid users whose plan has lapsed
    const expired = await db.user.findMany({
      where: {
        plan:          { not: "FREE" },
        planExpiresAt: { not: null, lt: now },
      },
      select: { id: true, email: true, plan: true, planKey: true, planExpiresAt: true },
    });

    if (expired.length === 0) {
      return NextResponse.json({ ok: true, expired: 0 });
    }

    const result = await db.user.updateMany({
      where: {
        plan:          { not: "FREE" },
        planExpiresAt: { not: null, lt: now },
      },
      data: { plan: "FREE", planKey: null, planExpiresAt: null },
    });

    console.log(
      `[cron/expire-plans] Reset ${result.count} expired plan(s) to FREE:`,
      expired.map((u) => `${u.email} (${u.planKey ?? u.plan})`).join(", ")
    );

    return NextResponse.json({ ok: true, expired: result.count });
  } catch (err) {
    console.error("[cron/expire-plans] Error:", err);
    return NextResponse.json({ error: "Sweep failed" }, { status: 500 });
  }
}
