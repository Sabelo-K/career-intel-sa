/**
 * DELETE /api/user/delete
 * POPIA Section 24 — right to erasure.
 * Deletes all personal data for the authenticated user then removes their
 * Clerk account. Cascade deletes in Prisma handle all related records.
 */
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the DB user record
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      // User never fully created in DB — still try to remove from Clerk
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userId);
      } catch { /* ignore */ }
      return NextResponse.json({ success: true });
    }

    // Delete the DB user record — Prisma cascade handles:
    //   Profile, CV, ChatSession (→ ChatMessage), CareerPath,
    //   SkillsGap, JobAlert, CourseProgress, CreditTransaction,
    //   LearningRoadmap (→ RoadmapPhase), Feedback (SetNull — kept anonymised)
    await db.user.delete({ where: { id: dbUser.id } });

    // Remove from Clerk — revokes all sessions
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch (err) {
      // DB record already gone — log but don't fail
      console.error("[user/delete] Clerk deletion error:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user/delete]", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
