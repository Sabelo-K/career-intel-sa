export type XpAction =
  | "daily_login"
  | "profile_field"
  | "cv_upload"
  | "cv_analyse"
  | "skills_gap"
  | "career_coach"
  | "career_path"
  | "interview_prep"
  | "job_alert"
  | "salary_check"
  | "degree_roi"
  | "matric_match";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  xpReward: number;
}

export const XP_VALUES: Record<XpAction, number> = {
  daily_login:    10,
  profile_field:   5,
  cv_upload:      50,
  cv_analyse:     25,
  skills_gap:     40,
  career_coach:   20,
  career_path:    35,
  interview_prep: 30,
  job_alert:      15,
  salary_check:   10,
  degree_roi:     10,
  matric_match:   10,
};

export const BADGES: Badge[] = [
  { id: "first_step",      name: "First Step",        description: "Logged in for the first time",            icon: "👟", xpReward: 20  },
  { id: "cv_warrior",      name: "CV Warrior",         description: "Uploaded your CV",                        icon: "📄", xpReward: 50  },
  { id: "skill_scout",     name: "Skill Scout",        description: "Ran your first skills gap analysis",      icon: "🔍", xpReward: 40  },
  { id: "coach_chat",      name: "Coach Chat",         description: "Started your first Career Coach session", icon: "🤖", xpReward: 25  },
  { id: "path_planner",    name: "Path Planner",       description: "Simulated a 5-year career path",          icon: "🗺️", xpReward: 35  },
  { id: "alert_setter",    name: "Alert Setter",       description: "Set up your first job alert",             icon: "🔔", xpReward: 15  },
  { id: "interview_ace",   name: "Interview Ace",      description: "Completed your first mock interview",     icon: "🎤", xpReward: 30  },
  { id: "streak_3",        name: "On a Roll",          description: "3-day activity streak",                   icon: "🔥", xpReward: 30  },
  { id: "streak_7",        name: "Unstoppable",        description: "7-day activity streak",                   icon: "⚡", xpReward: 75  },
  { id: "salary_sleuth",   name: "Salary Sleuth",      description: "Used the Salary Checker",                 icon: "💰", xpReward: 10  },
  { id: "roi_thinker",     name: "ROI Thinker",        description: "Explored Degree ROI",                     icon: "📊", xpReward: 10  },
  { id: "profile_complete",name: "Profile Pro",        description: "Completed your profile",                  icon: "⭐", xpReward: 100 },
  { id: "century",         name: "Century",            description: "Earned 100 XP",                           icon: "💯", xpReward: 0   },
  { id: "five_hundred",    name: "High Achiever",      description: "Earned 500 XP",                           icon: "🏆", xpReward: 0   },
];

export const LEVELS = [
  { min: 0,    max: 99,   label: "Starter",        color: "#6b7280" },
  { min: 100,  max: 299,  label: "Explorer",       color: "#6366f1" },
  { min: 300,  max: 599,  label: "Career Builder", color: "#8b5cf6" },
  { min: 600,  max: 999,  label: "Career Ready",   color: "#10b981" },
  { min: 1000, max: Infinity, label: "Career Champion", color: "#f59e0b" },
];

export function getLevel(xp: number) {
  return LEVELS.find((l) => xp >= l.min && xp <= l.max) ?? LEVELS[0];
}

export function getNextLevelThreshold(xp: number): number {
  const next = LEVELS.find((l) => l.min > xp);
  return next ? next.min : xp; // at max level
}

export function getLevelProgress(xp: number): number {
  const current = LEVELS.find((l) => xp >= l.min && xp <= l.max) ?? LEVELS[0];
  if (current.max === Infinity) return 100;
  const range = current.max - current.min + 1;
  const earned = xp - current.min;
  return Math.round((earned / range) * 100);
}

export function checkNewBadges(
  action: XpAction,
  currentBadges: string[],
  totalXp: number,
  streak: number,
  context?: {
    hasCv?: boolean;
    hasSkillsGap?: boolean;
    hasCareerCoach?: boolean;
    hasCareerPath?: boolean;
    hasJobAlert?: boolean;
    hasInterviewPrep?: boolean;
    profileComplete?: boolean;
  }
): string[] {
  const earned: string[] = [];

  const maybeAward = (id: string) => {
    if (!currentBadges.includes(id) && !earned.includes(id)) earned.push(id);
  };

  if (action === "daily_login" && !currentBadges.includes("first_step")) maybeAward("first_step");
  if (action === "cv_upload")       maybeAward("cv_warrior");
  if (action === "skills_gap")      maybeAward("skill_scout");
  if (action === "career_coach")    maybeAward("coach_chat");
  if (action === "career_path")     maybeAward("path_planner");
  if (action === "job_alert")       maybeAward("alert_setter");
  if (action === "interview_prep")  maybeAward("interview_ace");
  if (action === "salary_check")    maybeAward("salary_sleuth");
  if (action === "degree_roi")      maybeAward("roi_thinker");

  if (streak >= 3 && !currentBadges.includes("streak_3"))  maybeAward("streak_3");
  if (streak >= 7 && !currentBadges.includes("streak_7"))  maybeAward("streak_7");

  if (totalXp >= 100 && !currentBadges.includes("century"))      maybeAward("century");
  if (totalXp >= 500 && !currentBadges.includes("five_hundred")) maybeAward("five_hundred");

  if (context?.profileComplete && !currentBadges.includes("profile_complete")) maybeAward("profile_complete");

  return earned;
}
