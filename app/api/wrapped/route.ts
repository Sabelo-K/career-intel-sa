/**
 * GET /api/wrapped
 * Returns the current user's CareerIntel Wrapped stats for display.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile:      true,
        chatSessions: {
          include: { messages: { where: { role: "USER" } } },
          orderBy: { createdAt: "asc" },
        },
        skillsGaps:   { orderBy: { createdAt: "asc" } },
        careerPaths:  { orderBy: { createdAt: "asc" } },
        cvs:          { where: { isActive: true }, take: 1 },
        jobAlerts:    true,
      },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Total AI coach messages this year
    const totalMessages = dbUser.chatSessions.reduce(
      (sum, s) => sum + s.messages.filter(m => new Date(m.createdAt) >= yearStart).length,
      0
    );

    // Skills gap analyses this year
    const skillsGapRuns = dbUser.skillsGaps.filter(g => new Date(g.createdAt) >= yearStart).length;

    // Career simulations this year
    const careerSimRuns = dbUser.careerPaths.filter(c => new Date(c.createdAt) >= yearStart).length;

    // Most explored career (from skills gap targets)
    const careerTargets = dbUser.skillsGaps
      .filter(g => new Date(g.createdAt) >= yearStart)
      .map(g => (g.result as any)?.targetRole ?? null)
      .filter(Boolean) as string[];
    const careerFreq: Record<string, number> = {};
    careerTargets.forEach(c => { careerFreq[c] = (careerFreq[c] ?? 0) + 1; });
    const topCareer = Object.entries(careerFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // ATS score from CV
    const atsScore = (dbUser.cvs[0] as any)?.atsScore ?? null;

    // Active job alerts
    const activeAlerts = dbUser.jobAlerts.filter(a => a.isActive).length;

    // Employability score (from profile if stored, else 0)
    const employabilityScore = (dbUser as any).employabilityScore ?? null;

    // Account created
    const memberSince = dbUser.createdAt;
    const daysActive = Math.round((now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24));

    // Sessions count
    const sessionsThisYear = dbUser.chatSessions.filter(s => new Date(s.createdAt) >= yearStart).length;

    return NextResponse.json({
      year: now.getFullYear(),
      name: dbUser.name ?? "there",
      totalMessages,
      skillsGapRuns,
      careerSimRuns,
      topCareer,
      atsScore,
      activeAlerts,
      employabilityScore,
      daysActive,
      sessionsThisYear,
      hasCV: dbUser.cvs.length > 0,
    });
  } catch (err) {
    console.error("[api/wrapped]", err);
    return NextResponse.json({ error: "Failed to load wrapped data" }, { status: 500 });
  }
}
