import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT_CAREER_COACH,
  SYSTEM_PROMPT_CV_PARSER,
  SYSTEM_PROMPT_SKILLS_GAP,
  buildCareerPathPrompt,
  buildEmployabilityPrompt,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-6";

export async function chatWithCareerCoach(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext?: string
) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemContext
      ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
      : SYSTEM_PROMPT_CAREER_COACH,
    messages,
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function* streamCareerCoach(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext?: string
) {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemContext
      ? `${SYSTEM_PROMPT_CAREER_COACH}\n\nAdditional context: ${systemContext}`
      : SYSTEM_PROMPT_CAREER_COACH,
    messages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      yield chunk.delta.text;
    }
  }
}

export async function parseCV(cvText: string) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT_CV_PARSER,
    messages: [
      {
        role: "user",
        content: `Parse this CV and return structured JSON:\n\n${cvText}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

export async function analyzeCV(cvData: Record<string, unknown>) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are an expert ATS optimization specialist and SA recruiter. Analyze CVs and provide detailed improvement recommendations.`,
    messages: [
      {
        role: "user",
        content: `Analyze this CV for the South African job market and provide:
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
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

export async function analyzeSkillsGap(params: {
  currentSkills: string[];
  targetRole: string;
  yearsExperience: number;
  education: string;
}) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT_SKILLS_GAP,
    messages: [
      {
        role: "user",
        content: `Analyze the skills gap for this South African professional:

Current Skills: ${params.currentSkills.join(", ")}
Target Role: ${params.targetRole}
Years of Experience: ${params.yearsExperience}
Education: ${params.education}

Provide detailed gap analysis. Return as JSON:
{
  "matchPercentage": number,
  "missingSkills": [{ "skill", "priority", "demandScore", "timeToLearnWeeks", "reason" }],
  "learningPath": [{ "order", "title", "description", "skills", "resources", "estimatedWeeks" }],
  "estimatedMonths": number,
  "quickWins": ["skill1", ...],
  "salaryImpact": "string"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

export async function simulateCareerPath(params: {
  currentRole: string;
  targetRole: string;
  yearsExperience: number;
  currentSkills: string[];
  province: string;
  timeframeYears: number;
}) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildCareerPathPrompt(params),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

export async function calculateEmployabilityScore(profile: {
  currentRole?: string;
  targetRole?: string;
  skills: string[];
  education?: string;
  yearsExperience?: number;
  province?: string;
}) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: buildEmployabilityPrompt(profile),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

export async function generateInterviewQuestions(params: {
  role: string;
  level: string;
  industry: string;
}) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Generate 10 realistic interview questions for a ${params.level} ${params.role} position in the South African ${params.industry} industry.

Include a mix of:
- Behavioral questions (STAR method)
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
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
  } catch {
    return { questions: [] };
  }
}
