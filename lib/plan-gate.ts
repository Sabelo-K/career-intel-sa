/**
 * Plan gating helpers used by API routes to enforce Free-tier limits.
 */

import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

// ── Limits ────────────────────────────────────────────────────────────────────

export const FREE_LIMITS = {
  /** Max AI coach messages (USER role) per calendar month */
  chatMessages:       15,
  /** Max skills gap analyses per calendar month */
  skillsGapAnalyses:  3,
  /** Max career path simulations per calendar month */
  careerSimulations:  1,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** First instant of the current calendar month (UTC midnight) */
export function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the user's effective plan, auto-expiring a paid plan that has
 * passed its `planExpiresAt` date back to FREE.
 */
export async function getEffectivePlan(dbUserId: string): Promise<Plan> {
  const user = await db.user.findUnique({
    where:  { id: dbUserId },
    select: { plan: true, planExpiresAt: true },
  });

  if (!user) return Plan.FREE;

  if (user.planExpiresAt && user.planExpiresAt < new Date()) {
    // Plan has lapsed — quietly reset
    await db.user.update({
      where: { id: dbUserId },
      data:  { plan: Plan.FREE, planExpiresAt: null },
    }).catch(() => {});
    return Plan.FREE;
  }

  return user.plan;
}

/** True for any paying tier */
export function isPaid(plan: Plan): boolean {
  return plan === Plan.PREMIUM || plan === Plan.RECRUITER || plan === Plan.ENTERPRISE;
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
