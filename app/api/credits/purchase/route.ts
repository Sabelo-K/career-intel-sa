/**
 * POST /api/credits/purchase
 * Builds a PayFast one-off payment URL for a credit pack.
 * Body: { packId: "starter" | "popular" | "value" }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db-helpers";
import {
  PAYFAST_URL,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  generateSignature,
} from "@/lib/payfast";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    // Validate required PayFast env vars early
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      console.error("[credits/purchase] Missing PAYFAST_MERCHANT_ID or PAYFAST_MERCHANT_KEY env vars");
      return NextResponse.json({ error: "Payment provider not configured. Please contact support." }, { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const packId = body.packId as CreditPackId;

    if (!packId || !(packId in CREDIT_PACKS)) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const pack      = CREDIT_PACKS[packId];
    const clerkUser = await currentUser();
    const dbUser    = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

    // Build PayFast params IN ORDER (signature is order-sensitive)
    const params: Record<string, string> = {
      merchant_id:      PAYFAST_MERCHANT_ID,
      merchant_key:     PAYFAST_MERCHANT_KEY,
      return_url:       `${appUrl}/buy-credits/success`,
      cancel_url:       `${appUrl}/buy-credits`,
      notify_url:       `${appUrl}/api/credits/itn`,
      name_first:       clerkUser?.firstName ?? "",
      name_last:        clerkUser?.lastName  ?? "",
      email_address:    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
      m_payment_id:     `credits-${dbUser.id}-${packId}-${Date.now()}`,
      amount:           pack.amount,
      item_name:        `CareerIntel SA ${pack.name}`,
      item_description: pack.description,
      custom_str1:      dbUser.id,  // DB user ID — used in ITN to add credits
      custom_str2:      packId,     // Pack ID   — used in ITN to know how many to add
      custom_str3:      "credits",  // Payment type flag — differentiates from plan payments
    };

    params.signature = generateSignature(params);

    console.log(`[credits/purchase] packId=${packId} user=${dbUser.id} url=${PAYFAST_URL}`);
    return NextResponse.json({ url: PAYFAST_URL, params });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[credits/purchase] Error:", message);
    return NextResponse.json({ error: `Purchase failed: ${message}` }, { status: 500 });
  }
}
