import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Which careers do your school subjects open?";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Free Tool · Grades 9–11",
    title: "Which careers do your subjects open?",
    subtitle: "Pick the subjects you enjoy and see what unlocks — and what dropping Mathematics really closes.",
    accent: "#818cf8",
  });
}
