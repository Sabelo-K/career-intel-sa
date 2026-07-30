/**
 * GET /api/credits/checkout?packId=starter|popular|value
 *
 * Server-driven PayFast redirect. The browser navigates here at the TOP LEVEL
 * (a full-page GET, not an in-app fetch), so this response is a fresh document
 * with the current CSP applied — avoiding the stale SPA-session CSP that was
 * silently blocking in-app form submissions to PayFast. Returns a minimal HTML
 * page that auto-posts a signed form to PayFast (with a visible fallback button).
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

export const runtime  = "nodejs";
export const dynamic  = "force-dynamic";

/** Escape a value for safe use inside an HTML double-quoted attribute. */
function attr(v: string): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function errorPage(message: string): NextResponse {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Payment error</title></head>
<body style="font-family:system-ui,sans-serif;background:#0b0b12;color:#e9e9f2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;gap:16px;text-align:center;padding:24px">
<p style="font-size:15px;max-width:34rem">${attr(message)}</p>
<a href="/buy-credits" style="color:#8b9bff;font-size:14px">← Back to Buy Credits</a>
</body></html>`;
  return new NextResponse(html, { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: NextRequest) {
  try {
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      return errorPage("Payment provider is not configured. Please contact support@careerintelsa.co.za.");
    }

    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

    const packId = req.nextUrl.searchParams.get("packId") as CreditPackId | null;
    if (!packId || !(packId in CREDIT_PACKS)) {
      return errorPage("That credit pack wasn’t recognised. Please go back and choose a pack.");
    }

    const pack      = CREDIT_PACKS[packId];
    const clerkUser = await currentUser();
    const dbUser    = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
      ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;

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
      custom_str1:      dbUser.id,
      custom_str2:      packId,
      custom_str3:      "credits",
    };
    params.signature = generateSignature(params);

    console.log(
      `[credits/checkout] packId=${packId} user=${dbUser.id} url=${PAYFAST_URL} ` +
      `passphraseSet=${Boolean(process.env.PAYFAST_PASSPHRASE)} sigLen=${params.signature.length}`
    );

    const inputs = Object.entries(params)
      .map(([k, v]) => `<input type="hidden" name="${attr(k)}" value="${attr(v)}"/>`)
      .join("");

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Redirecting to secure payment…</title></head>
<body style="font-family:system-ui,sans-serif;background:#0b0b12;color:#e9e9f2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;gap:20px;text-align:center;padding:24px">
<div style="width:34px;height:34px;border:3px solid rgba(255,255,255,.2);border-top-color:#8b9bff;border-radius:50%;animation:spin 1s linear infinite"></div>
<p style="font-size:15px">Taking you to PayFast’s secure checkout…</p>
<form id="pf" action="${attr(PAYFAST_URL)}" method="POST">
${inputs}
<button type="submit" style="margin-top:8px;background:#5b5bd6;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-size:14px;font-weight:600;cursor:pointer">Continue to PayFast</button>
</form>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script>setTimeout(function(){document.getElementById('pf').submit();},250);</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[credits/checkout]", err);
    return errorPage("Something went wrong preparing your payment. Please try again or contact support.");
  }
}
