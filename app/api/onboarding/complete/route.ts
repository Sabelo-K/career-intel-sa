/**
 * POST /api/onboarding/complete
 * Saves onboarding data (role, skills, target) and marks user as onboarded
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const Schema = z.object({
  currentRole:  z.string().min(1),
  targetRole:   z.string().min(1),
  skills:       z.array(z.string()).min(1),
  yearsExperience: z.number().min(0).max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("[onboarding/complete] userId:", userId);

    const body   = await req.json();
    const parsed = Schema.parse(body);

    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    console.log("[onboarding/complete] email:", email);

    const dbUser = await getOrCreateUser(userId, email, clerkUser?.fullName);
    console.log("[onboarding/complete] dbUser.id:", dbUser.id, "onboarded:", dbUser.onboarded);

    // Upsert profile with onboarding data
    await db.profile.upsert({
      where:  { userId: dbUser.id },
      update: {
        currentRole:     parsed.currentRole,
        targetRole:      parsed.targetRole,
        skills:          parsed.skills,
        yearsExperience: parsed.yearsExperience,
      },
      create: {
        userId:          dbUser.id,
        currentRole:     parsed.currentRole,
        targetRole:      parsed.targetRole,
        skills:          parsed.skills,
        yearsExperience: parsed.yearsExperience ?? 0,
      },
    });
    console.log("[onboarding/complete] profile upserted");

    // Mark user as onboarded
    await db.user.update({
      where: { id: dbUser.id },
      data:  { onboarded: true },
    });
    console.log("[onboarding/complete] onboarded=true set — done");

    // Fire welcome email (fire-and-forget — never block the response)
    if (email && clerkUser?.fullName) {
      sendWelcomeEmail(email, clerkUser.fullName).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    // Log the full error object so we can see what's failing in Vercel logs
    console.error("[onboarding/complete] FATAL ERROR:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({
      error: "Failed to save onboarding data",
      detail: (err as Error)?.message ?? "unknown",
    }, { status: 500 });
  }
}
