import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";
import { applyJourneyAction, defaultJourney, JourneyActionSchema, PersonaSchema, type JourneyState } from "@/lib/journey";
import { WEAVE_CAREERS } from "@/lib/data/weave-index.generated";
export const dynamic = "force-dynamic";
const ids = new Set(WEAVE_CAREERS.map(c => c.id));
const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
async function user() {
  const { userId } = await auth();
  if (!userId) return null;
  const existing = await db.user.findUnique({ where: { clerkId: userId }, include: { profile: true } });
  if (existing) return existing;
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress;
  if (!email || email.verification?.status !== "verified") return null;
  const created = await getOrCreateUser(userId, email.emailAddress, clerkUser?.fullName);
  return { ...created, profile: null };
}
export async function GET() {
  try {
    const u = await user();
    if (!u) return respond({ error: "Sign in with a verified email to save your plan." }, 401);
    const journey = await db.careerJourney.findUnique({ where: { userId: u.id } });
    const education = u.profile?.educationLevel;
    const persona = education === "GRADE_10" || education === "GRADE_11" ? "learner" : u.profile?.currentRole ? "worker" : "seeker";
    return respond({ journey: journey ?? { ...defaultJourney(persona), goal: u.profile?.targetRole ?? "" }, saved: !!journey });
  } catch { return respond({ error: "We couldn’t load your plan. Please try again." }, 503); }
}
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return respond({ error: "Request origin not allowed." }, 403);
  try {
    const u = await user();
    if (!u) return respond({ error: "Sign in with a verified email to save your plan." }, 401);
    const text = await req.text();
    if (text.length > 8192) return respond({ error: "Request too large." }, 413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return respond({ error: "Invalid request." }, 400); }
    const parsed = JourneyActionSchema.safeParse(body);
    if (!parsed.success) return respond({ error: "Check the plan fields and try again." }, 400);
    const stored = await db.careerJourney.upsert({ where: { userId: u.id }, create: { userId: u.id, ...defaultJourney(u.profile?.educationLevel === "GRADE_10" || u.profile?.educationLevel === "GRADE_11" ? "learner" : u.profile?.currentRole ? "worker" : "seeker"), goal: u.profile?.targetRole ?? "" }, update: {} });
    const state: JourneyState = { ...stored, persona: PersonaSchema.parse(stored.persona) };
    if (state.version !== parsed.data.version) return respond({ error: "Your plan changed in another tab. Reload before saving." }, 409);
    let next: JourneyState;
    try { next = applyJourneyAction(state, parsed.data, ids); } catch (e) { return respond({ error: (e as Error).message }, 400); }
    const updated = await db.$transaction(async tx => { const result = await tx.careerJourney.updateMany({ where: { userId: u.id, version: parsed.data.version }, data: {
      persona: next.persona, goal: next.goal, hoursPerWeek: next.hoursPerWeek, monthlyBudget: next.monthlyBudget,
      targetDate: next.targetDate, completedSteps: next.completedSteps, shortlist: next.shortlist, version: next.version,
    } });
      if (result.count === 1 && parsed.data.type === "settings" && WEAVE_CAREERS.some(c => c.title === next.goal)) {
        await tx.profile.upsert({ where: { userId: u.id }, create: { userId: u.id, targetRole: next.goal }, update: { targetRole: next.goal } });
      }
      return result;
    });
    if (updated.count !== 1) return respond({ error: "Your plan changed in another tab. Reload before saving." }, 409);
    return respond({ journey: next, saved: true });
  } catch { return respond({ error: "We couldn’t save your plan. Your changes have not been confirmed. Please retry." }, 503); }
}
