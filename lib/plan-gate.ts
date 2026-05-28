/**
 * Plan gating helpers used by API routes to enforce Free-tier limits.
 */

import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

// ── Limits ────────────────────────────────────────────────────────────────────

export const FREE_LIMITS = {
  chatMessages:       15,   // AI coach messages/month
  skillsGapAnalyses:  3,    // skills gap analyses/month
  careerSimulations:  1,    // career path simulations/month
} as const;

/** Graduate plan (R49) — paid but still has monthly caps */
export const GRADUATE_LIMITS = {
  chatMessages:       50,   // 50 AI coach messages/month
  skillsGapAnalyses:  Infinity,  // unlimited
  careerSimulations:  1,    // 1 career path simulation/month
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** First instant of the current calendar month (UTC midnight) */
export function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export interface EffectivePlan {
  plan:    Plan;
  planKey: string | null;
}

/**
 * Returns the user's effective plan, auto-expiring a paid plan that has
 * passed its `planExpiresAt` date back to FREE.
 */
export async function getEffectivePlan(dbUserId: string): Promise<EffectivePlan> {
  const user = await db.user.findUnique({
    where:  { id: dbUserId },
    select: { plan: true, planKey: true, planExpiresAt: true },
  });

  if (!user) return { plan: Plan.FREE, planKey: null };

  if (user.planExpiresAt && user.planExpiresAt < new Date()) {
    await db.user.update({
      where: { id: dbUserId },
      data:  { plan: Plan.FREE, planKey: null, planExpiresAt: null },
    }).catch(() => {});
    return { plan: Plan.FREE, planKey: null };
  }

  return { plan: user.plan, planKey: user.planKey };
}

/** True for any paying tier */
export function isPaid(plan: Plan): boolean {
  return plan === Plan.PREMIUM || plan === Plan.RECRUITER || plan === Plan.ENTERPRISE;
}

/**
 * Returns the monthly limits for a user based on their specific plan key.
 * Professional + Recruiter = unlimited (Infinity) for all features.
 * Graduate = capped per GRADUATE_LIMITS.
 */
export function getPlanLimits(planKey: string | null): { chatMessages: number; skillsGapAnalyses: number; careerSimulations: number } {
  if (planKey === "graduate") return GRADUATE_LIMITS;
  // professional, recruiter, enterprise → unlimited
  return { chatMessages: Infinity, skillsGapAnalyses: Infinity, careerSimulations: Infinity };
}

// ── Per-feature usage checks ──────────────────────────────────────────────────

/**
 * How many AI coach USER messages this user has sent this calendar month.
 * Counts ChatMessage rows with role=USER across all their sessions.
 */
export async function monthlyCoachMessages(dbUserId: string): Promise<number> {
  return db.chatMessage.count({
    where: {
      role:    "USER",
      session: { userId: dbUserId },
      createdAt: { gte: startOfCurrentMonth() },
    },
  });
}

/** Skills gap analyses run this month */
export async function monthlySkillsGaps(dbUserId: string): Promise<number> {
  return db.skillsGap.count({
    where: {
      userId:    dbUserId,
      createdAt: { gte: startOfCurrentMonth() },
    },
  });
}

/** Career path simulations run this month */
export async function monthlyCareerPaths(dbUserId: string): Promise<number> {
  return db.careerPath.count({
    where: {
      userId:    dbUserId,
      createdAt: { gte: startOfCurrentMonth() },
    },
  });
}
