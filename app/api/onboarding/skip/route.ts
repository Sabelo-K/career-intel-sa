/**
 * POST /api/onboarding/skip
 * Marks the user as onboarded without requiring profile data.
 * Critically: calls getOrCreateUser so the dev→prod clerkId re-link
 * happens even when the user clicks "Skip for now".
 */
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const dbUser = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    await db.user.update({
      where: { id: dbUser.id },
      data:  { onboarded: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[onboarding/skip] error:", err);
    return NextResponse.json({ error: "Failed to skip onboarding" }, { status: 500 });
  }
}
