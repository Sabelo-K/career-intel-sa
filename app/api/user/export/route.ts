/**
 * GET /api/user/export
 * POPIA Section 23 — right of access.
 * Returns a downloadable JSON file containing all personal data held
 * about the authenticated user.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where:   { clerkId: userId },
      include: {
        profile:           true,
        cvs:               { select: { name: true, atsScore: true, recruiterScore: true, createdAt: true, updatedAt: true } },
        chatSessions:      {
          orderBy: { createdAt: "asc" },
          select:  {
            title:     true,
            createdAt: true,
            messages:  { select: { role: true, content: true, createdAt: true }, orderBy: { createdAt: "asc" } },
          },
        },
        skillsGaps:        { select: { targetRole: true, currentSkills: true, createdAt: true } },
        careerPaths:       { select: { title: true, currentRole: true, targetRole: true, timeframeYears: true, createdAt: true } },
        learningRoadmaps:  {
          select: {
            targetRole: true, totalMonths: true, matchPct: true, salaryImpact: true, createdAt: true,
            phases: { select: { phaseNumber: true, title: true, skills: true, weeks: true, completed: true } },
          },
        },
        jobAlerts:         { select: { keywords: true, province: true, minSalary: true, remote: true, isActive: true, createdAt: true } },
        creditTransactions: { select: { amount: true, description: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const exportData = {
      exportedAt:  new Date().toISOString(),
      exportNote:  "This file contains all personal data CareerIntel SA holds about you. Generated under POPIA Section 23 (Right of Access).",
      account: {
        email:     dbUser.email,
        name:      dbUser.name,
        plan:      dbUser.plan,
        planKey:   dbUser.planKey,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
      profile:           dbUser.profile,
      cvs:               dbUser.cvs,
      chatSessions:      dbUser.chatSessions,
      skillsGaps:        dbUser.skillsGaps,
      careerPaths:       dbUser.careerPaths,
      learningRoadmaps:  dbUser.learningRoadmaps,
      jobAlerts:         dbUser.jobAlerts,
      creditHistory:     dbUser.creditTransactions,
    };

    const filename = `careerintel-data-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type":        "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[user/export]", err);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
