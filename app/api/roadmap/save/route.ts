import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { clerkId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { targetRole, totalMonths, matchPct, salaryImpact, phases } = body;

  if (!targetRole || !phases?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Delete existing roadmaps for this user (keep one active roadmap)
  await db.learningRoadmap.deleteMany({ where: { userId: dbUser.id } });

  // Create new roadmap with phases
  const roadmap = await db.learningRoadmap.create({
    data: {
      userId:      dbUser.id,
      targetRole:  targetRole.trim(),
      totalMonths: Number(totalMonths) || 0,
      matchPct:    Number(matchPct)    || 0,
      salaryImpact: salaryImpact || null,
      phases: {
        create: phases.map((p: {
          phaseNumber: number;
          title: string;
          description: string;
          skills: string[];
          weeks: number;
        }) => ({
          phaseNumber: Number(p.phaseNumber),
          title:       String(p.title),
          description: String(p.description),
          skills:      Array.isArray(p.skills) ? p.skills : [],
          weeks:       Number(p.weeks) || 0,
        })),
      },
    },
    include: { phases: true },
  });

  return NextResponse.json({ roadmap });
}
