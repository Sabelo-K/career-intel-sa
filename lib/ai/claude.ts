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
  SYSTEM_PROMPT_SUPPORT_AGENT,
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

const LANGUAGE_NAMES: Record<string, string> = {
  en:  "English",
  zu:  "isiZulu",
  xh:  "isiXhosa",
  af:  "Afrikaans",
  st:  "Sesotho",
  tn:  "Setswana",
  nso: "Sepedi",
};

export async function* streamCareerCoach(
  messages: Message[],
  systemContext?: string,
  language?: string
) {
  const langInstruction = language && language !== "en"
    ? `\n\nIMPORTANT: The user has selected ${LANGUAGE_NAMES[language] ?? language} as their language. Always respond in ${LANGUAGE_NAMES[language] ?? language}. Keep all career terminology accurate and use South African context throughout.`
    : "";

  const systemPrompt = systemContext
    ? `${SYSTEM_PROMPT_CAREER_COACH}${langInstruction}\n\nAdditional context: ${systemContext}`
    : `${SYSTEM_PROMPT_CAREER_COACH}${langInstruction}`;

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

// ─── Support Agent (streaming) ───────────────────────────────────────────────

export async function* streamSupportAgent(messages: Message[]) {
  const stream = await groq.chat.completions.create({
    model:       MODEL,
    messages:    buildMessages(messages, SYSTEM_PROMPT_SUPPORT_AGENT),
    stream:      true,
    max_tokens:  512,   // Support answers should be short and direct
    temperature: 0.3,   // Lower temp = more consistent, factual responses
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

// ─── CV Revamp (parse + AI rewrite + deterministic scoring) ───────────────────

export interface RevampOptions {
  targetRole?: string;       // role the user is applying for
  jobDescription?: string;   // pasted job posting to optimise against
}

export async function parseAndRevampCV(cvText: string, opts: RevampOptions = {}) {
  const { getTargetKeywords, scoreCv, toScoreable } = await import("@/lib/ats-score");

  // Keyword set to optimise against — from your own SA-careers data + the JD.
  const targetKeywords = getTargetKeywords(opts.targetRole, opts.jobDescription);

  const keywordGuidance = targetKeywords.length
    ? `\nTARGET KEYWORDS (weave these in naturally ONLY where truthful for this person — never fabricate experience to fit them): ${targetKeywords.join(", ")}`
    : "";
  const roleGuidance = opts.targetRole
    ? `\nThe candidate is targeting this role: "${opts.targetRole}". Prioritise relevant experience and terminology for it.`
    : "";
  const jdGuidance = opts.jobDescription
    ? `\nJOB DESCRIPTION they are applying to (mirror its language where the candidate genuinely matches):\n${opts.jobDescription.slice(0, 1500)}`
    : "";

  const response = await groq.chat.completions.create({
    model: MODEL,
    // Enforce a JSON object so parsing can't silently fail on stray prose.
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert South African CV specialist, ATS optimiser, and senior recruiter with 20+ years experience.
You parse CVs and simultaneously rewrite them for maximum impact in the SA job market.
You understand SA-specific requirements: NQF levels, B-BBEE, SAQA, POPIA, province names.
HONESTY RULE: never invent employers, roles, qualifications, or specific numbers the candidate did not provide. Where a quantified outcome would strengthen a bullet but no number exists, insert a clearly-marked placeholder like "[quantify: e.g. by __%]" for the candidate to complete — do NOT fabricate a figure.
Respond with valid JSON ONLY — no markdown, no text outside the JSON block.`,
      },
      {
        role: "user",
        content: `Parse and professionally revamp this CV for the South African job market.${roleGuidance}${keywordGuidance}${jdGuidance}

INSTRUCTIONS:
1. Extract ALL personal information: full name, email, phone, city/town, SA province, LinkedIn URL, website.
2. Rewrite the professional summary to 2–3 powerful, specific sentences tailored to this person's actual background — mention their industry, years of experience, and key strengths. Make it ATS-optimised and SA-relevant. Do NOT write a generic summary.
3. For each job role, write EXACTLY 5 to 7 achievement-focused bullet points based on what this person ACTUALLY did. Follow these rules strictly:
   - Use a DIFFERENT strong action verb to start each bullet point — vary vocabulary widely (e.g. Spearheaded, Streamlined, Championed, Engineered, Negotiated, Deployed, Reduced, Grew, Secured, Delivered, Overhauled, Introduced, Accelerated, Conceptualised, Drove, Established)
   - Each bullet must reflect the SPECIFIC role, industry, and responsibilities described in the original CV — do not write generic bullets that could apply to any job
   - Aim for a quantified outcome per bullet. If the original CV states a metric, use it. If NOT, insert a placeholder like "[quantify: e.g. by __%]" — NEVER invent a specific number.
   - Tailor language to the SA market (e.g. reference relevant legislation, tools, or SA-specific context where appropriate)
   - Separate each bullet with \\n in the JSON string
   - Never write fewer than 5 bullets per role
4. Estimate NQF level if not stated (Matric=4, Higher Cert=5, Diploma/ND=6, Degree=7, Honours/PGDip=8, Masters=9, PhD=10)
5. Extract all skills from the CV. Also include any TARGET KEYWORDS above that the candidate genuinely has evidence for.
6. Give 3-5 specific suggestions, and note strengths/weaknesses honestly.

CV TEXT:
---
${cvText.slice(0, 9000)}
---

Return ONLY valid JSON in this exact structure:
{
  "personal": { "fullName": "", "email": "", "phone": "", "location": "", "province": "", "linkedin": "", "website": "" },
  "summary": "Specific 2-3 sentence summary tailored to this person",
  "experience": [
    { "jobTitle": "", "company": "", "startDate": "Month YYYY", "endDate": "Month YYYY", "current": false,
      "description": "Bullet 1\\nBullet 2\\nBullet 3\\nBullet 4\\nBullet 5" }
  ],
  "education": [
    { "institution": "", "qualification": "", "fieldOfStudy": "", "yearCompleted": "", "nqfLevel": "7" }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "certifications": ["Cert 1"],
  "suggestions": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}`,
      },
    ],
    stream: false,
    max_tokens: 4096,
    temperature: 0.4,
  });

  const raw = extractJSON(response.choices[0]?.message?.content ?? "");

  const skills = Array.isArray(raw.skills) ? (raw.skills as string[]) : [];
  const experience = Array.isArray(raw.experience)
    ? (raw.experience as Record<string, unknown>[]).map((e, i) => ({ id: String(i), ...e }))
    : [];
  const education = Array.isArray(raw.education)
    ? (raw.education as Record<string, unknown>[]).map((e, i) => ({ id: String(i), ...e }))
    : [];
  const certifications = Array.isArray(raw.certifications) ? (raw.certifications as string[]) : [];

  const revampedCv = { ...raw, skills, experience, education, certifications };

  // ── Deterministic scoring: original text vs the revamped CV, same keyword set.
  const original = scoreCv(
    { fullText: cvText, hasExperience: true, hasEducation: /education|qualification|degree|matric/i.test(cvText), skills: [] },
    targetKeywords
  );
  const revamped = scoreCv(toScoreable(revampedCv), targetKeywords);

  return {
    ...revampedCv,
    improvedSummary: (raw.summary as string) || "",
    extractedSkills: skills,
    // Real, computed scores — override any model guess.
    atsScore:            revamped.atsScore,
    recruiterScore:      revamped.recruiterScore,
    keywordMatch:        revamped.keywordMatch,
    matchedKeywords:     revamped.matchedKeywords,
    missingKeywords:     revamped.missingKeywords,
    scoreBreakdown:      revamped.breakdown,
    originalAtsScore:    original.atsScore,
    originalRecruiterScore: original.recruiterScore,
    targetKeywords,
  };
}
