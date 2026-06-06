/**
 * /r/[code] — Referral redirect page
 * Sets a referral cookie then sends the visitor to sign-up.
 * The code is the referrer's Clerk user ID.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ReferralRedirectPage({
  params,
}: {
  params: { code: string };
}) {
  // Store referrer code in a server-side cookie (30-day expiry)
  const cookieStore = await cookies();
  cookieStore.set("ref_by", params.code, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  redirect("/sign-up");
}
