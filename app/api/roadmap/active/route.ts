import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ roadmap: null });

  const roadmap = await db.learningRoadmap.findFirst({
    where:   { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      phases: {
        orderBy: { phaseNumber: "asc" },
      },
    },
  });

  return NextResponse.json({ roadmap });
}
