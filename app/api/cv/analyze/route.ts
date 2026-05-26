import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCV, analyzeCV } from "@/lib/ai/claude";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cvText = formData.get("text") as string | null;

    let textContent = cvText || "";

    if (file && !textContent) {
      if (file.type === "application/pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfParse = await import("pdf-parse");
        const data = await pdfParse.default(buffer);
        textContent = data.text;
      } else {
        textContent = await file.text();
      }
    }

    if (!textContent.trim()) {
      return NextResponse.json({ error: "No CV content found" }, { status: 400 });
    }

    const [parsedData, analysis] = await Promise.all([
      parseCV(textContent),
      analyzeCV({ text: textContent }),
    ]);

    return NextResponse.json({
      parsedData,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CV analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze CV" }, { status: 500 });
  }
}
