/**
 * GET /api/cron/job-alerts
 *
 * Vercel Cron job — runs daily at 08:00 UTC (10:00 SAST).
 * Finds all active job alerts, queries Adzuna for jobs posted in the last
 * 24 hours, and emails users a digest for any alert that has new results.
 *
 * Protected by CRON_SECRET env var:
 *   Vercel automatically sends Authorization: Bearer <CRON_SECRET> for cron
 *   invocations. We verify it to block external callers.
 */

import { NextRequest, NextResponse } from "next/server";
import { db }                         from "@/lib/db";
import { searchAdzunaJobs, isAdzunaConfigured } from "@/lib/adzuna";
import { sendJobAlertDigest }          from "@/lib/email";

export const dynamic    = "force-dynamic";
export const maxDuration = 60; // Vercel Pro allows up to 300s; free tier 60s

const PROVINCE_DISPLAY: Record<string, string> = {
  GAUTENG:       "Gauteng",
  WESTERN_CAPE:  "Western Cape",
  KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE:  "Eastern Cape",
  FREE_STATE:    "Free State",
  LIMPOPO:       "Limpopo",
  MPUMALANGA:    "Mpumalanga",
  NORTH_WEST:    "North West",
  NORTHERN_CAPE: "Northern Cape",
};

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isAdzunaConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Adzuna not configured" });
  }

  // ── Load all active alerts with their owner's email ───────────────────────
  const alerts = await db.jobAlert.findMany({
    where:   { isActive: true },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (alerts.length === 0) {
    return NextResponse.json({ sent: 0, reason: "No active alerts" });
  }

  // ── Search Adzuna for each alert (jobs from last 24 hours only) ───────────
  let emailsSent = 0;
  const errors:  string[] = [];

  // Group alerts by userId so we send one consolidated email per user
  const byUser = new Map<string, typeof alerts>();
  for (const alert of alerts) {
    const list = byUser.get(alert.userId) ?? [];
    list.push(alert);
    byUser.set(alert.userId, list);
  }

  for (const [, userAlerts] of Array.from(byUser)) {
    const user = userAlerts[0].user;
    if (!user?.email) continue;

    // For each of this user's alerts, fetch new jobs from Adzuna
    const alertResults: {
      keywords: string[];
      province: string | null;
      jobs:     Awaited<ReturnType<typeof searchAdzunaJobs>>;
    }[] = [];

    for (const alert of userAlerts) {
      try {
        const jobs = await searchAdzunaJobs({
          keywords:          alert.keywords,
          province:          alert.province,
          minSalaryMonthly:  alert.minSalary,
          remote:            alert.remote,
          maxResults:        5,
          maxDaysOld:        1, // only jobs from the last 24 hours
        });
        if (jobs.length > 0) {
          alertResults.push({
            keywords: alert.keywords,
            province: alert.province,
            jobs,
          });
        }
      } catch (err) {
        errors.push(`alert ${alert.id}: ${err}`);
      }
    }

    if (alertResults.length === 0) continue; // no new jobs for this user today

    // Send one digest per user covering all their active alerts that have hits
    for (const result of alertResults) {
      try {
        await sendJobAlertDigest(user.email, {
          name:     user.name ?? "there",
          keywords: result.keywords,
          province: result.province
            ? (PROVINCE_DISPLAY[result.province] ?? result.province)
            : null,
          jobs:     result.jobs,
        });
        emailsSent++;
      } catch (err) {
        errors.push(`email to ${user.email}: ${err}`);
      }
    }
  }

  console.log(`[cron/job-alerts] Sent ${emailsSent} emails. Errors: ${errors.length}`);
  if (errors.length) console.error("[cron/job-alerts] errors:", errors);

  return NextResponse.json({ sent: emailsSent, errors: errors.length });
}
