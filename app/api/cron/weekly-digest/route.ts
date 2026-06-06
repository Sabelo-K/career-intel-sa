/**
 * GET /api/cron/weekly-digest
 * Vercel Cron — runs every Monday at 08:00 UTC (10:00 SAST).
 * Sends a weekly SA career digest to all onboarded users.
 * Protected by CRON_SECRET env var.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWeeklyDigest } from "@/lib/email";
import { SA_CAREERS } from "@/lib/data/sa-careers";

export const dynamic    = "force-dynamic";
export const maxDuration = 60;

// Rotate weekly tips and salary insights so every email feels fresh
const SALARY_INSIGHTS: string[] = [
  "Software Engineers in Gauteng earn 8% more than the national average. If you're in another province, negotiating a remote arrangement with a Gauteng-based employer is one of the fastest ways to close the gap.",
  "CA(SA) holders remain the highest-earning non-medical professionals in SA, with senior partners at Big 4 firms earning R200k–R500k/month. The 5-year qualification investment has one of the best ROIs in the country.",
  "Data Scientists with cloud certification (AWS/Azure) earn 15–22% more than those without. A 3-month cloud cert can add R8k–R15k to your monthly package.",
  "Electricians and plumbers in SA can earn R25k–R60k/month — often more than BCom graduates. Trade careers are severely undersupplied and highly recession-resistant.",
  "Bilingual professionals (English + Zulu, Xhosa, or Afrikaans) command a 10–18% premium in customer-facing, legal, and government sector roles.",
  "Cybersecurity specialists are the fastest-growing salary bracket in SA tech — demand has outstripped supply by 3:1, pushing average packages up 34% in the last 2 years.",
];

const CAREER_TIPS: string[] = [
  "Update your LinkedIn profile this week. 72% of SA recruiters check LinkedIn before making contact. Make sure your headline includes your target role and province.",
  "Run a Skills Gap Analysis on CareerIntel SA against your target role. Users who complete a gap analysis are 3x more likely to get an interview within 90 days.",
  "Ask for a salary review if it's been over 12 months. With SA CPI running above 5%, staying silent costs you real purchasing power every month you wait.",
  "Add quantified achievements to your CV. Instead of 'managed a team', write 'led a 6-person team that delivered a R2.4M project 3 weeks ahead of schedule'.",
  "Set up a job alert on CareerIntel SA for your target role. Job alerts users apply 40% faster than those who rely on manual searches — speed matters.",
  "Practice one interview question this week using the Voice Mock Interview feature. The STAR method (Situation, Task, Action, Result) works for 80% of SA behavioural questions.",
  "Research the B-BBEE EE demand in your target sector. If you're from a designated group, understanding which sectors are under pressure to transform gives you real negotiating leverage.",
];

function getWeeklyIndex(): number {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const weekNumber  = Math.floor((Date.now() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return weekNumber;
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pick this week's content by rotating through arrays
  const weekIdx       = getWeeklyIndex();
  const salaryInsight = SALARY_INSIGHTS[weekIdx % SALARY_INSIGHTS.length];
  const careerTip     = CAREER_TIPS[weekIdx % CAREER_TIPS.length];

  // Top 3 careers by demand score (rotated so users see different ones each week)
  const offset    = (weekIdx * 3) % SA_CAREERS.length;
  const topCareers = [...SA_CAREERS]
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(offset % 10, (offset % 10) + 3)  // rotate within top 10
    .map(c => ({
      title:       c.title,
      sector:      c.sector,
      demandScore: c.demandScore,
      avgSalary:   c.avgSalaryZar,
    }));

  // Fetch all onboarded users with email
  const users = await db.user.findMany({
    where: { onboarded: true, email: { not: "" } },
    select: { email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  let sent   = 0;
  let errors = 0;

  for (const user of users) {
    try {
      await sendWeeklyDigest(user.email, {
        name:          user.name ?? "there",
        topCareers,
        salaryInsight,
        careerTip,
      });
      sent++;
      // Small delay to stay within Resend rate limits (3,000/month free = ~700/week)
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.error(`[cron/weekly-digest] failed for ${user.email}:`, err);
      errors++;
    }
  }

  console.log(`[cron/weekly-digest] Sent ${sent} digests. Errors: ${errors}`);
  return NextResponse.json({ sent, errors });
}
