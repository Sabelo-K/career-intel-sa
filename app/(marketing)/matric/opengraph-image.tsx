import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Matric Results Career Matcher";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Free Tool · No Sign-up",
    title: "What can I study with my matric results?",
    subtitle: "Enter your symbols → get your APS score, matching university programmes, and career paths. Free.",
    accent: "#fbbf24",
  });
}
