import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const alt = "CareerIntel SA — AI Career Intelligence Platform";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "AI Career Intelligence",
    title: "Your Career, Intelligently Engineered for SA",
    subtitle: "Salary benchmarks, skills gap analysis & AI coaching for 249+ SA careers. Free to start.",
    accent: "#818cf8",
  });
}
