/**
 * POST /api/credits/itn
 * PayFast Instant Transaction Notification for credit pack purchases.
 *
 * Security model (in order of strength):
 *   1. PayFast server-side postback validation — we ask PayFast "did you send
 *      this?". This is the authoritative check.
 *   2. Signature verification — proves the payload wasn't tampered with.
 *   3. Amount verification — the paid amount must match the pack's real price,
 *      so a forged/altered ITN can't buy an expensive pack for R1.
 *   4. Source IP — logged only, NOT enforced. PayFast sends from a rotating set
 *      of addresses; a hardcoded allow-list silently rejects genuine payments
 *      (this is exactly what swallowed a real purchase).
 *
 * Crediting is idempotent on pf_payment_id because PayFast retries an ITN
 * until it receives a 200.
 */
import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/credits";
import {
  verifyITNSignature,
  isValidPayFastIP,
  validateITNWithPayFast,
} from "@/lib/payfast";
import { type CreditPackId, CREDIT_PACKS } from "@/lib/credits";

export const runtime  = "nodejs";
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

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const pfId = params.pf_payment_id || params.m_payment_id || "";

    console.log("[credits/itn] received", {
      ip,
      pf_payment_id:  params.pf_payment_id,
      m_payment_id:   params.m_payment_id,
      payment_status: params.payment_status,
      amount_gross:   params.amount_gross,
      custom_str1:    params.custom_str1,
      custom_str2:    params.custom_str2,
      custom_str3:    params.custom_str3,
      ipWhitelisted:  isValidPayFastIP(ip),   // informational only
    });

    // ── Verification ────────────────────────────────────────────────────────
    const sigValid    = verifyITNSignature(params);
    const serverValid = await validateITNWithPayFast(params);

    if (!sigValid)    console.warn("[credits/itn] signature did not verify");
    if (!serverValid) console.warn("[credits/itn] PayFast server validation failed");

    // Require at least one strong proof of authenticity.
    if (!sigValid && !serverValid) {
      console.error("[credits/itn] REJECTED — neither signature nor PayFast validation passed");
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── Only act on completed credit payments ───────────────────────────────
    if (params.payment_status !== "COMPLETE") {
      console.log("[credits/itn] ignoring status:", params.payment_status);
      return new NextResponse("OK");   // 200 so PayFast stops retrying
    }

    if (params.custom_str3 !== "credits") {
      console.log("[credits/itn] not a credits payment:", params.custom_str3);
      return new NextResponse("OK");
    }

    const dbUserId = params.custom_str1;
    const packId   = params.custom_str2 as CreditPackId;

    if (!dbUserId || !packId || !(packId in CREDIT_PACKS)) {
      console.error("[credits/itn] missing/invalid fields:", { dbUserId, packId });
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── Amount must match the pack's real price (anti-tamper) ───────────────
    const expected = Number(CREDIT_PACKS[packId].amount);
    const paid     = Number(params.amount_gross ?? "0");
    if (!Number.isFinite(paid) || Math.abs(paid - expected) > 0.01) {
      console.error(`[credits/itn] REJECTED — amount mismatch: paid ${paid}, expected ${expected} for ${packId}`);
      return new NextResponse("INVALID", { status: 400 });
    }

    // ── Credit (idempotent on the PayFast payment id) ───────────────────────
    const credited = await addCredits(dbUserId, packId, pfId);

    console.log(
      credited
        ? `[credits/itn] user ${dbUserId} +${CREDIT_PACKS[packId].credits} credits (${packId}, ref ${pfId})`
        : `[credits/itn] duplicate ITN ignored for ref ${pfId}`
    );

    return new NextResponse("OK");
  } catch (err) {
    console.error("[credits/itn] Error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}
