/**
 * POST /api/chat/session
 * Creates a new ChatSession (called on first message).
 *
 * GET /api/chat/session?id=xxx
 * Fetches a single session with its messages (for resuming a chat).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body    = await req.json().catch(() => ({}));
    const title   = body.title ?? "New conversation";
    const context = body.context ?? null;

    const clerkUser = await currentUser();
    const dbUser = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    const session = await db.chatSession.create({
      data: { userId: dbUser.id, title, context },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Create session error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const session = await db.chatSession.findFirst({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
        user:     { select: { clerkId: true } },
      },
    });

    if (!session || session.user.clerkId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("Get session error:", err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
