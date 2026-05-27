/**
 * GET /api/chat/sessions
 * Returns the authenticated user's last 10 chat sessions (most recent first),
 * each with a preview of the last message.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.json({ sessions: [] });

    const sessions = await db.chatSession.findMany({
      where:   { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
      take:    10,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take:    1,
          select:  { content: true, role: true },
        },
      },
    });

    const formatted = sessions.map((s) => ({
      id:          s.id,
      title:       s.title ?? "Untitled conversation",
      lastMessage: s.messages[0]?.content?.slice(0, 80) ?? "",
      updatedAt:   s.updatedAt.toISOString(),
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (err) {
    console.error("List sessions error:", err);
    return NextResponse.json({ sessions: [] });
  }
}
