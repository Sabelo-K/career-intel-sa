/**
 * GET /api/credits/balance
 * Returns the credit balance, recent transactions, AND the user's remaining
 * FREE monthly allowance.
 *
 * The allowance matters: credits are a top-up that only get consumed once the
 * free monthly quota is exhausted. Without showing that, a user who buys
 * credits sees the balance never move and assumes the platform is broken.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CREDIT_COSTS } from "@/lib/credits";
import {
  getEffectivePlan,
  getPlanLimits,
  isPaid,
  FREE_LIMITS,
  monthlyCoachMessages,
  monthlySkillsGaps,
  monthlyCareerPaths,
} from "@/lib/plan-gate";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where:  { clerkId: userId },
      select: {
        id: true,
        credits: true,
        creditTransactions: {
          orderBy: { createdAt: "desc" },
          take:    10,
          select:  { id: true, amount: true, description: true, createdAt: true },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ balance: 0, transactions: [], allowance: [], unlimited: false });
    }

    // ── Remaining free allowance this month ─────────────────────────────────
    let allowance: {
      key: string; label: string; used: number; limit: number | null;
      remaining: number | null; creditCost: number;
    }[] = [];
    let unlimited = false;
    let planKeyOut: string | null = null;

    try {
      const { plan, planKey } = await getEffectivePlan(dbUser.id);
      planKeyOut = planKey;
      const paid   = isPaid(plan);
      const limits = paid ? getPlanLimits(planKey) : FREE_LIMITS;

      // Professional / Recruiter get unlimited everything — credits are unused.
      unlimited = paid && planKey !== "graduate";

      if (!unlimited) {
        const [msgs, gaps, paths] = await Promise.all([
          monthlyCoachMessages(dbUser.id),
          monthlySkillsGaps(dbUser.id),
          monthlyCareerPaths(dbUser.id),
        ]);

        // Infinity isn't JSON-serialisable → null means "unlimited"
        const norm = (n: number) => (Number.isFinite(n) ? n : null);
        const remain = (used: number, limit: number) =>
          Number.isFinite(limit) ? Math.max(0, limit - used) : null;

        allowance = [
          {
            key: "chat", label: "AI Coach messages",
            used: msgs, limit: norm(limits.chatMessages),
            remaining: remain(msgs, limits.chatMessages),
            creditCost: CREDIT_COSTS["chat-message"],
          },
          {
            key: "skills", label: "Skills Gap analyses",
            used: gaps, limit: norm(limits.skillsGapAnalyses),
            remaining: remain(gaps, limits.skillsGapAnalyses),
            creditCost: CREDIT_COSTS["skills-gap"],
          },
          {
            key: "paths", label: "Career Path simulations",
            used: paths, limit: norm(limits.careerSimulations),
            remaining: remain(paths, limits.careerSimulations),
            creditCost: CREDIT_COSTS["career-path"],
          },
        ];
      }
    } catch (err) {
      console.error("[credits/balance] allowance lookup failed (non-fatal):", err);
    }

    return NextResponse.json({
      balance:      dbUser.credits ?? 0,
      transactions: dbUser.creditTransactions ?? [],
      allowance,
      unlimited,
      planKey: planKeyOut,
    });
  } catch (err) {
    console.error("[credits/balance]", err);
    return NextResponse.json({ error: "Failed to load balance" }, { status: 500 });
  }
}
