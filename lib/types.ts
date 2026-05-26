export type Plan = "FREE" | "PREMIUM" | "RECRUITER" | "ENTERPRISE";
export type Province =
  | "GAUTENG" | "WESTERN_CAPE" | "KWAZULU_NATAL" | "EASTERN_CAPE"
  | "FREE_STATE" | "LIMPOPO" | "MPUMALANGA" | "NORTH_WEST" | "NORTHERN_CAPE";
export type GrowthTrend = "DECLINING" | "STABLE" | "GROWING" | "STRONG_GROWTH" | "EXPLOSIVE_GROWTH";
export type FutureOutlook = "POOR" | "FAIR" | "GOOD" | "EXCELLENT" | "EXCEPTIONAL";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  currentRole?: string;
  targetRole?: string;
  province?: Province;
  yearsExperience?: number;
  skills: string[];
  employabilityScore?: number;
}

export interface CareerDemandData {
  id: string;
  title: string;
  sector: string;
  demandScore: number;
  growthTrend: GrowthTrend;
  futureOutlook: FutureOutlook;
  automationRisk: number;
  remoteFriendly: boolean;
  internationalDemand: boolean;
  minSalaryZar: number;
  maxSalaryZar: number;
  avgSalaryZar: number;
  topSkills: string[];
  topProvinces: string[];
  nqfLevel?: number;
  relatedCareers: string[];
}

export interface SkillsGapResult {
  targetRole: string;
  currentSkillsMatch: number;
  missingSkills: MissingSkill[];
  learningPath: LearningStep[];
  estimatedMonths: number;
}

export interface MissingSkill {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  demandScore: number;
  timeToLearnWeeks: number;
  courses: CourseRecommendation[];
}

export interface LearningStep {
  order: number;
  title: string;
  description: string;
  skills: string[];
  resources: string[];
  estimatedWeeks: number;
}

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  platform: string;
  url: string;
  price: number | "free";
  durationHours: number;
  rating: number;
  skills: string[];
  nqfLevel?: number;
}

export interface CVAnalysis {
  atsScore: number;
  recruiterScore: number;
  extractedSkills: string[];
  extractedEducation: EducationEntry[];
  extractedExperience: ExperienceEntry[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  improvedSummary: string;
}

export interface EducationEntry {
  institution: string;
  qualification: string;
  field: string;
  year?: number;
  nqfLevel?: number;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string | "Present";
  description: string;
  skills: string[];
}

export interface CareerPathSimulation {
  currentRole: string;
  targetRole: string;
  timeframeYears: number;
  milestones: CareerMilestone[];
  salaryProjection: SalaryPoint[];
  requiredCertifications: string[];
  promotionProbability: number;
}

export interface CareerMilestone {
  year: number;
  role: string;
  salary: number;
  skills: string[];
  achievement: string;
}

export interface SalaryPoint {
  year: number;
  salary: number;
  label: string;
}

export interface ProvinceData {
  code: Province;
  name: string;
  topSectors: string[];
  topCareers: string[];
  avgSalary: number;
  jobGrowthRate: number;
  unemploymentRate: number;
}

export interface DashboardStats {
  employabilityScore: number;
  careerMatchScore: number;
  skillsCompletion: number;
  profileStrength: number;
  topMatchingCareers: CareerDemandData[];
  recentInsights: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational" | "competency";
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer?: string;
  tips?: string[];
}
