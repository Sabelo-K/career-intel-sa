import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BADGES, getLevel, getLevelProgress, getNextLevelThreshold } from "@/lib/gamification";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { xp: true, streak: true, achievements: true, lastActivityDate: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const level = getLevel(user.xp);
  const progress = getLevelProgress(user.xp);
  const nextThreshold = getNextLevelThreshold(user.xp);

  const earnedBadges = BADGES.filter((b) => user.achievements.includes(b.id));
  const lockedBadges  = BADGES.filter((b) => !user.achievements.includes(b.id));

  return NextResponse.json({
    xp: user.xp,
    streak: user.streak,
    level: level.label,
    levelColor: level.color,
    levelProgress: progress,
    nextThreshold,
    earnedBadges,
    lockedBadges,
  });
}
