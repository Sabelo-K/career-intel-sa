/**
 * POST /api/referral/claim
 * Called during onboarding completion when a ref_by cookie is present.
 * Rewards both the new user (referred) and the referrer with 7 bonus days.
 * Uses CreditTransactions for tracking — no schema change needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const BONUS_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Read referral code from cookie
    const cookieStore = await cookies();
    const referrerClerkId = cookieStore.get("ref_by")?.value;

    if (!referrerClerkId || referrerClerkId === userId) {
      // No referral or self-referral — silently skip
      return NextResponse.json({ claimed: false });
    }

    // Look up both users
    const [newUser, referrer] = await Promise.all([
      db.user.findUnique({ where: { clerkId: userId } }),
      db.user.findUnique({ where: { clerkId: referrerClerkId } }),
    ]);

    if (!newUser || !referrer) return NextResponse.json({ claimed: false });

    // Check new user hasn't already claimed a referral bonus (prevent double-claim)
    const alreadyClaimed = await db.creditTransaction.findFirst({
      where: { userId: newUser.id, packId: "referral_new_user" },
    });
    if (alreadyClaimed) return NextResponse.json({ claimed: false, reason: "already_claimed" });

    const now = new Date();

    // Helper: extend plan expiry by BONUS_DAYS
    function bonusExpiry(user: typeof newUser): Date {
      const base =
        user!.planExpiresAt && user!.planExpiresAt > now
          ? user!.planExpiresAt
          : now;
      const d = new Date(base);
      d.setDate(d.getDate() + BONUS_DAYS);
      return d;
    }

    // Apply bonuses atomically
    await db.$transaction([
      // New user: extend plan + record transaction
      db.user.update({
        where: { id: newUser.id },
        data:  { planExpiresAt: bonusExpiry(newUser) },
      }),
      db.creditTransaction.create({
        data: {
          userId:      newUser.id,
          amount:      0,
          description: `Referral bonus: ${BONUS_DAYS} free days from joining via a friend`,
          packId:      "referral_new_user",
        },
      }),

      // Referrer: extend plan + record transaction
      db.user.update({
        where: { id: referrer.id },
        data:  { planExpiresAt: bonusExpiry(referrer) },
      }),
      db.creditTransaction.create({
        data: {
          userId:      referrer.id,
          amount:      0,
          description: `Referral bonus: ${BONUS_DAYS} free days — a friend joined using your link`,
          packId:      "referral_referrer",
        },
      }),
    ]);

    // Clear the cookie
    cookieStore.delete("ref_by");

    return NextResponse.json({ claimed: true, bonusDays: BONUS_DAYS });
  } catch (err) {
    console.error("[referral/claim]", err);
    return NextResponse.json({ error: "Failed to claim referral" }, { status: 500 });
  }
}

// GET: return referral stats for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ referralCount: 0, link: "" });

    // Count how many people this user has referred (packId = "referral_referrer")
    const referralCount = await db.creditTransaction.count({
      where: { userId: dbUser.id, packId: "referral_referrer" },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://careerintelsa.co.za"}/r/${userId}`;

    return NextResponse.json({ referralCount, link });
  } catch (err) {
    console.error("[referral/claim GET]", err);
    return NextResponse.json({ referralCount: 0, link: "" }, { status: 500 });
  }
}
