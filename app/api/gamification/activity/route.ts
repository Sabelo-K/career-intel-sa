import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import {
  XpAction, XP_VALUES, checkNewBadges, BADGES,
} from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as XpAction;
  if (!action || !(action in XP_VALUES)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true, xp: true, streak: true, lastActivityDate: true,
      achievements: true, profile: { select: { currentRole: true, targetRole: true, skills: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const xpGain = XP_VALUES[action];
  const now = new Date();
  const todayStr = now.toDateString();
  const lastStr = user.lastActivityDate ? new Date(user.lastActivityDate).toDateString() : null;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = user.streak;
  if (lastStr === todayStr) {
    // Same day — streak unchanged, no daily_login XP repeat
  } else if (lastStr === yesterday.toDateString()) {
    newStreak += 1;
  } else {
    // Gap — reset streak (only if this isn't a same-day action)
    newStreak = 1;
  }

  const newXp = user.xp + xpGain;

  // Check for new badges
  const newBadgeIds = checkNewBadges(
    action,
    user.achievements,
    newXp,
    newStreak,
    { profileComplete: (user.profile?.skills?.length ?? 0) >= 5 && !!user.profile?.currentRole && !!user.profile?.targetRole },
  );

  // Award bonus XP for badges earned
  const badgeXp = newBadgeIds.reduce((sum, id) => {
    const badge = BADGES.find((b) => b.id === id);
    return sum + (badge?.xpReward ?? 0);
  }, 0);

  const finalXp = newXp + badgeXp;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      xp: finalXp,
      streak: newStreak,
      lastActivityDate: now,
      achievements: { set: [...user.achievements, ...newBadgeIds] },
    },
  });

  return NextResponse.json({
    xp: finalXp,
    xpGained: xpGain + badgeXp,
    streak: newStreak,
    newBadges: newBadgeIds.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean),
  });
}
