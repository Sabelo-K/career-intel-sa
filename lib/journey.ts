import { z } from "zod";
export const PersonaSchema = z.enum(["learner", "seeker", "worker"]);
export type Persona = z.infer<typeof PersonaSchema>;
export const JOURNEYS = {
  learner: { label: "I’m at school", description: "Explore subjects, careers and life after matric.", title: "Explore before you decide", steps: [
    { id: "interests", title: "Discover your interests and subjects", description: "Think about what you enjoy, then explore where your subjects can lead.", href: "/subject-choice", action: "Explore my subjects" },
    { id: "compare", title: "Compare two career possibilities", description: "Look at the skills and routes involved. Keep an alternative open.", href: "/explore", action: "Compare careers" },
    { id: "requirements", title: "Check entry requirements", description: "Use the school guide, then confirm current requirements with your chosen institution.", href: "/high-school", action: "Open school guide" },
    { id: "funding", title: "Explore funding and application dates", description: "Check eligibility and closing dates on the provider’s own website.", href: "/bursaries", action: "Explore funding" },
    { id: "conversation", title: "Talk through your options", description: "Discuss your plan with a teacher, counsellor or trusted adult. Write down your questions first.", href: "/career-coach", action: "Prepare my questions" },
  ] },
  seeker: { label: "I’m finding my way into work", description: "Recognise your strengths and explore entry routes.", title: "Find your first direction", steps: [
    { id: "strengths", title: "Recognise what you already bring", description: "Add skills from study, informal work, volunteering and daily responsibilities.", href: "/profile", action: "Build my profile" },
    { id: "compare", title: "Compare two career possibilities", description: "Explore the work and entry requirements before choosing a direction.", href: "/explore", action: "Compare careers" },
    { id: "skills", title: "Identify one skill to build", description: "Compare your experience with your target role and choose a practical learning step.", href: "/skills-gap", action: "Explore my skill gaps" },
    { id: "cv", title: "Prepare a focused CV", description: "Use real examples to explain what you can do for an employer.", href: "/cv-builder", action: "Work on my CV" },
    { id: "opportunity", title: "Find an opportunity and prepare", description: "Explore programmes, check eligibility and practise explaining your strengths.", href: "/opportunities", action: "Explore opportunities" },
  ] },
  worker: { label: "I want to grow or change careers", description: "Build on your experience, at a pace that fits your life.", title: "Make your next move manageable", steps: [
    { id: "strengths", title: "Capture your transferable skills", description: "Include the tasks you enjoy and the experience you want to build on.", href: "/profile", action: "Update my profile" },
    { id: "compare", title: "Compare possible next roles", description: "Look beyond salary: compare skills, location and the type of work.", href: "/explore", action: "Compare careers" },
    { id: "skills", title: "Choose a realistic learning route", description: "Review your skill gaps against the time and budget in your plan.", href: "/skills-gap", action: "Explore my skill gaps" },
    { id: "practice", title: "Test your interest with a small project", description: "Try the work before committing to a costly qualification or career change.", href: "/courses", action: "Explore learning options" },
    { id: "next-role", title: "Prepare for your next conversation", description: "Practise explaining how your experience applies to the role you want.", href: "/interview-prep", action: "Practise an interview" },
  ] },
} as const;
export const JourneySettingsSchema = z.object({
  persona: PersonaSchema, goal: z.string().trim().max(160),
  hoursPerWeek: z.number().int().min(0).max(80), monthlyBudget: z.number().int().min(0).max(100000),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v; }, "Choose a valid date").nullable(),
});
export const JourneyActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("settings"), version: z.number().int().nonnegative(), settings: JourneySettingsSchema }),
  z.object({ type: z.literal("task"), version: z.number().int().nonnegative(), id: z.string().max(40), completed: z.boolean() }),
  z.object({ type: z.literal("shortlist"), version: z.number().int().nonnegative(), careerId: z.string().max(100), saved: z.boolean() }),
]);
export type JourneyAction = z.infer<typeof JourneyActionSchema>;
export type JourneyState = z.infer<typeof JourneySettingsSchema> & { completedSteps: string[]; shortlist: string[]; version: number };
export function defaultJourney(persona: Persona = "learner"): JourneyState {
  return { persona, goal: "", hoursPerWeek: 3, monthlyBudget: 0, targetDate: null, completedSteps: [], shortlist: [], version: 0 };
}
export function applyJourneyAction(state: JourneyState, action: JourneyAction, careerIds: ReadonlySet<string>): JourneyState {
  if (action.version !== state.version) throw new Error("Your plan changed in another tab. Reload it before saving.");
  if (action.type === "settings") return { ...state, ...JourneySettingsSchema.parse(action.settings), completedSteps: state.persona === action.settings.persona && state.goal === action.settings.goal ? state.completedSteps : [], version: state.version + 1 };
  if (action.type === "task") {
    if (!JOURNEYS[state.persona].steps.some(step => step.id === action.id)) throw new Error("This action does not belong to your current journey.");
    return { ...state, completedSteps: action.completed ? [...new Set([...state.completedSteps, action.id])] : state.completedSteps.filter(id => id !== action.id), version: state.version + 1 };
  }
  if (!careerIds.has(action.careerId)) throw new Error("Choose a career from the catalogue.");
  const shortlist = action.saved ? [...new Set([...state.shortlist, action.careerId])] : state.shortlist.filter(id => id !== action.careerId);
  if (shortlist.length > 12) throw new Error("Your shortlist has 12 careers. Remove one before adding another.");
  return { ...state, shortlist, version: state.version + 1 };
}
