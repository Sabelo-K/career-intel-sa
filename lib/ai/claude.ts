/**
 * AI layer — powered by Google Gemini 2.0 Flash (free tier)
 * Previously used Anthropic Claude; function signatures are preserved
 * so the rest of the codebase requires no changes.
 */
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import {
  SYSTEM_PROMPT_CAREER_COACH,
  SYSTEM_PROMPT_CV_PARSER,
  SYSTEM_PROMPT_SKILLS_GAP,
  buildCareerPathPrompt,
  buildEmployabilityPrompt,
} from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const MODEL = "gemini-1.5-flash";

/** Create a model instance with an optional system instruction. */
function getModel(systemInstruction?: string, maxOutputTokens = 1024) {
  return genAI.getGenerativeModel({
    model: MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: { maxOutputTokens },
  });
}

/**
 * Convert our internal message format to Gemini's Content format.
 * Anthropic uses "assistant"; Gemini uses "model".
 */
function toGeminiHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Content[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
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
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext?: string
) {
  const systemInstruction = systemContext
    ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
    : SYSTEM_PROMPT_CAREER_COACH;

  const model = getModel(systemInstruction, 1024);

  // All messages except the last become chat history
  const history = toGeminiHistory(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.content);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// ─── Career Coach (non-streaming fallback) ───────────────────────────────────

export async function chatWithCareerCoach(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext?: string
) {
  const systemInstruction = systemContext
    ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
    : SYSTEM_PROMPT_CAREER_COACH;

  const model = getModel(systemInstruction, 1024);
  const history = toGeminiHistory(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

// ─── CV Parser ───────────────────────────────────────────────────────────────

export async function parseCV(cvText: string) {
  const model = getModel(SYSTEM_PROMPT_CV_PARSER, 2048);
  const result = await model.generateContent(
    `Parse this CV and return structured JSON:\n\n${cvText}`
  );
  return extractJSON(result.response.text());
}

// ─── CV Analyser ─────────────────────────────────────────────────────────────

export async function analyzeCV(cvData: Record<string, unknown>) {
  const model = getModel(
    `You are an expert ATS optimisation specialist and SA recruiter.
Analyse CVs and provide detailed improvement recommendations.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`,
    2048
  );

  const result = await model.generateContent(`Analyse this CV for the South African job market and provide:
1. ATS score (0-100) — how well it passes applicant tracking systems
2. Recruiter score (0-100) — how compelling it is to SA recruiters
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
}`);

  return extractJSON(result.response.text());
}

// ─── Skills Gap Analysis ──────────────────────────────────────────────────────

export async function analyzeSkillsGap(params: {
  currentSkills: string[];
  targetRole: string;
  yearsExperience: number;
  education: string;
}) {
  const model = getModel(SYSTEM_PROMPT_SKILLS_GAP, 2048);

  const result = await model.generateContent(`Analyse the skills gap for this South African professional:

Current Skills: ${params.currentSkills.join(", ")}
Target Role: ${params.targetRole}
Years of Experience: ${params.yearsExperience}
Education: ${params.education}

Provide detailed gap analysis. Return as JSON:
{
  "matchPercentage": number,
  "missingSkills": [{ "skill": "", "priority": "HIGH|MEDIUM|LOW", "demandScore": number, "timeToLearnWeeks": number, "reason": "" }],
  "learningPath": [{ "order": number, "title": "", "description": "", "skills": [], "resources": [], "estimatedWeeks": number }],
  "estimatedMonths": number,
  "quickWins": ["skill1", ...],
  "salaryImpact": "string"
}`);

  return extractJSON(result.response.text());
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
  const model = getModel(undefined, 2048);
  const result = await model.generateContent(buildCareerPathPrompt(params));
  return extractJSON(result.response.text());
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
  const model = getModel(undefined, 1024);
  const result = await model.generateContent(buildEmployabilityPrompt(profile));
  return extractJSON(result.response.text());
}

// ─── Interview Question Generator ────────────────────────────────────────────

export async function generateInterviewQuestions(params: {
  role: string;
  level: string;
  industry: string;
}) {
  const model = getModel(undefined, 2048);

  const result = await model.generateContent(
    `Generate 10 realistic interview questions for a ${params.level} ${params.role} position in the South African ${params.industry} industry.

Include a mix of:
- Behavioural questions (STAR method)
- Technical questions
- Situational questions
- SA-specific questions (load shedding resilience, team diversity, local market knowledge)

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
}`
  );

  const parsed = extractJSON(result.response.text());
  return (parsed as { questions?: unknown[] }).questions
    ? parsed
    : { questions: [] };
}
