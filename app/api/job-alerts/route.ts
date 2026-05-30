/**
 * GET  /api/job-alerts — list the authenticated user's job alerts
 * POST /api/job-alerts — create a new job alert
 * DELETE /api/job-alerts?id=<id> — delete a specific alert
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";
import { Province } from "@prisma/client";
import { z } from "zod";

const CreateSchema = z.object({
  keywords:  z.array(z.string().min(1)).min(1).max(10),
  province:  z.string().optional(),
  minSalary: z.number().int().min(0).optional(),
  remote:    z.boolean().optional(),
});

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ alerts: [] });

    const alerts = await db.jobAlert.findMany({
      where:   { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[job-alerts GET]", err);
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const parsed = CreateSchema.parse(body);

    const clerkUser = await currentUser();
    const dbUser    = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    // Cap at 5 active alerts per user
    const existing = await db.jobAlert.count({ where: { userId: dbUser.id, isActive: true } });
    if (existing >= 5) {
      return NextResponse.json({ error: "Maximum 5 active job alerts allowed" }, { status: 400 });
    }

    const alert = await db.jobAlert.create({
      data: {
        userId:    dbUser.id,
        keywords:  parsed.keywords,
        province:  parsed.province as Province | undefined,
        minSalary: parsed.minSalary,
        remote:    parsed.remote,
        isActive:  true,
      },
    });

    return NextResponse.json({ alert, success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: err.errors }, { status: 400 });
    }
    console.error("[job-alerts POST]", err);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Only delete if it belongs to this user
    await db.jobAlert.deleteMany({ where: { id, userId: dbUser.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[job-alerts DELETE]", err);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}

// ── PATCH — toggle active/inactive ───────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, isActive } = await req.json() as { id: string; isActive: boolean };
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await db.jobAlert.updateMany({
      where: { id, userId: dbUser.id },
      data:  { isActive },
    });

    if (updated.count === 0) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[job-alerts PATCH]", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
