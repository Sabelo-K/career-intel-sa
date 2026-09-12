/**
 * GET /api/user/public/[userId]
 * Returns a user's public profile — no auth required.
 * Only exposes fields the user has opted to make visible.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PROVINCE_DISPLAY: Record<string, string> = {
  GAUTENG: "Gauteng", WESTERN_CAPE: "Western Cape", KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE: "Eastern Cape", FREE_STATE: "Free State", LIMPOPO: "Limpopo",
  MPUMALANGA: "Mpumalanga", NORTH_WEST: "North West", NORTHERN_CAPE: "Northern Cape",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const dbUser = await db.user.findUnique({
      where:   { clerkId: userId },
      include: { profile: true },
    });

    if (!dbUser || !dbUser.profile?.recruiterVisible) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const p = dbUser.profile;

    // Build a public-safe profile
    const publicProfile = {
      name:        dbUser.name ?? "CareerIntel SA Member",
      currentRole: p?.currentRole ?? null,
      targetRole:  p?.targetRole  ?? null,
      province:    p?.province    ? (PROVINCE_DISPLAY[p.province] ?? p.province) : null,
      industry:    p?.industry    ?? null,
      skills:      p?.skills      ?? [],
      bio:         p?.bio         ?? null,
      educationLevel: p?.educationLevel ?? null,
      yearsExperience: p?.yearsExperience ?? null,
      linkedinUrl:     p?.linkedinUrl ?? null,
      githubUrl:       p?.githubUrl   ?? null,
      portfolioUrl:    p?.portfolioUrl ?? null,
      isOpenToWork:    p?.isOpenToWork ?? false,
      joinedYear:      new Date(dbUser.createdAt).getFullYear(),
    };

    return NextResponse.json({ profile: publicProfile }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("[user/public GET]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
