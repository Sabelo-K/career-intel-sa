import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamCareerCoach } from "@/lib/ai/claude";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages, context, sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Resolve DB session (if provided) — non-blocking DB operations so
    // failures never break the SSE stream.
    let dbSessionId: string | null = sessionId ?? null;
    let dbUserId: string | null = null;

    try {
      const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
      if (dbUser) {
        dbUserId = dbUser.id;

        // Verify session belongs to this user, else null it out
        if (dbSessionId) {
          const session = await db.chatSession.findFirst({
            where: { id: dbSessionId, userId: dbUser.id },
            select: { id: true },
          });
          if (!session) dbSessionId = null;
        }

        // Save the last user message
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (lastUserMsg && dbSessionId) {
          await db.chatMessage.create({
            data: {
              sessionId: dbSessionId,
              role:      "USER",
              content:   lastUserMsg.content,
            },
          });
        }
      }
    } catch (dbErr) {
      console.error("Chat DB pre-stream error:", dbErr);
    }

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamCareerCoach(messages, context)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
            );
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
        } finally {
          controller.close();

          // Save assistant response after stream completes
          if (fullResponse && dbSessionId) {
            db.chatMessage.create({
              data: {
                sessionId: dbSessionId,
                role:      "ASSISTANT",
                content:   fullResponse,
              },
            })
            .then(() => {
              // Update session title from first user message if still default
              const firstUser = messages.find((m) => m.role === "user");
              if (firstUser && dbSessionId) {
                return db.chatSession.updateMany({
                  where: { id: dbSessionId, title: "New conversation" },
                  data:  { title: firstUser.content.slice(0, 60) },
                });
              }
            })
            .catch((e) => console.error("Chat DB post-stream error:", e));
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":    "text/event-stream",
        "Cache-Control":   "no-cache, no-transform",
        Connection:        "keep-alive",
        "X-Accel-Buffering":"no",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
