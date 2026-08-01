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

    // ── Dates — anchored to SAST (UTC+2), NOT server time ────────────────────
    // Vercel runs in UTC, so using server-local boundaries rolled the month over
    // at 02:00 SAST: a sale just after SA midnight on the 1st was counted in the
    // previous month. SA has no DST, so a fixed +2 offset is exact.
    const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;

    /** UTC instant of SAST midnight, `monthsBack` months before the current SA month. */
    const sastMonthStart = (monthsBack = 0): Date => {
      const sa = new Date(Date.now() + SAST_OFFSET_MS);
      return new Date(Date.UTC(sa.getUTCFullYear(), sa.getUTCMonth() - monthsBack, 1) - SAST_OFFSET_MS);
    };
    /** UTC instant of SAST midnight today. */
    const sastDayStart = (): Date => {
      const sa = new Date(Date.now() + SAST_OFFSET_MS);
      return new Date(Date.UTC(sa.getUTCFullYear(), sa.getUTCMonth(), sa.getUTCDate()) - SAST_OFFSET_MS);
    };
    /** Short month label for a SAST month start. */
    const sastMonthLabel = (d: Date): string =>
      new Date(d.getTime() + SAST_OFFSET_MS).toLocaleDateString("en-ZA", { month: "short", timeZone: "UTC" });

    const now          = new Date();
    const todayStart   = sastDayStart();
    const startOfMonth = sastMonthStart(0);
    const sixMonthsAgo = sastMonthStart(6);
    const last30Days   = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // PayFast grants exactly 30 days → planExpiresAt = paymentDate + 30 days
    // So "paid this month" = planExpiresAt between (startOfMonth+29d) and (startOfNextMonth+31d)
    const nextMonthStart = new Date(startOfMonth);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
    const revenueWindowStart = new Date(startOfMonth);
    revenueWindowStart.setDate(revenueWindowStart.getDate() + 29);
    const revenueWindowEnd = new Date(nextMonthStart);
    revenueWindowEnd.setDate(revenueWindowEnd.getDate() + 31);

    // Plan prices in ZAR — must match lib/payfast.ts PLANS / SUBSCRIPTION_PLANS
    const PLAN_PRICES_ONCE_OFF: Record<string, number> = {
      graduate: 29, professional: 79, recruiter: 499,
    };
    const PLAN_PRICES_SUBSCRIPTION: Record<string, number> = {
      graduate: 24, professional: 65, recruiter: 399,
    };
    const planPrice = (planKey: string | null, billingType: string | null): number => {
      const table = billingType === "SUBSCRIPTION" ? PLAN_PRICES_SUBSCRIPTION : PLAN_PRICES_ONCE_OFF;
      return table[planKey ?? ""] ?? 0;
    };

    // Rand value of each credit pack — must match lib/credits.ts CREDIT_PACKS
    const PACK_PRICES: Record<string, number> = { starter: 20, popular: 35, value: 60 };

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

    // ── Revenue from the Payment ledger (EXACT — actual settled payments) ────
    // Payment rows are written at checkout and confirmed by the ITN, so a
    // COMPLETE row is a real, settled payment. This is the source of truth and
    // never decays (unlike inferring plan revenue from planExpiresAt).
    // Falls back to CreditTransaction below for purchases made before the
    // Payment table existed, so historical credit revenue isn't lost.
    let ledgerCreditRevenue = 0;
    let ledgerPlanRevenue   = 0;
    let ledgerCreditMonth   = 0;
    let ledgerPlanMonth     = 0;
    let ledgerLast30        = 0;
    let ledgerPurchaseCount = 0;
    let ledgerRows: { type: string; amountCents: number; completedAt: Date | null; createdAt: Date }[] = [];
    let ledgerAvailable = false;

    try {
      ledgerRows = await db.payment.findMany({
        where:  { status: "COMPLETE" },
        select: { type: true, amountCents: true, completedAt: true, createdAt: true },
      });
      ledgerAvailable = true;

      const at = (r: { completedAt: Date | null; createdAt: Date }) => new Date(r.completedAt ?? r.createdAt);

      for (const r of ledgerRows) {
        const v  = r.amountCents / 100;
        const ts = at(r);
        const inMonth = ts >= startOfMonth;
        if (ts >= last30Days) ledgerLast30 += v;
        if (r.type === "credits") {
          ledgerCreditRevenue += v;
          if (inMonth) ledgerCreditMonth += v;
          ledgerPurchaseCount++;
        } else if (r.type === "plan") {
          ledgerPlanRevenue += v;
          if (inMonth) ledgerPlanMonth += v;
        }
      }
    } catch {
      // Payment table not migrated yet — fall back to the CreditTransaction path.
      ledgerAvailable = false;
    }

    // ── Credit revenue fallback (pre-ledger purchases) ───────────────────────
    let creditRevenueTotal     = 0;
    let creditRevenueThisMonth = 0;
    let creditPurchaseCount    = 0;
    let creditTxns: { packId: string | null; createdAt: Date }[] = [];

    try {
      creditTxns = await db.creditTransaction.findMany({
        where:  { amount: { gt: 0 }, packId: { in: Object.keys(PACK_PRICES) } },
        select: { packId: true, createdAt: true },
      });

      creditPurchaseCount = creditTxns.length;
      creditRevenueTotal  = creditTxns.reduce((s, t) => s + (PACK_PRICES[t.packId ?? ""] ?? 0), 0);
      creditRevenueThisMonth = creditTxns
        .filter((t) => new Date(t.createdAt) >= startOfMonth)
        .reduce((s, t) => s + (PACK_PRICES[t.packId ?? ""] ?? 0), 0);
    } catch { /* leave zeros */ }

    // Prefer the ledger once it has data; keep the higher figure so purchases
    // made before the migration are never dropped from the totals.
    if (ledgerAvailable && ledgerCreditRevenue > 0) {
      creditRevenueTotal     = Math.max(creditRevenueTotal, ledgerCreditRevenue);
      creditRevenueThisMonth = Math.max(creditRevenueThisMonth, ledgerCreditMonth);
      creditPurchaseCount    = Math.max(creditPurchaseCount, ledgerPurchaseCount);
    }

    // Credit revenue in the trailing 30 days (fallback path)
    const creditRevenueLast30 = creditTxns
      .filter((t) => new Date(t.createdAt) >= last30Days)
      .reduce((s, t) => s + (PACK_PRICES[t.packId ?? ""] ?? 0), 0);

    // ── Plan breakdown + revenue ─────────────────────────────────────────────
    let planBreakdown = { graduate: 0, professional: 0, recruiter: 0 };
    let planRevenueThisMonth = 0;
    let revenueThisMonth = 0;
    let revenueData: { month: string; revenue: number; users: number }[] = [];

    try {
      // All paid users (planExpiresAt in future = currently active)
      const activePaid = await db.user.findMany({
        where: { plan: { not: "FREE" }, planExpiresAt: { gte: now } },
        select: { planKey: true },
      });

      planBreakdown = {
        graduate:     activePaid.filter((u) => u.planKey === "graduate").length,
        professional: activePaid.filter((u) => u.planKey === "professional").length,
        recruiter:    activePaid.filter((u) => u.planKey === "recruiter").length,
      };

      // All paid users with expiry for revenue calculations.
      // NB: this is an APPROXIMATION — plan revenue is inferred from
      // planExpiresAt, and the expire-plans cron nulls that field, so plan
      // revenue history fades as plans lapse. Credit revenue below is exact.
      const allPaid = await db.user.findMany({
        where: { plan: { not: "FREE" }, planExpiresAt: { not: null } },
        select: { planKey: true, planExpiresAt: true, billingType: true },
      });

      // Revenue this calendar month (approximated via planExpiresAt window)
      const paidThisMonth = allPaid.filter((u) => {
        if (!u.planExpiresAt) return false;
        const exp = new Date(u.planExpiresAt);
        return exp >= revenueWindowStart && exp < revenueWindowEnd;
      });
      // Prefer the exact ledger figure; fall back to the planExpiresAt estimate
      // only while the ledger has no plan payments yet (pre-migration history).
      const estimatedPlanMonth = paidThisMonth.reduce(
        (sum, u) => sum + planPrice(u.planKey, u.billingType), 0
      );
      planRevenueThisMonth = (ledgerAvailable && ledgerPlanRevenue > 0)
        ? ledgerPlanMonth
        : estimatedPlanMonth;
      revenueThisMonth = planRevenueThisMonth + creditRevenueThisMonth;

      // Revenue trend — last 6 months (plans + credits)
      revenueData = Array.from({ length: 6 }, (_, i) => {
        const tgt     = sastMonthStart(5 - i);
        const tgtNext = sastMonthStart(4 - i);
        const wStart = new Date(tgt);  wStart.setDate(wStart.getDate() + 29);
        const wEnd   = new Date(tgtNext); wEnd.setDate(wEnd.getDate() + 31);

        const monthUsers = allPaid.filter((u) => {
          if (!u.planExpiresAt) return false;
          const exp = new Date(u.planExpiresAt);
          return exp >= wStart && exp < wEnd;
        });

        // Ledger is exact when available; otherwise fall back to estimates.
        const inMonth = (d: Date) => d >= tgt && d < tgtNext;

        const ledgerMonth = ledgerAvailable
          ? ledgerRows
              .filter((r) => inMonth(new Date(r.completedAt ?? r.createdAt)))
              .reduce((s, r) => s + r.amountCents / 100, 0)
          : 0;

        const estimatedMonth =
          monthUsers.reduce((s, u) => s + planPrice(u.planKey, u.billingType), 0) +
          creditTxns
            .filter((t) => inMonth(new Date(t.createdAt)))
            .reduce((s, t) => s + (PACK_PRICES[t.packId ?? ""] ?? 0), 0);

        return {
          month:   sastMonthLabel(tgt),
          revenue: Math.max(ledgerMonth, estimatedMonth),
          users:   monthUsers.length,
        };
      });
    } catch { /* leave zeros */ }

    // If the plan block threw, still surface credit revenue.
    if (revenueThisMonth === 0 && creditRevenueThisMonth > 0) {
      revenueThisMonth = creditRevenueThisMonth;
    }

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

    // ── Active subscribers with days remaining ───────────────────────────────
    interface Subscriber {
      name: string; email: string; planKey: string;
      planExpiresAt: Date | null; daysLeft: number;
    }
    let subscribers: Subscriber[] = [];
    let expiringCount = 0;

    try {
      const rows = await db.user.findMany({
        where:   { plan: { not: "FREE" }, planExpiresAt: { not: null } },
        select:  { name: true, email: true, planKey: true, planExpiresAt: true },
        orderBy: { planExpiresAt: "asc" },
      });

      subscribers = rows.map((u) => ({
        name:          u.name ?? u.email ?? "Unknown",
        email:         u.email,
        planKey:       u.planKey ?? "unknown",
        planExpiresAt: u.planExpiresAt,
        daysLeft:      u.planExpiresAt
          ? Math.ceil((new Date(u.planExpiresAt).getTime() - now.getTime()) / 86_400_000)
          : 0,
      }));

      expiringCount = subscribers.filter((s) => s.daysLeft > 0 && s.daysLeft <= 7).length;
    } catch { /* leave empty */ }

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
      planBreakdown,
      revenueThisMonth,
      // All-time and trailing-30-day totals — so a fresh calendar month never
      // reads as "zero revenue" when the platform is in fact making sales.
      revenueAllTime:    Math.max(ledgerCreditRevenue + ledgerPlanRevenue, creditRevenueTotal),
      revenueLast30Days: Math.max(ledgerLast30, creditRevenueLast30),
      // "ledger" = exact settled payments; "estimated" = inferred from plan
      // expiry dates (pre-migration history only).
      revenueSource: ledgerAvailable && (ledgerPlanRevenue > 0 || ledgerCreditRevenue > 0)
        ? "ledger" : "estimated",
      planRevenueThisMonth,
      creditRevenueThisMonth,
      creditRevenueTotal,
      creditPurchaseCount,
      revenueData,
      subscribers,
      expiringCount,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json(
      { error: "Failed to load stats", detail: String(err) },
      { status: 500 }
    );
  }
}
