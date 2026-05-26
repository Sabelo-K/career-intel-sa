import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { simulateCareerPath } from "@/lib/ai/claude";
import { z } from "zod";

const CareerPathSchema = z.object({
  currentRole: z.string().min(2),
  targetRole: z.string().min(2),
  yearsExperience: z.number().min(0).max(50),
  currentSkills: z.array(z.string()),
  province: z.string().default("GAUTENG"),
  timeframeYears: z.number().min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const params = CareerPathSchema.parse(body);

    const simulation = await simulateCareerPath(params);

    return NextResponse.json(simulation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("Career path error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
