import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Am I Underpaid? Free SA Salary Checker";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Free Tool · No Sign-up",
    title: "Am I Underpaid?",
    subtitle: "Check your salary against the SA market in 30 seconds. Role + province + experience = instant ZAR benchmark.",
    accent: "#34d399",
  });
}
