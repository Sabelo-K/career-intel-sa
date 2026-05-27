import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateInterviewQuestions } from "@/lib/ai/claude";
import { z } from "zod";

const Schema = z.object({
  role:     z.string().min(2),
  level:    z.enum(["junior", "mid", "senior", "executive"]).default("mid"),
  industry: z.string().default("general"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const params = Schema.parse(body);

    const result = await generateInterviewQuestions(params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("Interview questions error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
