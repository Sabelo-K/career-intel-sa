/**
 * GET /api/user/score/[userId]
 * Public endpoint — returns employability score + top career for shareable card.
 * Only returns data if user has recruiterVisible = true in their profile.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const dbUser = await db.user.findUnique({
      where:   { clerkId: (await params).userId },
      include: { profile: true, skillsGaps: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!dbUser || !dbUser.profile?.recruiterVisible) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Respect privacy: if recruiterVisible is false, return minimal data
    const isVisible = dbUser.profile?.recruiterVisible === true;

    const topCareer = (() => {
      const sg = dbUser.skillsGaps[0];
      if (!sg) return null;
      return sg.targetRole ?? null;
    })();

    const score = dbUser.profile?.employabilityScore ?? null;

    return NextResponse.json({
      name:         isVisible ? (dbUser.name ?? "CareerIntel SA User") : "Anonymous",
      score,
      topCareer:    isVisible ? topCareer : null,
      currentRole:  isVisible ? ((dbUser.profile as any)?.currentRole ?? null) : null,
      province:     isVisible ? ((dbUser.profile as any)?.province ?? null) : null,
      joinedYear:   new Date(dbUser.createdAt).getFullYear(),
    });
  } catch (err) {
    console.error("[api/user/score]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
