import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Degree ROI Calculator";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Free Tool · No Sign-up",
    title: "Is your degree worth it?",
    subtitle: "See the real 10-year ROI of 12 SA degrees vs going straight to work or TVET. Free calculator.",
    accent: "#a78bfa",
  });
}
