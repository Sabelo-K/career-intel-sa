import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(amount: number): string {
  if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `R${(amount / 1_000).toFixed(0)}k`;
  return `R${amount}`;
}

export function formatSalaryRange(min: number, max: number): string {
  return `${formatSalary(min)} – ${formatSalary(max)} p/m`;
}

export function getDemandColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-blue-400";
  if (score >= 55) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function getDemandBadgeColor(score: number): string {
  if (score >= 85) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score >= 70) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  if (score >= 55) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (score >= 40) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function getTrendIcon(trend: string): string {
  switch (trend) {
    case "EXPLOSIVE_GROWTH": return "🚀";
    case "STRONG_GROWTH": return "📈";
    case "GROWING": return "↗️";
    case "STABLE": return "→";
    case "DECLINING": return "📉";
    default: return "→";
  }
}

export function getTrendLabel(trend: string): string {
  switch (trend) {
    case "EXPLOSIVE_GROWTH": return "Explosive Growth";
    case "STRONG_GROWTH": return "Strong Growth";
    case "GROWING": return "Growing";
    case "STABLE": return "Stable";
    case "DECLINING": return "Declining";
    default: return trend;
  }
}

export function getProvinceLabel(province: string): string {
  const labels: Record<string, string> = {
    GAUTENG: "Gauteng",
    WESTERN_CAPE: "Western Cape",
    KWAZULU_NATAL: "KwaZulu-Natal",
    EASTERN_CAPE: "Eastern Cape",
    FREE_STATE: "Free State",
    LIMPOPO: "Limpopo",
    MPUMALANGA: "Mpumalanga",
    NORTH_WEST: "North West",
    NORTHERN_CAPE: "Northern Cape",
  };
  return labels[province] || province;
}

export function getAutomationRiskLabel(risk: number): { label: string; color: string } {
  if (risk >= 75) return { label: "High Risk", color: "text-red-400" };
  if (risk >= 50) return { label: "Medium Risk", color: "text-yellow-400" };
  if (risk >= 25) return { label: "Low Risk", color: "text-blue-400" };
  return { label: "Minimal Risk", color: "text-emerald-400" };
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function calculateEmployabilityScore(profile: {
  skills: string[];
  yearsExperience?: number;
  educationLevel?: string;
  hasCV?: boolean;
  targetRoleSet?: boolean;
}): number {
  let score = 0;
  score += Math.min(profile.skills.length * 3, 30);
  score += Math.min((profile.yearsExperience || 0) * 4, 20);
  if (profile.educationLevel) {
    const eduScores: Record<string, number> = {
      PHD: 20, MASTERS: 18, HONOURS: 16, DEGREE: 14,
      ADVANCED_DIPLOMA: 12, DIPLOMA: 10, CERTIFICATE: 8, GRADE_12_MATRIC: 5,
    };
    score += eduScores[profile.educationLevel] || 5;
  }
  if (profile.hasCV) score += 10;
  if (profile.targetRoleSet) score += 10;
  if (profile.skills.length > 0) score += 10;
  return Math.min(Math.round(score), 100);
}
