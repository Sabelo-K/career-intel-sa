import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { parseAndRevampCV } from "@/lib/ai/claude";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";

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

    // ── Save to DB (non-blocking) ─────────────────────────────────────────────
    try {
      const clerkUser = await currentUser();
      const dbUser = await getOrCreateUser(
        userId,
        clerkUser?.primaryEmailAddress?.emailAddress,
        clerkUser?.fullName
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const revampedAny = revamped as any;
      const atsScore       = typeof revampedAny.atsScore      === "number" ? revampedAny.atsScore      as number : null;
      const recruiterScore = typeof revampedAny.recruiterScore === "number" ? revampedAny.recruiterScore as number : null;

      const existingCV = await db.cV.findFirst({
        where: { userId: dbUser.id },
        orderBy: { updatedAt: "desc" },
      });

      if (existingCV) {
        await db.cV.update({
          where: { id: existingCV.id },
          data: { name: file.name, parsedData: revampedAny, atsScore, recruiterScore, improvedContent: revampedAny, isActive: true },
        });
      } else {
        await db.cV.create({
          data: { userId: dbUser.id, name: file.name, parsedData: revampedAny, atsScore, recruiterScore, improvedContent: revampedAny, isActive: true, version: 1 },
        });
      }
    } catch (dbErr) {
      console.error("CV DB save error (non-fatal):", dbErr);
    }

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
