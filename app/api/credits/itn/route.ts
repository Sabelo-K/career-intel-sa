/**
 * POST /api/credits/itn
 * PayFast Instant Transaction Notification for credit pack purchases.
 * Follows the same validation steps as /api/payfast/notify.
 */
import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/credits";
import {
  verifyITNSignature,
  isValidPayFastIP,
  validateITNWithPayFast,
} from "@/lib/payfast";
import { type CreditPackId, CREDIT_PACKS } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic  = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();

    // Parse form-encoded body
    const params: Record<string, string> = {};
    for (const pair of text.split("&")) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const val = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, " "));
      params[key] = val;
    }

    // 1. IP check
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    const ip        = forwarded.split(",")[0].trim();
    if (!isValidPayFastIP(ip)) {
      console.error("[credits/itn] Invalid IP:", ip);
      return new NextResponse("INVALID", { status: 400 });
    }

    // 2. Signature check
    if (!verifyITNSignature(params)) {
      console.error("[credits/itn] Signature mismatch");
      return new NextResponse("INVALID", { status: 400 });
    }

    // 3. PayFast server-side validation
    const isValid = await validateITNWithPayFast(params);
    if (!isValid) {
      console.error("[credits/itn] PayFast validation failed");
      return new NextResponse("INVALID", { status: 400 });
    }

    // 4. Only act on COMPLETE payments
    if (params.payment_status !== "COMPLETE") {
      console.log("[credits/itn] Ignoring status:", params.payment_status);
      return new NextResponse("OK");
    }

    // 5. Safety check: must be a credits payment
    if (params.custom_str3 !== "credits") {
      console.error("[credits/itn] Not a credits payment:", params.custom_str3);
      return new NextResponse("INVALID", { status: 400 });
    }

    const dbUserId = params.custom_str1;
    const packId   = params.custom_str2 as CreditPackId;

    if (!dbUserId || !packId || !(packId in CREDIT_PACKS)) {
      console.error("[credits/itn] Missing or invalid fields:", { dbUserId, packId });
      return new NextResponse("INVALID", { status: 400 });
    }

    await addCredits(dbUserId, packId);

    console.log(
      `[credits/itn] User ${dbUserId} purchased ${packId} (+${CREDIT_PACKS[packId].credits} credits)`
    );

    return new NextResponse("OK");
  } catch (err) {
    console.error("[credits/itn] Error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}
