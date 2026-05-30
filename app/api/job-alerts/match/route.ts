/**
 * GET /api/job-alerts/match
 *
 * Returns live Adzuna SA job listings that match the current user's
 * active job alerts. Results are grouped by alertId.
 *
 * If Adzuna credentials are not configured the endpoint returns
 * `{ configured: false, results: [] }` so the UI can show a "coming soon"
 * message instead of an error.
 */
import { auth }               from "@clerk/nextjs/server";
import { NextResponse }        from "next/server";
import { db }                  from "@/lib/db";
import { searchAdzunaJobs, isAdzunaConfigured, AdzunaJob } from "@/lib/adzuna";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdzunaConfigured()) {
    return NextResponse.json({ configured: false, results: [] });
  }

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ configured: true, results: [] });

  const alerts = await db.jobAlert.findMany({
    where:   { userId: dbUser.id, isActive: true },
    orderBy: { createdAt: "desc" },
    take:    5,
  });

  if (alerts.length === 0) {
    return NextResponse.json({ configured: true, results: [] });
  }

  // Fan out: search Adzuna for each active alert in parallel
  const settled = await Promise.allSettled(
    alerts.map(async (alert) => {
      const jobs = await searchAdzunaJobs({
        keywords:          alert.keywords,
        province:          alert.province,
        minSalaryMonthly:  alert.minSalary,
        remote:            alert.remote,
        maxResults:        5,
      });
      return { alertId: alert.id, jobs } satisfies { alertId: string; jobs: AdzunaJob[] };
    })
  );

  const results = settled
    .filter((r): r is PromiseFulfilledResult<{ alertId: string; jobs: AdzunaJob[] }> =>
      r.status === "fulfilled"
    )
    .map((r) => r.value);

  return NextResponse.json({ configured: true, results });
}
