/**
 * POST /api/admin/set-plan
 * Manually override a user's plan — admin only.
 * Body: { email: string; plan: "FREE" | "PREMIUM" | "RECRUITER"; planKey?: string; days?: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // ── Admin guard ─────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: "Forbidden — admin not configured" }, { status: 403 });
    }
    const clerk = await currentUser();
    const callerEmail = clerk?.primaryEmailAddress?.emailAddress ?? "";
    if (callerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    const body = await req.json();
    const { email, plan, planKey, days = 30 } = body as {
      email: string;
      plan: string;
      planKey?: string;
      days?: number;
    };

    if (!email || !plan) {
      return NextResponse.json({ error: "email and plan are required" }, { status: 400 });
    }

    const validPlans = ["FREE", "PREMIUM", "RECRUITER", "ENTERPRISE"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: `plan must be one of: ${validPlans.join(", ")}` }, { status: 400 });
    }

    // ── Find user ────────────────────────────────────────────────────────────
    const target = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!target) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    // ── Compute expiry ───────────────────────────────────────────────────────
    const planExpiresAt = plan === "FREE" ? null : (() => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    })();

    // ── Update ───────────────────────────────────────────────────────────────
    const updated = await db.user.update({
      where: { id: target.id },
      data:  {
        plan:         plan as Plan,
        planKey:      plan === "FREE" ? null : (planKey ?? null),
        planExpiresAt,
      },
      select: { id: true, email: true, plan: true, planKey: true, planExpiresAt: true },
    });

    return NextResponse.json({
      success: true,
      user:    updated,
      message: `${email} upgraded to ${plan}${planExpiresAt ? ` until ${planExpiresAt.toISOString()}` : ""}`,
    });
  } catch (err) {
    console.error("[admin/set-plan]", err);
    return NextResponse.json({ error: "Failed", detail: String(err) }, { status: 500 });
  }
}
