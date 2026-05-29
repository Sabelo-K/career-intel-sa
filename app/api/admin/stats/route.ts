/**
 * GET /api/admin/stats
 * Real platform statistics for the admin dashboard.
 * Only accessible to the email set in ADMIN_EMAIL env var.
 */
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // ── Auth + admin guard ───────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress ?? "";
      if (email.toLowerCase() !== adminEmail.toLowerCase()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // ── Dates ────────────────────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // ── Run all queries in parallel ──────────────────────────────────────────
    const [
      totalUsers,
      premiumUsers,
      newThisMonth,
      cvCount,
      chatMsgCount,
      skillsCount,
      pathCount,
      recentUsers,
      activeChatUsers,
      activeSkillsUsers,
      activePathUsers,
      skillsGapRoles,
      careerPathRoles,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { plan: { not: "FREE" } } }),
      db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.cv.count(),
      db.chatMessage.count({ where: { role: "USER" } }),
      db.skillsGap.count(),
      db.careerPath.count(),

      // Users from last 6 months for the growth chart
      db.user.findMany({
        where:   { createdAt: { gte: sixMonthsAgo } },
        select:  { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // Active today — distinct users with any activity
      db.chatSession.findMany({
        where:    { updatedAt: { gte: todayStart } },
        select:   { userId: true },
        distinct: ["userId"],
      }),
      db.skillsGap.findMany({
        where:    { createdAt: { gte: todayStart } },
        select:   { userId: true },
        distinct: ["userId"],
      }),
      db.careerPath.findMany({
        where:    { createdAt: { gte: todayStart } },
        select:   { userId: true },
        distinct: ["userId"],
      }),

      // Top target roles from skills gap analyses
      db.skillsGap.groupBy({
        by:      ["targetRole"],
        _count:  { targetRole: true },
        orderBy: { _count: { targetRole: "desc" } },
        take:    10,
      }),

      // Top target roles from career path simulations
      db.careerPath.groupBy({
        by:      ["targetRole"],
        _count:  { targetRole: true },
        orderBy: { _count: { targetRole: "desc" } },
        take:    10,
      }),
    ]);

    // ── Active today ─────────────────────────────────────────────────────────
    const activeTodaySet = new Set([
      ...activeChatUsers.map((u) => u.userId),
      ...activeSkillsUsers.map((u) => u.userId),
      ...activePathUsers.map((u) => u.userId),
    ]);
    const activeToday = activeTodaySet.size;

    // ── User growth chart (last 6 months, new signups per month) ─────────────
    const growthData = Array.from({ length: 6 }, (_, i) => {
      const target = new Date();
      target.setMonth(target.getMonth() - (5 - i));
      const y = target.getFullYear();
      const m = target.getMonth();
      const count = recentUsers.filter((u) => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === y && d.getMonth() === m;
      }).length;
      return {
        month: target.toLocaleDateString("en-ZA", { month: "short" }),
        users: count,
      };
    });

    // ── Top career roles (merge skills gap + career path queries) ────────────
    const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
    const roleMap: Record<string, number> = {};
    for (const r of skillsGapRoles)  roleMap[r.targetRole] = (roleMap[r.targetRole] ?? 0) + r._count.targetRole;
    for (const r of careerPathRoles) roleMap[r.targetRole] = (roleMap[r.targetRole] ?? 0) + r._count.targetRole;

    const topRoles = Object.entries(roleMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([role, count], i) => ({ career: role, queries: count, color: CHART_COLORS[i] }));

    // ── Feature usage breakdown ──────────────────────────────────────────────
    const totalActivity = cvCount + chatMsgCount + skillsCount + pathCount;
    const featureUsage = [
      { type: "CV Builder",      count: cvCount,      color: "bg-indigo-500" },
      { type: "Career Coach",    count: chatMsgCount, color: "bg-violet-500" },
      { type: "Skills Gap",      count: skillsCount,  color: "bg-emerald-500" },
      { type: "Career Paths",    count: pathCount,    color: "bg-amber-500" },
    ].map((f) => ({
      ...f,
      pct: totalActivity > 0 ? Math.round((f.count / totalActivity) * 100) : 0,
    }));

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      activeToday,
      newThisMonth,
      cvCount,
      chatMsgCount,
      skillsCount,
      pathCount,
      growthData,
      topRoles,
      featureUsage,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
