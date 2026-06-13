/**
 * GET /api/cron/data-refresh-reminder
 * Vercel Cron — runs on the 1st of March, June, September, December at 07:00 UTC (09:00 SAST).
 * Sends a quarterly data refresh reminder email to the owner.
 * Protected by CRON_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import { sendDataRefreshReminder } from "@/lib/email";
import { SA_CAREERS } from "@/lib/data/sa-careers";

export const dynamic     = "force-dynamic";
export const maxDuration = 30;

function getQuarterLabel(): { quarter: string; dueDate: string } {
  const now   = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const year  = now.getFullYear();

  if (month === 3)  return { quarter: `Q1 ${year}`,    dueDate: `1 March ${year}`     };
  if (month === 6)  return { quarter: `Q2 ${year}`,    dueDate: `1 June ${year}`      };
  if (month === 9)  return { quarter: `Q3 ${year}`,    dueDate: `1 September ${year}` };
  if (month === 12) return { quarter: `Q4 ${year}`,    dueDate: `1 December ${year}`  };

  // Fallback (shouldn't happen given the schedule)
  return { quarter: `Q ${year}`, dueDate: `${now.toDateString()}` };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quarter, dueDate } = getQuarterLabel();

  // Count unique sectors
  const sectors = new Set(SA_CAREERS.map(c => c.sector)).size;

  await sendDataRefreshReminder({
    quarter,
    dueDate,
    careerCount: SA_CAREERS.length,
    sectorCount: sectors,
    lastUpdated: "May 2026",
  });

  console.log(`[cron/data-refresh-reminder] Sent ${quarter} reminder`);
  return NextResponse.json({ sent: true, quarter });
}
