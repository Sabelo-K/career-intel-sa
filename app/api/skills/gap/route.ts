import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { analyzeSkillsGap } from "@/lib/ai/claude";
import { checkRateLimit, rateLimitResponse, ANALYSIS_LIMIT } from "@/lib/rate-limit";
import { getOrCreateUser } from "@/lib/db-helpers";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  getEffectivePlan,
  isPaid,
  monthlySkillsGaps,
  FREE_LIMITS,
} from "@/lib/plan-gate";
import { spendCredits } from "@/lib/credits";

const SkillsGapSchema = z.object({
  currentSkills:   z.array(z.string()).min(1),
  targetRole:      z.string().min(2),
  yearsExperience: z.number().min(0).max(50).default(0),
  education:       z.string().default("Not specified"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 10 analyses per hour per user
    const limited = rateLimitResponse(checkRateLimit({ key: `skills-gap:${userId}`, ...ANALYSIS_LIMIT }));
    if (limited) return limited;

    const body   = await req.json();
    const params = SkillsGapSchema.parse(body);

    // ── Plan gate ─────────────────────────────────────────────────────────────
    try {
      const clerkUserEarly = await currentUser();
      const dbUserEarly = await getOrCreateUser(
        userId,
        clerkUserEarly?.primaryEmailAddress?.emailAddress,
        clerkUserEarly?.fullName
      );
      const { plan } = await getEffectivePlan(dbUserEarly.id);
      // Graduate + Professional both get unlimited skills gap — only FREE is limited
      if (!isPaid(plan)) {
        const used = await monthlySkillsGaps(dbUserEarly.id);
        if (used >= FREE_LIMITS.skillsGapAnalyses) {
          // Try spending 3 credits before blocking
          const spent = await spendCredits(dbUserEarly.id, "skills-gap", "Skills Gap analysis");
          if (!spent) {
            return NextResponse.json(
              {
                error: `You have used all ${FREE_LIMITS.skillsGapAnalyses} free skills gap analyses this month. Buy credits (3 per analysis) or upgrade for unlimited access.`,
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

    // Run AI analysis
    const result = await analyzeSkillsGap(params);

    // Persist to DB (non-blocking — user gets response immediately)
    try {
      const clerkUser = await currentUser();
      const dbUser = await getOrCreateUser(
        userId,
        clerkUser?.primaryEmailAddress?.emailAddress,
        clerkUser?.fullName
      );

      await db.skillsGap.create({
        data: {
          userId:        dbUser.id,
          currentSkills: params.currentSkills,
          targetRole:    params.targetRole,
          missingSkills: (result.missingSkills ?? []) as never,
          learningPath:  (result.learningPath  ?? []) as never,
        },
      });
    } catch (dbErr) {
      // DB failure must not break the AI response
      console.error("Skills gap DB save error:", dbErr);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("Skills gap error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
