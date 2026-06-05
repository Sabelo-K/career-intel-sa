/**
 * POST /api/interview/evaluate
 * Evaluates a spoken/typed interview answer using AI.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const Schema = z.object({
  question: z.string().min(5).max(500),
  answer:   z.string().min(10).max(3000),
  role:     z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const parsed = Schema.parse(body);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert SA interview coach. Evaluate the candidate's answer to the interview question.
Return ONLY valid JSON — no markdown, no extra text.
Format:
{
  "score": <number 1-10>,
  "headline": "<one-line verdict, e.g. 'Solid STAR structure, needs more SA context'>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "saContext": "<one sentence on how to make the answer more SA-specific — or null if already great>"
}`,
        },
        {
          role: "user",
          content: `Role: ${parsed.role ?? "General"}\n\nQuestion: ${parsed.question}\n\nCandidate's answer: ${parsed.answer}\n\nEvaluate this answer.`,
        },
      ],
      temperature: 0.3,
      max_tokens:  600,
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("[interview/evaluate]", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
