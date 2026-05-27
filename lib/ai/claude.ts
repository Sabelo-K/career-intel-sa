/**
 * AI layer — powered by Groq (free tier, llama-3.3-70b-versatile)
 * Groq free tier: 14,400 requests/day, 500,000 tokens/min — no credit card required.
 * Get a free key at: https://console.groq.com
 *
 * Function signatures are preserved so the rest of the codebase requires no changes.
 */
import Groq from "groq-sdk";
import {
  SYSTEM_PROMPT_CAREER_COACH,
  SYSTEM_PROMPT_CV_PARSER,
  SYSTEM_PROMPT_SKILLS_GAP,
  buildCareerPathPrompt,
  buildEmployabilityPrompt,
} from "./prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

type Message = { role: "user" | "assistant"; content: string };
type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

/** Build the full messages array Groq expects, with system prompt prepended. */
function buildMessages(
  messages: Message[],
  systemPrompt: string
): GroqMessage[] {
  return [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
}

/** Extract and parse the first JSON object from a text response. */
function extractJSON(text: string): Record<string, unknown> {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

// ─── Career Coach (streaming) ────────────────────────────────────────────────

export async function* streamCareerCoach(
  messages: Message[],
  systemContext?: string
) {
  const systemPrompt = systemContext
    ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
    : SYSTEM_PROMPT_CAREER_COACH;

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: buildMessages(messages, systemPrompt),
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) yield text;
  }
}

// ─── Career Coach (non-streaming fallback) ───────────────────────────────────

export async function chatWithCareerCoach(
  messages: Message[],
  systemContext?: string
) {
  const systemPrompt = systemContext
    ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
    : SYSTEM_PROMPT_CAREER_COACH;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: buildMessages(messages, systemPrompt),
    stream: false,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ─── CV Parser ───────────────────────────────────────────────────────────────

export async function parseCV(cvText: string) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT_CV_PARSER },
      { role: "user", content: `Parse this CV and return structured JSON:\n\n${cvText}` },
    ],
    stream: false,
    max_tokens: 2048,
  });

  return extractJSON(response.choices[0]?.message?.content ?? "");
}

// ─── CV Analyser ─────────────────────────────────────────────────────────────

export async function analyzeCV(cvData: Record<string, unknown>) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert ATS optimisation specialist and SA recruiter.
Analyse CVs and provide detailed improvement recommendations.
Respond with valid JSON only — no markdown, no explanation outside the JSON.`,
      },
      {
        role: "user",
        content: `Analyse this CV for the South African job market and provide:
1. ATS score (0-100)
2. Recruiter score (0-100)
3. Specific improvements needed
4. Strengths to highlight
5. An improved professional summary
6. Missing keywords for their industry

CV Data:
${JSON.stringify(cvData, null, 2)}

Return as JSON:
{
  "atsScore": number,
  "recruiterScore": number,
  "suggestions": ["suggestion1", ...],
  "strengths": ["strength1", ...],
  "weaknesses": ["weakness1", ...],
  "improvedSummary": "text",
  "missingKeywords": ["keyword1", ...]
}`,
      },
    ],
    stream: false,
    max_tokens: 2048,
  });

  return extractJSON(response.choices[0]?.message?.content ?? "");
}

// ─── Skills Gap Analysis ──────────────────────────────────────────────────────

export async function analyzeSkillsGap(params: {
  currentSkills: string[];
  targetRole: string;
  yearsExperience: number;
  education: string;
}) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT_SKILLS_GAP },
      {
        role: "user",
        content: `Analyse the skills gap for this South African professional:

Current Skills: ${params.currentSkills.join(", ")}
Target Role: ${params.targetRole}
Years of Experience: ${params.yearsExperience}
Education: ${params.education}

Return as JSON:
{
  "matchPercentage": number,
  "missingSkills": [{ "skill": "", "priority": "HIGH|MEDIUM|LOW", "demandScore": number, "timeToLearnWeeks": number, "reason": "" }],
  "learningPath": [{ "order": number, "title": "", "description": "", "skills": [], "resources": [], "estimatedWeeks": number }],
  "estimatedMonths": number,
  "quickWins": ["skill1"],
  "salaryImpact": "string"
}`,
      },
    ],
    stream: false,
    max_tokens: 2048,
  });

  return extractJSON(response.choices[0]?.message?.content ?? "");
}

// ─── Career Path Simulator ────────────────────────────────────────────────────

export async function simulateCareerPath(params: {
  currentRole: string;
  targetRole: string;
  yearsExperience: number;
  currentSkills: string[];
  province: string;
  timeframeYears: number;
}) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "user", content: buildCareerPathPrompt(params) },
    ],
    stream: false,
    max_tokens: 2048,
  });

  return extractJSON(response.choices[0]?.message?.content ?? "");
}

// ─── Employability Score ──────────────────────────────────────────────────────

export async function calculateEmployabilityScore(profile: {
  currentRole?: string;
  targetRole?: string;
  skills: string[];
  education?: string;
  yearsExperience?: number;
  province?: string;
}) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "user", content: buildEmployabilityPrompt(profile) },
    ],
    stream: false,
    max_tokens: 1024,
  });

  return extractJSON(response.choices[0]?.message?.content ?? "");
}

// ─── Interview Question Generator ────────────────────────────────────────────

export async function generateInterviewQuestions(params: {
  role: string;
  level: string;
  industry: string;
}) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Generate 10 realistic interview questions for a ${params.level} ${params.role} in the South African ${params.industry} industry.

Include a mix of behavioural, technical, situational, and SA-specific questions.

Return as JSON:
{
  "questions": [{
    "id": "q1",
    "question": "text",
    "type": "behavioral|technical|situational|competency",
    "difficulty": "easy|medium|hard",
    "sampleAnswer": "brief guide",
    "tips": ["tip1", "tip2"]
  }]
}`,
      },
    ],
    stream: false,
    max_tokens: 2048,
  });

  const parsed = extractJSON(response.choices[0]?.message?.content ?? "");
  return (parsed as { questions?: unknown[] }).questions ? parsed : { questions: [] };
}
