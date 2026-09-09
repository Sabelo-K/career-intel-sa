/**
 * Salary check — server wrapper.
 *
 * Exists so this route can build a PERSONALISED share card. The interactive
 * tool is a client component, and client components cannot export
 * generateMetadata; a layout can, but Next only passes `searchParams` to a
 * page. So the page is a thin server component that reads the query string and
 * points og:image at /api/og/salary, and the tool itself lives in
 * salary-check-client.tsx.
 *
 * Without this, a result shared from the landing-page Probe fell back to the
 * static opengraph-image.tsx in this folder — the generic "Am I Underpaid?"
 * card, with none of the sharer's own figures on it.
 *
 * A plain visit to /salary-check carries no params and deliberately keeps the
 * static card.
 */
import type { Metadata } from "next";
import SalaryCheckClient from "./salary-check-client";
import { formatZar } from "@/lib/data/salary-model";

const SITE = "https://careerintelsa.co.za";

/** Query values are untrusted: trim, cap length, and drop anything unusable. */
function text(value: string | string[] | undefined, max: number): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const clean = raw.replace(/\s+/g, " ").trim().slice(0, max);
  return clean.length > 0 ? clean : null;
}

function positiveInt(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const VERDICTS = new Set(["underpaid", "fair", "overpaid"]);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;

  const role = text(sp.role, 46);
  const province = text(sp.province, 24);
  const avg = positiveInt(sp.avg);
  const pct = positiveInt(sp.pct);
  const verdictRaw = text(sp.verdict, 12)?.toLowerCase();
  const verdict = verdictRaw && VERDICTS.has(verdictRaw) ? verdictRaw : null;

  // No result to share — the same route renders the tool's generic card.
  // It must still be set explicitly: the folder's static opengraph-image.tsx
  // was removed so it could not take precedence over the personalised card.
  if (!role || !avg) {
    const generic = `${SITE}/api/og/salary`;
    return {
      openGraph: { images: [{ url: generic, width: 1200, height: 630, alt: "Am I Underpaid? Free SA Salary Checker" }] },
      twitter: { card: "summary_large_image", images: [generic] },
    };
  }

  const card = new URLSearchParams({ role, avg: String(avg) });
  if (province) card.set("province", province);
  if (verdict) card.set("verdict", verdict);
  if (pct) card.set("pct", String(pct));
  const image = `${SITE}/api/og/salary?${card.toString()}`;

  const zar = formatZar(avg);
  const where = province ? ` in ${province}` : " in South Africa";
  const title = `${role}${where} earns ${zar}/month`;
  const description =
    verdict === "underpaid" && pct
      ? `Someone in this role is on ${pct}% of the market rate. Check yours free on CareerIntel SA — no sign-up.`
      : `The SA market average for ${role}${where}. Check yours free on CareerIntel SA — no sign-up.`;

  return {
    title, // root layout template appends " | CareerIntel SA"
    description,
    openGraph: {
      title,
      description,
      url: `${SITE}/salary-check`,
      siteName: "CareerIntel SA",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function SalaryCheckPage() {
  return <SalaryCheckClient />;
}
