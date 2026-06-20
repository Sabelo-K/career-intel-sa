/**
 * GET /api/dashboard — real stats for the dashboard
 * Returns profile strength, employability score, activity counts, recent sessions
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isNewUserDiscountEligible, discountDaysRemaining } from "@/lib/payfast";

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
    const PROFILE_STEPS = [
      { key: "currentRole",    done: !!(p?.currentRole),                      label: "Current role",         href: "/profile#current-role"   },
      { key: "targetRole",     done: !!(p?.targetRole),                       label: "Target role",          href: "/profile#target-role"    },
      { key: "province",       done: !!(p?.province),                         label: "Province",             href: "/profile#province"       },
      { key: "skills",         done: (p?.skills?.length ?? 0) >= 3,           label: "At least 3 skills",    href: "/profile#skills"         },
      { key: "bio",            done: !!(p?.bio),                              label: "Short bio",            href: "/profile#bio"            },
      { key: "education",      done: !!(p?.educationLevel),                   label: "Education level",      href: "/profile#education"      },
      { key: "experience",     done: (p?.yearsExperience ?? -1) >= 0,         label: "Years of experience",  href: "/profile#experience"     },
      { key: "linkedin",       done: !!(p?.linkedinUrl),                      label: "LinkedIn URL",         href: "/profile#linkedin"       },
      { key: "industry",       done: !!(p?.industry),                         label: "Industry",             href: "/profile#industry"       },
      { key: "cv",             done: !!(dbUser.cvs?.length),                  label: "Upload your CV",       href: "/cv-builder"             },
    ];
    const profileStrength = Math.round((PROFILE_STEPS.filter((s) => s.done).length / PROFILE_STEPS.length) * 100);
    const profileMissing = PROFILE_STEPS.filter((s) => !s.done).map(({ label, href }) => ({ label, href }));

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
      // Individual score components (used by the employability breakdown bars)
      scoreComponents: {
        skills:   { score: skillsScore,   max: 40, pct: Math.round((skillsScore   / 40) * 100) },
        profile:  { score: profileScore,  max: 30, pct: Math.round((profileScore  / 30) * 100) },
        activity: { score: activityScore, max: 30, pct: Math.round((activityScore / 30) * 100) },
      },
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
      billingType: dbUser.billingType ?? "ONCE_OFF",
      onboarded: dbUser.onboarded,
      profileMissing,
      isNewUser: isNewUserDiscountEligible(dbUser.createdAt, dbUser.plan),
      daysLeftOnDiscount: discountDaysRemaining(dbUser.createdAt, dbUser.plan),
    });
  } catch (err) {
    console.error("Dashboard GET error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
