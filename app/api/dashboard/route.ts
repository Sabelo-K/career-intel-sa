/**
 * GET /api/dashboard — real stats for the dashboard
 * Returns profile strength, employability score, activity counts, recent sessions
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
        chatSessions: { orderBy: { updatedAt: "desc" }, take: 5, include: { messages: { take: 1, orderBy: { createdAt: "desc" } } } },
        skillsGaps: { orderBy: { createdAt: "desc" }, take: 3 },
        careerPaths: { orderBy: { createdAt: "desc" }, take: 3 },
        cvs: { orderBy: { updatedAt: "desc" }, take: 1 },
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        employabilityScore: 0,
        profileStrength: 0,
        skillsCount: 0,
        chatSessionsCount: 0,
        skillsGapCount: 0,
        careerPathCount: 0,
        hasCV: false,
        recentSessions: [],
        recentSkillsGaps: [],
        plan: "FREE",
        onboarded: false,
      });
    }

    const p = dbUser.profile;

    // ── Profile strength (0–100) ──────────────────────────────────────────────
    const checks = [
      !!(p?.currentRole),
      !!(p?.targetRole),
      !!(p?.province),
      (p?.skills?.length ?? 0) >= 3,
      !!(p?.bio),
      !!(p?.educationLevel),
      (p?.yearsExperience ?? -1) >= 0,
      !!(p?.linkedinUrl),
      !!(p?.industry),
      !!(dbUser.cvs?.length),
    ];
    const profileStrength = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    // ── Employability score (weighted) ────────────────────────────────────────
    const skillsScore   = Math.min((p?.skills?.length ?? 0) * 5, 40);   // up to 40 pts
    const profileScore  = Math.round(profileStrength * 0.3);              // up to 30 pts
    const activityScore = Math.min(
      (dbUser.chatSessions?.length ?? 0) * 3 +
      (dbUser.skillsGaps?.length ?? 0) * 5 +
      (dbUser.careerPaths?.length ?? 0) * 5,
      30
    );
    const employabilityScore = Math.min(skillsScore + profileScore + activityScore, 100);

    // ── Recent chat sessions ──────────────────────────────────────────────────
    const recentSessions = dbUser.chatSessions.map((s) => ({
      id: s.id,
      title: s.title ?? "New conversation",
      lastMessage: s.messages[0]?.content?.slice(0, 80) ?? "",
      updatedAt: s.updatedAt,
    }));

    // ── Recent skills gaps ────────────────────────────────────────────────────
    const recentSkillsGaps = dbUser.skillsGaps.map((sg) => ({
      id: sg.id,
      targetRole: sg.targetRole,
      createdAt: sg.createdAt,
    }));

    return NextResponse.json({
      employabilityScore,
      profileStrength,
      skillsCount: p?.skills?.length ?? 0,
      targetRole: p?.targetRole ?? null,
      currentRole: p?.currentRole ?? null,
      chatSessionsCount: dbUser.chatSessions.length,
      skillsGapCount: dbUser.skillsGaps.length,
      careerPathCount: dbUser.careerPaths.length,
      hasCV: (dbUser.cvs?.length ?? 0) > 0,
      recentSessions,
      recentSkillsGaps,
      plan: dbUser.plan,
      planKey: dbUser.planKey ?? null,
      planExpiresAt: dbUser.planExpiresAt ?? null,
      onboarded: dbUser.onboarded,
    });
  } catch (err) {
    console.error("Dashboard GET error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
