import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify the phase belongs to this user
  const phase = await db.roadmapPhase.findFirst({
    where: {
      id:      params.id,
      roadmap: { userId: dbUser.id },
    },
  });

  if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

  const nowCompleted = !phase.completed;

  const updated = await db.roadmapPhase.update({
    where: { id: params.id },
    data: {
      completed:   nowCompleted,
      completedAt: nowCompleted ? new Date() : null,
    },
  });

  // Update roadmap's updatedAt
  await db.learningRoadmap.update({
    where: { id: phase.roadmapId },
    data:  { updatedAt: new Date() },
  });

  return NextResponse.json({ phase: updated });
}
