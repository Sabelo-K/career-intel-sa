/**
 * POST /api/support/chat
 * Streaming support agent — available to ALL authenticated users regardless of plan.
 * No credits deducted, no plan gating. Rate limited to 20 msgs/min per user.
 */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamSupportAgent } from "@/lib/ai/claude";
import { checkRateLimit, rateLimitResponse, CHAT_LIMIT } from "@/lib/rate-limit";

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

    // Rate limit: reuse the chat limit (20 msgs/min) — no plan gating
    const limited = rateLimitResponse(
      checkRateLimit({ key: `support:${userId}`, ...CHAT_LIMIT })
    );
    if (limited) return limited;

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamSupportAgent(messages)) {
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
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":     "text/event-stream",
        "Cache-Control":    "no-cache, no-transform",
        Connection:         "keep-alive",
        "X-Accel-Buffering":"no",
      },
    });
  } catch (err) {
    console.error("[support/chat] error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
