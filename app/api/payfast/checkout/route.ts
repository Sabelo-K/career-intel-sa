import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db-helpers";
import {
  PAYFAST_URL,
  PAYFAST_MERCHANT_ID,
  PAYFAST_MERCHANT_KEY,
  generateSignature,
  PLANS,
  DISCOUNT_PLANS,
  isNewUserDiscountEligible,
  type PlanKey,
} from "@/lib/payfast";

export const runtime = "nodejs";

// Derive APP_URL from the request origin so the notify_url is always correct
// even when NEXT_PUBLIC_APP_URL hasn't been set in the hosting env vars.
function getAppUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:3000";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body    = await req.json();
    const planKey = body.plan as PlanKey;

    if (!planKey || !(planKey in PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const APP_URL = getAppUrl(req);
    console.log("[PayFast checkout] APP_URL:", APP_URL);

    const clerkUser = await currentUser();
    const dbUser    = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    // Apply new-user 50 % discount if eligible (server-side enforcement)
    const applyDiscount = isNewUserDiscountEligible(dbUser.createdAt, dbUser.plan);
    const plan = applyDiscount ? DISCOUNT_PLANS[planKey] : PLANS[planKey];
    console.log(`[PayFast checkout] planKey=${planKey} discount=${applyDiscount} amount=${plan.amount}`);

    // Build PayFast parameters IN ORDER (order matters for signature)
    const params: Record<string, string> = {
      merchant_id:      PAYFAST_MERCHANT_ID,
      merchant_key:     PAYFAST_MERCHANT_KEY,
      return_url:       `${APP_URL}/upgrade/success`,
      cancel_url:       `${APP_URL}/upgrade/cancel`,
      notify_url:       `${APP_URL}/api/payfast/notify`,
      name_first:       clerkUser?.firstName ?? "",
      name_last:        clerkUser?.lastName  ?? "",
      email_address:    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
      m_payment_id:     `${dbUser.id}-${planKey}-${Date.now()}`,
      amount:           plan.amount,
      item_name:        `CareerIntel SA ${plan.name} Plan${applyDiscount ? " — 50% Off" : ""}`,
      item_description: plan.description,
      custom_str1:      dbUser.id,                          // DB user ID — used in ITN to update plan
      custom_str2:      planKey,                            // Plan key  — used in ITN to pick dbPlan
      custom_str3:      applyDiscount ? "new_user_50pct" : "", // Discount tracking
    };

    params.signature = generateSignature(params);

    return NextResponse.json({ url: PAYFAST_URL, params });
  } catch (err) {
    console.error("PayFast checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
