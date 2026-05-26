import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeSkillsGap } from "@/lib/ai/claude";
import { z } from "zod";

const SkillsGapSchema = z.object({
  currentSkills: z.array(z.string()).min(1),
  targetRole: z.string().min(2),
  yearsExperience: z.number().min(0).max(50).default(0),
  education: z.string().default("Not specified"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const params = SkillsGapSchema.parse(body);

    const result = await analyzeSkillsGap(params);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("Skills gap error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
