import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseAndRevampCV } from "@/lib/ai/claude";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── Extract text from uploaded file ──────────────────────────────────────
    let text = "";
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (ext === "pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = await import("pdf-parse");
      const parsed = await pdfParse.default(buffer);
      text = parsed.text;
    } else if (ext === "docx" || ext === "doc") {
      // Try mammoth for Word docs; fall back to raw text if not installed
      try {
        const mammoth = await import("mammoth");
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch {
        text = await file.text();
      }
    } else {
      // Plain text / unsupported — read as-is
      text = await file.text();
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from your file. Try uploading a PDF or plain-text version of your CV." },
        { status: 422 }
      );
    }

    // ── AI parse + revamp ─────────────────────────────────────────────────────
    const revamped = await parseAndRevampCV(text);
    return NextResponse.json(revamped);
  } catch (err) {
    console.error("CV revamp error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to revamp CV: ${message}` },
      { status: 500 }
    );
  }
}
