import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { simulateCareerPath } from "@/lib/ai/claude";
import { getOrCreateUser } from "@/lib/db-helpers";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  getEffectivePlan,
  isPaid,
  monthlyCareerPaths,
  FREE_LIMITS,
  getPlanLimits,
} from "@/lib/plan-gate";
import { spendCredits } from "@/lib/credits";

const CareerPathSchema = z.object({
  currentRole:    z.string().min(2),
  targetRole:     z.string().min(2),
  yearsExperience:z.number().min(0).max(50).default(0),
  currentSkills:  z.array(z.string()).default([]),
  province:       z.string().default("GAUTENG"),
  timeframeYears: z.number().min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const params = CareerPathSchema.parse(body);

    // ── Plan gate ─────────────────────────────────────────────────────────────
    try {
      const clerkUserEarly = await currentUser();
      const dbUserEarly = await getOrCreateUser(
        userId,
        clerkUserEarly?.primaryEmailAddress?.emailAddress,
        clerkUserEarly?.fullName
      );
      const { plan, planKey } = await getEffectivePlan(dbUserEarly.id);
      const limits = isPaid(plan) ? getPlanLimits(planKey) : FREE_LIMITS;
      if (!isPaid(plan) || planKey === "graduate") {
        const used = await monthlyCareerPaths(dbUserEarly.id);
        if (used >= limits.careerSimulations) {
          // Try spending 3 credits before blocking
          const spent = await spendCredits(dbUserEarly.id, "career-path", "Career Path simulation");
          if (!spent) {
            return NextResponse.json(
              {
                error: planKey === "graduate"
                  ? `Graduate plan includes ${limits.careerSimulations} career path simulation per month. Buy credits (3 per simulation) or upgrade to Professional for unlimited simulations.`
                  : `Free plan includes ${FREE_LIMITS.careerSimulations} career path simulation per month. Buy credits (3 per simulation) or upgrade for unlimited simulations.`,
                code:  "NO_CREDITS",
              },
              { status: 402 }
            );
          }
        }
      }
    } catch {
      // Gate check failure must never block the user
    }

    const simulation = await simulateCareerPath(params);

    // Persist result
    try {
      const clerkUser = await currentUser();
      const dbUser = await getOrCreateUser(
        userId,
        clerkUser?.primaryEmailAddress?.emailAddress,
        clerkUser?.fullName
      );

      await db.careerPath.create({
        data: {
          userId:          dbUser.id,
          title:           `${params.currentRole} → ${params.targetRole}`,
          currentRole:     params.currentRole,
          targetRole:      params.targetRole,
          timeframeYears:  params.timeframeYears,
          simulation:      simulation as never,
          salaryProjection:(simulation.salaryProjection ?? []) as never,
        },
      });
    } catch (dbErr) {
      console.error("Career path DB save error:", dbErr);
    }

    return NextResponse.json(simulation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("Career path error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
