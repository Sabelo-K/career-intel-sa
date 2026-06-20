import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SA Graduate Programmes 2026 — Find & Track Corporate Intake Dates | CareerIntel SA",
  description:
    "Track application windows for SA's top corporate graduate programmes — Deloitte, Standard Bank, Discovery, Anglo American, Sasol and 15 more. Never miss an intake date.",
  keywords: [
    "graduate programmes South Africa 2026",
    "SA graduate programme applications",
    "corporate graduate intake SA",
    "graduate jobs South Africa",
    "Big 4 graduate programme SA",
    "banking graduate programme South Africa",
    "engineering graduate programme SA",
  ],
  openGraph: {
    title: "SA Graduate Programmes 2026 — Track Application Windows",
    description:
      "Never miss a graduate programme intake. Track open and upcoming applications at Deloitte, Standard Bank, Discovery, Anglo American and 15 more SA companies.",
    url: "https://careerintelsa.co.za/graduate-programmes",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SA Graduate Programmes 2026 | CareerIntel SA",
    description: "Track when SA's top corporate graduate programmes open. Free — no sign-up needed.",
  },
  alternates: {
    canonical: "https://careerintelsa.co.za/graduate-programmes",
  },
};

export default function GraduateProgrammesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
