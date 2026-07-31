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
<title>Continue to secure payment</title></head>
<body style="font-family:system-ui,sans-serif;background:#0b0b12;color:#e9e9f2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;gap:16px;text-align:center;padding:24px">
<p style="font-size:16px;font-weight:600;margin:0">You’re paying R${attr(pack.amountRands.toString())} for the ${attr(pack.name)}</p>
<p style="font-size:13px;color:#9b9fb0;margin:0;max-width:24rem">Click below to continue to PayFast’s secure checkout.</p>
<form id="pf" action="${attr(PAYFAST_URL)}" method="POST">
${inputs}
<button type="submit" style="background:#5b5bd6;color:#fff;border:0;border-radius:12px;padding:15px 32px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px -8px rgba(91,91,214,.6)">Continue to PayFast →</button>
</form>
<a href="/buy-credits" style="color:#8b9bff;font-size:13px;text-decoration:none">← Cancel</a>
<div id="diag" style="margin-top:14px;max-width:32rem;font-size:12px;line-height:1.5;color:#8a8f9e"></div>
<pre id="err" style="display:none;margin-top:8px;max-width:34rem;white-space:pre-wrap;word-break:break-word;background:#1a0f14;border:1px solid #7f1d1d;color:#fca5a5;border-radius:8px;padding:12px;font-size:12px;text-align:left"></pre>
<script>
  var f = document.getElementById('pf');
  var diag = document.getElementById('diag');
  var errBox = document.getElementById('err');
  function showErr(msg){ errBox.style.display='block'; errBox.textContent += msg + "\\n"; }

  // Report where we're posting so we can confirm the target.
  diag.textContent = 'Posting to: ' + f.action;

  // Capture ANY CSP violation and show it on-screen (no devtools needed).
  document.addEventListener('securitypolicyviolation', function(e){
    var pol = e.originalPolicy || '';
    var fa = (pol.split(';').filter(function(d){ return d.indexOf('form-action') !== -1; })[0] || '(no form-action directive found)').trim();
    showErr('BLOCKED BY CSP\\n  directive: ' + e.violatedDirective + '\\n  blocked:   ' + e.blockedURI + '\\n  enforced form-action: ' + fa);
  });
  // Surface any other JS error too.
  window.addEventListener('error', function(e){ showErr('JS error: ' + (e.message||e)); });

  // If we're still on this page 3s after load, the submit didn't navigate.
  setTimeout(function(){
    showErr('Still on the checkout page after 3s — the PayFast submission did not navigate. If no CSP line appears above, the POST was silently blocked by the browser/network.');
  }, 3000);

  // Try the auto-submit last, so listeners are already attached.
  try { f.submit(); } catch (e) { showErr('submit() threw: ' + (e && e.message)); }
</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[credits/checkout]", err);
    return errorPage("Something went wrong preparing your payment. Please try again or contact support.");
  }
}
