/**
 * GET /api/admin/stats
 * Real platform statistics for the admin dashboard.
 * Only accessible to the email set in ADMIN_EMAIL env var.
 */
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { MessageRole } from "@prisma/client";

export async function GET() {
  try {
    // ── Auth + admin guard ───────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: "Forbidden — admin not configured" }, { status: 403 });
    }
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // ── Helper: safe count — accepts a THUNK so sync throws are also caught ──
    const safeCount = async (fn: () => Promise<number>): Promise<number> => {
      try { return await fn(); } catch { return 0; }
    };

    // ── Core counts (each isolated so one failure doesn't zero everything) ──
    const [
      totalUsers,
      premiumUsers,
      newThisMonth,
      cvCount,
      chatMsgCount,
      skillsCount,
      pathCount,
    ] = await Promise.all([
      safeCount(() => db.user.count()),
      safeCount(() => db.user.count({ where: { plan: { not: "FREE" } } })),
      safeCount(() => db.user.count({ where: { createdAt: { gte: startOfMonth } } })),
      safeCount(() => db.cV.count()),
      // Use Prisma enum constant — avoids string-literal type mismatch
      safeCount(() => db.chatMessage.count({ where: { role: MessageRole.USER } })),
      safeCount(() => db.skillsGap.count()),
      safeCount(() => db.careerPath.count()),
    ]);

    // ── Active today ─────────────────────────────────────────────────────────
    let activeToday = 0;
    try {
      const [chatActive, skillsActive, pathActive] = await Promise.all([
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
      ]);
      const set = new Set([
        ...chatActive.map((u) => u.userId),
        ...skillsActive.map((u) => u.userId),
        ...pathActive.map((u) => u.userId),
      ]);
      activeToday = set.size;
    } catch { /* leave 0 */ }

    // ── User growth chart (last 6 months) ────────────────────────────────────
    let growthData: { month: string; users: number }[] = [];
    try {
      const recentUsers = await db.user.findMany({
        where:   { createdAt: { gte: sixMonthsAgo } },
        select:  { createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      growthData = Array.from({ length: 6 }, (_, i) => {
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
    } catch { /* leave empty array */ }

    // ── Top career roles ─────────────────────────────────────────────────────
    const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
    let topRoles: { career: string; queries: number; color: string }[] = [];
    try {
      // Use raw aggregation to avoid groupBy orderBy compatibility issues
      const [skillsRoles, pathRoles] = await Promise.all([
        db.skillsGap.groupBy({
          by:      ["targetRole"],
          _count:  { targetRole: true },
          orderBy: { _count: { targetRole: "desc" } },
          take:    10,
        }),
        db.careerPath.groupBy({
          by:      ["targetRole"],
          _count:  { targetRole: true },
          orderBy: { _count: { targetRole: "desc" } },
          take:    10,
        }),
      ]);

      const roleMap: Record<string, number> = {};
      for (const r of skillsRoles)  roleMap[r.targetRole] = (roleMap[r.targetRole] ?? 0) + (r._count.targetRole ?? 0);
      for (const r of pathRoles)    roleMap[r.targetRole] = (roleMap[r.targetRole] ?? 0) + (r._count.targetRole ?? 0);

      topRoles = Object.entries(roleMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([role, count], i) => ({ career: role, queries: count, color: CHART_COLORS[i] }));
    } catch { /* leave empty */ }

    // ── Feature usage breakdown ──────────────────────────────────────────────
    const totalActivity = cvCount + chatMsgCount + skillsCount + pathCount;
    const featureUsage = [
      { type: "CV Builder",   count: cvCount,      color: "bg-indigo-500"  },
      { type: "Career Coach", count: chatMsgCount, color: "bg-violet-500"  },
      { type: "Skills Gap",   count: skillsCount,  color: "bg-emerald-500" },
      { type: "Career Paths", count: pathCount,    color: "bg-amber-500"   },
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
    return NextResponse.json(
      { error: "Failed to load stats", detail: String(err) },
      { status: 500 }
    );
  }
}
