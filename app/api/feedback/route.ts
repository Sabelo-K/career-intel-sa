/**
 * POST /api/feedback  — submit a CSAT rating
 * GET  /api/feedback  — admin: retrieve aggregate stats + recent comments
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  feature: z.enum(["cv-builder", "career-coach", "skills-gap", "career-paths", "general"]),
});

// ── POST — submit feedback ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    const body   = await req.json();
    const parsed = Schema.parse(body);

    // Look up DB user id if authenticated (nullable — anonymous allowed)
    let dbUserId: string | null = null;
    if (userId) {
      const dbUser = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
      dbUserId = dbUser?.id ?? null;
    }

    await db.feedback.create({
      data: {
        rating:  parsed.rating,
        comment: parsed.comment ?? null,
        feature: parsed.feature,
        userId:  dbUserId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("[feedback POST]", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

// ── GET — aggregate stats for admin dashboard ─────────────────────────────────
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const all = await db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    const total = all.length;
    const avgRating = total
      ? Math.round((all.reduce((s, f) => s + f.rating, 0) / total) * 10) / 10
      : 0;

    // Per-feature averages
    const featureMap: Record<string, { sum: number; count: number }> = {};
    for (const f of all) {
      if (!featureMap[f.feature]) featureMap[f.feature] = { sum: 0, count: 0 };
      featureMap[f.feature].sum   += f.rating;
      featureMap[f.feature].count += 1;
    }
    const byFeature = Object.entries(featureMap).map(([feature, { sum, count }]) => ({
      feature,
      avg:   Math.round((sum / count) * 10) / 10,
      count,
    }));

    // Rating distribution (1–5)
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: all.filter((f) => f.rating === star).length,
    }));

    // Recent 20 with comments
    const recent = all
      .filter((f) => f.comment)
      .slice(0, 20)
      .map((f) => ({
        id:        f.id,
        rating:    f.rating,
        comment:   f.comment,
        feature:   f.feature,
        name:      f.user?.name ?? "Anonymous",
        createdAt: f.createdAt,
      }));

    return NextResponse.json({ total, avgRating, byFeature, distribution, recent });
  } catch (err) {
    console.error("[feedback GET]", err);
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}
