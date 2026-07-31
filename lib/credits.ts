/**
 * Credits system — pay-as-you-go top-ups for Free plan users.
 *
 * Credit packs are one-time PayFast payments.
 * Credits are deducted per feature use after the monthly free allocation runs out.
 */

import { db } from "@/lib/db";

// ── Credit packs ──────────────────────────────────────────────────────────────

export const CREDIT_PACKS = {
  starter: {
    id:          "starter",
    name:        "Starter Pack",
    credits:     15,
    amountRands: 20,
    amount:      "20.00",
    description: "15 credits — great for trying premium features",
    popular:     false,
  },
  popular: {
    id:          "popular",
    name:        "Popular Pack",
    credits:     30,
    amountRands: 35,
    amount:      "35.00",
    description: "30 credits — most popular choice",
    popular:     true,
  },
  value: {
    id:          "value",
    name:        "Value Pack",
    credits:     60,
    amountRands: 60,
    amount:      "60.00",
    description: "60 credits — best value per credit",
    popular:     false,
  },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;

// ── Credit costs per feature ──────────────────────────────────────────────────

export const CREDIT_COSTS = {
  "chat-message":       1,   // 1 credit per AI coach message
  "skills-gap":         3,   // 3 credits per skills gap analysis
  "career-path":        3,   // 3 credits per career path simulation
} as const;

export type CreditFeature = keyof typeof CREDIT_COSTS;

// ── Database helpers ──────────────────────────────────────────────────────────

/** Get the current credit balance for a user. */
export async function getUserCredits(dbUserId: string): Promise<number> {
  const user = await db.user.findUnique({
    where:  { id: dbUserId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/**
 * Check if the user has enough credits for a feature, then atomically deduct them.
 * Returns `true` if credits were deducted successfully, `false` if not enough.
 */
export async function spendCredits(
  dbUserId:    string,
  feature:     CreditFeature,
  description: string
): Promise<boolean> {
  const cost    = CREDIT_COSTS[feature];
  const balance = await getUserCredits(dbUserId);

  if (balance < cost) return false;

  // Atomic decrement + transaction log in a Prisma $transaction
  await db.$transaction([
    db.user.update({
      where: { id: dbUserId },
      data:  { credits: { decrement: cost } },
    }),
    db.creditTransaction.create({
      data: {
        userId:      dbUserId,
        amount:      -cost,
        description,
      },
    }),
  ]);

  return true;
}

/**
 * Add credits to a user's balance (called after a successful PayFast payment).
 *
 * `reference` should be the PayFast payment id (pf_payment_id / m_payment_id).
 * When supplied, crediting is IDEMPOTENT: PayFast retries an ITN until it gets
 * a 200, so without this a single purchase could be credited several times.
 *
 * Returns true if credits were added, false if this reference was already applied.
 */
export async function addCredits(
  dbUserId:    string,
  packId:      CreditPackId,
  reference?:  string,
): Promise<boolean> {
  const pack = CREDIT_PACKS[packId];
  const ref  = reference?.trim();

  if (ref) {
    const already = await db.creditTransaction.findFirst({
      where: { userId: dbUserId, description: { contains: ref } },
      select: { id: true },
    });
    if (already) return false;   // already credited — ignore the retry
  }

  const description =
    `Purchased ${pack.name} (R${pack.amountRands})` + (ref ? ` [ref:${ref}]` : "");

  await db.$transaction([
    db.user.update({
      where: { id: dbUserId },
      data:  { credits: { increment: pack.credits } },
    }),
    db.creditTransaction.create({
      data: { userId: dbUserId, amount: pack.credits, description, packId },
    }),
  ]);

  return true;
}
