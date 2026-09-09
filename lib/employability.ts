/**
 * Employability score — the single, deterministic definition.
 *
 * These rules used to live inline in app/api/dashboard/route.ts, which meant
 * the dashboard could show a number with no way to explain how it was reached.
 * The Ledger needs to answer "what would move this?", and it can only do that
 * honestly if it scores with exactly the same rules the API does.
 *
 * No AI anywhere in this path — the same discipline the payment ledger follows.
 * A number a user is asked to act on has to be reproducible.
 */

export const SKILL_POINTS = 5;
export const SKILLS_MAX = 40;
export const PROFILE_MAX = 30;
export const ACTIVITY_MAX = 30;

export const CHAT_POINTS = 3;
export const SKILLS_GAP_POINTS = 5;
export const CAREER_PATH_POINTS = 5;

export interface EmployabilityInput {
  skillsCount: number;
  /** Completed profile steps out of the total the API checks. */
  profileStepsDone: number;
  profileStepsTotal: number;
  chatSessions: number;
  skillsGaps: number;
  careerPaths: number;
}

export interface ScorePart {
  score: number;
  max: number;
  pct: number;
}

export interface EmployabilityResult {
  total: number;
  skills: ScorePart;
  profile: ScorePart;
  activity: ScorePart;
  profileStrength: number;
}

function part(score: number, max: number): ScorePart {
  return { score, max, pct: max > 0 ? Math.round((score / max) * 100) : 0 };
}

export function computeEmployability(input: EmployabilityInput): EmployabilityResult {
  const profileStrength =
    input.profileStepsTotal > 0
      ? Math.round((input.profileStepsDone / input.profileStepsTotal) * 100)
      : 0;

  const skillsScore = Math.min(input.skillsCount * SKILL_POINTS, SKILLS_MAX);
  const profileScore = Math.round(profileStrength * 0.3);
  const activityScore = Math.min(
    input.chatSessions * CHAT_POINTS +
      input.skillsGaps * SKILLS_GAP_POINTS +
      input.careerPaths * CAREER_PATH_POINTS,
    ACTIVITY_MAX
  );

  return {
    total: Math.min(skillsScore + profileScore + activityScore, 100),
    skills: part(skillsScore, SKILLS_MAX),
    profile: part(profileScore, PROFILE_MAX),
    activity: part(activityScore, ACTIVITY_MAX),
    profileStrength,
  };
}

export interface NextMove {
  id: string;
  label: string;
  detail: string;
  /** Points this single action actually adds, given where you are now. */
  gain: number;
  href: string;
  kind: "skills" | "profile" | "activity";
}

/**
 * Rank the moves available from here by what each is genuinely worth.
 *
 * Every gain is computed by re-scoring with that one change applied, so a lever
 * that is already maxed out correctly reports 0 and drops off the list. This is
 * the part that makes the score actionable rather than decorative.
 */
export function nextMoves(
  input: EmployabilityInput,
  opts: { profileMissing?: Array<{ label: string; href: string }> } = {}
): NextMove[] {
  const base = computeEmployability(input).total;
  const delta = (over: Partial<EmployabilityInput>) =>
    computeEmployability({ ...input, ...over }).total - base;

  const moves: NextMove[] = [];

  // Skills — the heaviest single lever until it caps at 40.
  const skillGain = delta({ skillsCount: input.skillsCount + 1 });
  if (skillGain > 0) {
    const room = Math.max(0, Math.ceil((SKILLS_MAX - input.skillsCount * SKILL_POINTS) / SKILL_POINTS));
    moves.push({
      id: "add-skill",
      label: "Add a skill to your profile",
      detail:
        room > 1
          ? `${SKILL_POINTS} points each, ${room} more still count`
          : `${SKILL_POINTS} points — this is the last one that counts`,
      gain: skillGain,
      href: "/profile#skills",
      kind: "skills",
    });
  }

  // Profile completeness — each remaining step is worth the same slice.
  const profileGain = delta({ profileStepsDone: input.profileStepsDone + 1 });
  if (profileGain > 0) {
    const first = opts.profileMissing?.[0];
    moves.push({
      id: "complete-profile",
      label: first ? `Add your ${first.label.toLowerCase()}` : "Complete a profile step",
      detail: `${input.profileStepsTotal - input.profileStepsDone} step${
        input.profileStepsTotal - input.profileStepsDone === 1 ? "" : "s"
      } left on your profile`,
      gain: profileGain,
      href: first?.href ?? "/profile",
      kind: "profile",
    });
  }

  // Activity — using the product is itself part of the score.
  const gapGain = delta({ skillsGaps: input.skillsGaps + 1 });
  if (gapGain > 0) {
    moves.push({
      id: "run-skills-gap",
      label: "Run a skills gap analysis",
      detail: `${SKILLS_GAP_POINTS} points, and it tells you what to learn next`,
      gain: gapGain,
      href: "/skills-gap",
      kind: "activity",
    });
  }

  const pathGain = delta({ careerPaths: input.careerPaths + 1 });
  if (pathGain > 0) {
    moves.push({
      id: "run-career-path",
      label: "Simulate a career path",
      detail: `${CAREER_PATH_POINTS} points, with a five-year salary projection`,
      gain: pathGain,
      href: "/career-paths",
      kind: "activity",
    });
  }

  const chatGain = delta({ chatSessions: input.chatSessions + 1 });
  if (chatGain > 0) {
    moves.push({
      id: "coach-session",
      label: "Ask the AI career coach something",
      detail: `${CHAT_POINTS} points per conversation`,
      gain: chatGain,
      href: "/career-coach",
      kind: "activity",
    });
  }

  return moves.sort((a, b) => b.gain - a.gain);
}

/** Band label and colour for a score, shared by the ring and the Ledger. */
export function scoreBand(score: number): { label: string; colour: string } {
  return score >= 80
    ? { label: "Excellent", colour: "#3FB380" }
    : score >= 60
      ? { label: "Good", colour: "#4A5FC7" }
      : score >= 40
        ? { label: "Fair", colour: "#D9A03C" }
        : { label: "Needs work", colour: "#C4544F" };
}
