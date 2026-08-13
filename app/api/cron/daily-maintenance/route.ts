/**
 * GET /api/cron/daily-maintenance — 01:00 UTC daily (Vercel cron #1 of 2)
 *
 * Database housekeeping. Fans out to the individual jobs so each keeps its own
 * timeout and stays independently callable for debugging:
 *   • expire-plans       — reset lapsed paid plans to FREE
 *   • reconcile-payments — self-heal confirmed-but-unfulfilled payments,
 *                          flag stuck ones and alert the owner
 *
 * NOTE: reconciliation previously ran every 15 minutes. The Vercel Hobby plan
 * caps cron jobs at two and at once-per-day, so it is now daily. That is still
 * within PayFast's ~24h ITN retry window, and the ITN path itself is fixed —
 * this is a safety net, not the primary mechanism.
 */
import { NextRequest, NextResponse } from "next/server";
import { triggerCronRoute, isAuthorisedCron } from "@/lib/cron-trigger";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!isAuthorisedCron(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const ran: Record<string, string> = {};
  ran["expire-plans"]       = await triggerCronRoute(base, "/api/cron/expire-plans");
  ran["reconcile-payments"] = await triggerCronRoute(base, "/api/cron/reconcile-payments");

  console.log("[cron/daily-maintenance]", ran);
  return NextResponse.json({ ok: true, ran });
}
