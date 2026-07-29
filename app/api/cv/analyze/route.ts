import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseCV, analyzeCV } from "@/lib/ai/claude";
import { checkRateLimit, rateLimitResponse, CV_LIMIT } from "@/lib/rate-limit";
import { getTargetKeywords, scoreCv, type ScoreableCv } from "@/lib/ats-score";

export const runtime = "nodejs";

/** Map the CV parser's output shape into the deterministic scorer's input. */
function toScoreableFromParsed(parsed: Record<string, unknown>, rawText: string): ScoreableCv {
  const personal   = (parsed.personalInfo ?? {}) as Record<string, string>;
  const experience = Array.isArray(parsed.experience) ? (parsed.experience as Record<string, unknown>[]) : [];
  const education  = Array.isArray(parsed.education) ? (parsed.education as Record<string, unknown>[]) : [];
  const skills     = Array.isArray(parsed.skills) ? (parsed.skills as string[]) : [];

  const bullets = experience.flatMap((e) => {
    const desc = typeof e.description === "string" ? (e.description as string).split(/\n+/) : [];
    const ach  = Array.isArray(e.achievements) ? (e.achievements as string[]) : [];
    return [...desc, ...ach];
  });

  return {
    summary:  typeof parsed.summary === "string" ? (parsed.summary as string) : "",
    skills,
    bullets,
    contact:  { email: personal.email, phone: personal.phone, location: personal.location },
    hasExperience: experience.length > 0,
    hasEducation:  education.length > 0,
    fullText: rawText,   // raw text is the most reliable keyword source
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 10 analyses per hour per user
    const limited = rateLimitResponse(checkRateLimit({ key: `cv-analyze:${userId}`, ...CV_LIMIT }));
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cvText = formData.get("text") as string | null;
    const targetRole     = (formData.get("targetRole")     as string | null)?.trim() || undefined;
    const jobDescription = (formData.get("jobDescription") as string | null)?.trim() || undefined;

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

    // Deterministic scoring — same engine as the revamp flow, so the whole app
    // agrees on what an ATS score means. Overrides the LLM's guessed numbers.
    const targetKeywords = getTargetKeywords(targetRole, jobDescription);
    const det = scoreCv(toScoreableFromParsed(parsedData, textContent), targetKeywords);

    const llm = analysis as Record<string, unknown>;
    const mergedAnalysis = {
      ...llm,
      atsScore:        det.atsScore,
      recruiterScore:  det.recruiterScore,
      keywordMatch:    det.keywordMatch,
      matchedKeywords: det.matchedKeywords,
      // Prefer the computed missing keywords when we have a target to match against
      missingKeywords: det.missingKeywords.length ? det.missingKeywords
                       : (Array.isArray(llm.missingKeywords) ? llm.missingKeywords : []),
      scoreBreakdown:  det.breakdown,
    };

    return NextResponse.json({
      parsedData,
      analysis: mergedAnalysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CV analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze CV" }, { status: 500 });
  }
}
