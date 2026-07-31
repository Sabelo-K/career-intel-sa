/**
 * POST /api/admin/grant-credits
 * Manually credit a user — admin only. Used to recover a payment whose ITN
 * failed to land, without the user having to pay again.
 *
 * Body: { email: string; packId?: "starter"|"popular"|"value"; credits?: number; note?: string }
 * Supply either packId (credits the pack's amount) or an explicit credits number.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ── Admin guard ─────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: "Forbidden — admin not configured" }, { status: 403 });
    }
    const clerk       = await currentUser();
    const callerEmail = clerk?.primaryEmailAddress?.emailAddress ?? "";
    if (callerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Parse ───────────────────────────────────────────────────────────────
    const body = await req.json();
    const { email, packId, credits, note } = body as {
      email?: string; packId?: CreditPackId; credits?: number; note?: string;
    };

    const targetEmail = (email ?? callerEmail).toLowerCase().trim();

    let amount: number;
    let label:  string;

    if (packId) {
      if (!(packId in CREDIT_PACKS)) {
        return NextResponse.json({ error: `Unknown packId: ${packId}` }, { status: 400 });
      }
      amount = CREDIT_PACKS[packId].credits;
      label  = `${CREDIT_PACKS[packId].name} (recovered payment)`;
    } else if (typeof credits === "number" && Number.isFinite(credits) && credits !== 0) {
      amount = Math.trunc(credits);
      label  = "Manual credit adjustment";
    } else {
      return NextResponse.json({ error: "Provide packId or a non-zero credits number" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { email: targetEmail } });
    if (!target) {
      return NextResponse.json({ error: `No user found with email: ${targetEmail}` }, { status: 404 });
    }

    const [updated] = await db.$transaction([
      db.user.update({
        where:  { id: target.id },
        data:   { credits: { increment: amount } },
        select: { id: true, email: true, credits: true },
      }),
      db.creditTransaction.create({
        data: {
          userId:      target.id,
          amount,
          description: note ? `${label} — ${note}` : label,
          packId:      packId ?? null,
        },
      }),
    ]);

    console.log(`[admin/grant-credits] ${callerEmail} granted ${amount} credits to ${targetEmail}`);

    return NextResponse.json({
      success: true,
      user:    updated,
      granted: amount,
      message: `Granted ${amount} credits to ${targetEmail}. New balance: ${updated.credits}.`,
    });
  } catch (err) {
    console.error("[admin/grant-credits]", err);
    return NextResponse.json({ error: "Failed", detail: String(err) }, { status: 500 });
  }
}
