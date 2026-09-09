/**
 * Dynamic salary share card.
 *
 * A pasted line of text lands in WhatsApp as a grey blob nobody taps. An image
 * travels. This renders the Probe's verdict as a branded 1200x630 card using the
 * same builder as every other share image on the site, so a result someone is
 * proud (or annoyed) enough to forward arrives as a picture.
 *
 * Example:
 *   /api/og/salary?role=Professional%20Nurse&province=KwaZulu-Natal
 *     &avg=37500&verdict=underpaid&pct=56
 */
import { renderOgImage } from "@/lib/og";
import { formatZar } from "@/lib/data/salary-model";

export const runtime = "edge";

/** Accent per verdict — seal red for underpaid, emerald for fair, indigo otherwise. */
const ACCENT: Record<string, string> = {
  underpaid: "#C6605C",
  fair: "#34d399",
  overpaid: "#818cf8",
};

/** Trim untrusted query text so a long value cannot break the card layout. */
function clean(value: string | null, max: number): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}


export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const role = clean(searchParams.get("role"), 46);
  const province = clean(searchParams.get("province"), 24);
  const verdict = clean(searchParams.get("verdict"), 12).toLowerCase();
  const avgRaw = parseInt((searchParams.get("avg") ?? "").replace(/\D/g, ""), 10);
  const pctRaw = parseInt((searchParams.get("pct") ?? "").replace(/\D/g, ""), 10);

  const avg = Number.isFinite(avgRaw) && avgRaw > 0 ? avgRaw : null;
  const pct = Number.isFinite(pctRaw) && pctRaw > 0 ? Math.min(999, pctRaw) : null;

  // No result to show — render the tool's generic card. This route is the ONLY
  // source of /salary-check's share image: the folder's static
  // opengraph-image.tsx was removed, because Next gives file-based metadata
  // precedence over config-based, so it would have silently won over the
  // personalised card that generateMetadata sets.
  if (!role || !avg) {
    return renderOgImage({
      eyebrow: "Free Tool · No Sign-up",
      title: "Am I Underpaid?",
      subtitle:
        "Check your salary against the SA market in 30 seconds. Role + province + experience = instant ZAR benchmark.",
      accent: "#34d399",
    });
  }

  const eyebrow =
    verdict === "underpaid"
      ? "Underpaid"
      : verdict === "fair"
        ? "Earning market rate"
        : verdict === "overpaid"
          ? "Above market rate"
          : "SA Salary Benchmark";

  const subtitleParts = [
    province ? `Market average in ${province}` : "South African market average",
    pct && verdict === "underpaid" ? `This person is on ${pct}% of it` : null,
  ].filter(Boolean);

  return renderOgImage({
    eyebrow,
    title: `${role} earns ${formatZar(avg)}/month`,
    subtitle: `${subtitleParts.join(" · ")} · Check yours free, no sign-up`,
    accent: ACCENT[verdict] ?? "#818cf8",
  });
}
