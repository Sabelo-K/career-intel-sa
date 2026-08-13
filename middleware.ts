import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p/(.*)",               // public shareable profiles + score cards
  "/privacy",
  "/terms",
  "/salary-check",            // free viral tool — no auth
  "/matric",                  // free viral tool — no auth
  "/degree-roi",              // free viral tool — no auth
  "/graduate-programmes",     // free SA resource — no auth
  "/bursaries",               // free SA resource — no auth
  "/how-credits-work",        // public pricing/credits explainer — no auth
  "/subject-choice",          // free viral tool — subject choice guide, no auth
  "/r/(.*)",               // referral redirect — sets cookie then redirects to sign-up
  "/api/career/demand(.*)",
  "/api/payfast/notify",   // PayFast ITN webhook — unauthenticated POST from PayFast servers
  "/api/credits/itn",     // PayFast ITN for credit pack purchases — unauthenticated POST from PayFast servers
  "/api/cron/(.*)",        // Vercel cron jobs — protected by CRON_SECRET, not Clerk
  "/api/user/score/(.*)",  // public score card API

  // ── Crawler + social-scraper assets ──────────────────────────────────────
  // These are fetched by Google, WhatsApp, LinkedIn etc. with NO session, so
  // they must never be auth-gated. Next generates the image routes WITHOUT a
  // file extension, so the extension-based exclusions in `matcher` below don't
  // cover them — they have to be listed here explicitly.
  // Symptom when missing: shared links show a blank preview, the browser tab
  // has no favicon, and Google can't read the sitemap.
  "/sitemap.xml",
  "/robots.txt",
  "/icon(.*)",
  "/apple-icon(.*)",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
  "/(.*)/opengraph-image(.*)",   // per-route cards, e.g. /subject-choice/opengraph-image
  "/(.*)/twitter-image(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // `xml` and `txt` added so /sitemap.xml and /robots.txt bypass auth entirely.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
