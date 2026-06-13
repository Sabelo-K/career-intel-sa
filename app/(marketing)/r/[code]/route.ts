/**
 * GET /r/[code] — Referral redirect Route Handler
 *
 * Sets a ref_by cookie then redirects to /sign-up.
 * MUST be a Route Handler (not a Server Component page) because
 * cookies().set() is only allowed in Route Handlers and Server Actions.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  // Build redirect response to /sign-up
  const response = NextResponse.redirect(
    new URL("/sign-up", process.env.NEXT_PUBLIC_APP_URL ?? "https://careerintelsa.co.za")
  );

  // Set the referral cookie on the redirect response
  response.cookies.set("ref_by", code, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
