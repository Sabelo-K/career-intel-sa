/**
 * GET /api/credits/balance
 * Returns the current credit balance + recent transactions for the logged-in user.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where:  { clerkId: userId },
      select: {
        credits: true,
        creditTransactions: {
          orderBy: { createdAt: "desc" },
          take:    10,
          select:  { id: true, amount: true, description: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({
      balance:      dbUser?.credits ?? 0,
      transactions: dbUser?.creditTransactions ?? [],
    });
  } catch (err) {
    console.error("[credits/balance]", err);
    return NextResponse.json({ error: "Failed to load balance" }, { status: 500 });
  }
}
