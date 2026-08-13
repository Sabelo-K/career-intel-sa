/**
 * GET /api/cron/daily-email — 08:00 UTC daily (Vercel cron #2 of 2)
 *
 * All scheduled outbound email, dispatched by SA calendar date:
 *   • job-alerts           — every day
 *   • weekly-digest        — Mondays only
 *   • data-refresh-reminder— 1st of Mar / Jun / Sep / Dec (quarterly)
 *
 * The Vercel Hobby plan allows only two cron jobs at daily granularity, so the
 * weekly and quarterly schedules are enforced here in code instead of by
 * separate cron entries. Day/month are evaluated in SAST so "Monday" and
 * "the 1st" mean what they mean in South Africa.
 */
import { NextRequest, NextResponse } from "next/server";
import { triggerCronRoute, isAuthorisedCron, sastToday } from "@/lib/cron-trigger";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

const QUARTER_MONTHS = [3, 6, 9, 12];

export async function GET(req: NextRequest) {
  if (!isAuthorisedCron(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const { dayOfWeek, dayOfMonth, month } = sastToday();
  const ran: Record<string, string> = {};

  // Daily
  ran["job-alerts"] = await triggerCronRoute(base, "/api/cron/job-alerts");

  // Mondays
  if (dayOfWeek === 1) {
    ran["weekly-digest"] = await triggerCronRoute(base, "/api/cron/weekly-digest");
  }

  // Quarterly — 1st of Mar/Jun/Sep/Dec
  if (dayOfMonth === 1 && QUARTER_MONTHS.includes(month)) {
    ran["data-refresh-reminder"] = await triggerCronRoute(base, "/api/cron/data-refresh-reminder");
  }

  console.log("[cron/daily-email]", { dayOfWeek, dayOfMonth, month, ran });
  return NextResponse.json({ ok: true, sastDate: { dayOfWeek, dayOfMonth, month }, ran });
}
