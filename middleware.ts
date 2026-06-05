import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p/(.*)",               // public shareable profiles + score cards
  "/privacy",
  "/terms",
  "/salary-check",         // free viral tool — no auth
  "/matric",               // free viral tool — no auth
  "/degree-roi",           // free viral tool — no auth
  "/api/career/demand(.*)",
  "/api/payfast/notify",   // PayFast ITN webhook — unauthenticated POST from PayFast servers
  "/api/cron/(.*)",        // Vercel cron jobs — protected by CRON_SECRET, not Clerk
  "/api/user/score/(.*)",  // public score card API
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
