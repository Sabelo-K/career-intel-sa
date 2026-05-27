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

// ─── CV Revamp (parse + AI rewrite in one call) ───────────────────────────────

export async function parseAndRevampCV(cvText: string) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert South African CV specialist, ATS optimiser, and senior recruiter with 20+ years experience.
You parse CVs and simultaneously rewrite them for maximum impact in the SA job market.
You understand SA-specific requirements: NQF levels, B-BBEE, SAQA, POPIA, province names.
Respond with valid JSON ONLY — no markdown, no text outside the JSON block.`,
      },
      {
        role: "user",
        content: `Parse and professionally revamp this CV for the South African job market.

INSTRUCTIONS:
1. Extract ALL information: full name, email, phone, city/town, SA province, LinkedIn URL, website
2. Rewrite the professional summary to 2–3 powerful sentences — specific, ATS-optimised, SA-relevant
3. For each job: write EXACTLY 5 to 7 bullet points. Each point must use a strong action verb and include a quantified outcome (numbers, percentages, rand values, team sizes, timeframes). Separate each point with \\n (literal backslash-n in the JSON string). Never write fewer than 5 points per job — expand and infer reasonable metrics if the original CV is thin on detail.
4. Estimate NQF level if not stated (Matric=4, Higher Cert=5, Diploma/ND=6, Degree=7, Honours/PGDip=8, Masters=9, PhD=10)
5. Extract all skills from the CV and add up to 5 high-demand SA market keywords that match their background
6. Score the ORIGINAL CV honestly before improvements (be realistic)

CV TEXT:
---
${cvText.slice(0, 6000)}
---

Return ONLY valid JSON in this exact structure:
{
  "personal": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "province": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "2-3 sentence AI-rewritten professional summary",
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "Month YYYY",
      "endDate": "Month YYYY",
      "current": false,
      "description": "Led X initiative that achieved Y, resulting in Z quantified outcome\\nDeveloped and implemented A, improving B by X%\\nManaged team of X people to deliver C within D timeframe\\nCollaborated with E stakeholders to design and roll out F, increasing G by H%\\nOptimised I process, reducing J by K% and saving RX per year"
    }
  ],
  "education": [
    {
      "institution": "",
      "qualification": "",
      "fieldOfStudy": "",
      "yearCompleted": "",
      "nqfLevel": "7"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "certifications": ["Cert 1"],
  "atsScore": 65,
  "recruiterScore": 70,
  "suggestions": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "missingKeywords": ["Keyword1", "Keyword2", "Keyword3"]
}`,
      },
    ],
    stream: false,
    max_tokens: 3500,
    temperature: 0.2,
  });

  const raw = extractJSON(response.choices[0]?.message?.content ?? "");

  // Normalise to include the field names the UI components expect
  const skills = Array.isArray(raw.skills) ? (raw.skills as string[]) : [];
  return {
    ...raw,
    improvedSummary: (raw.summary as string) || "",
    extractedSkills: skills,
    // Ensure arrays have string IDs so CVBuiltData is satisfied
    experience: Array.isArray(raw.experience)
      ? (raw.experience as Record<string, unknown>[]).map((e, i) => ({ id: String(i), ...e }))
      : [],
    education: Array.isArray(raw.education)
      ? (raw.education as Record<string, unknown>[]).map((e, i) => ({ id: String(i), ...e }))
      : [],
    certifications: Array.isArray(raw.certifications) ? (raw.certifications as string[]) : [],
  };
}
