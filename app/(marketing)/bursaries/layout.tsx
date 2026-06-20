import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SA Bursaries 2026 — NSFAS, Corporate & Government Bursary Directory | CareerIntel SA",
  description:
    "Find bursaries for South African students — NSFAS, Sasol, Eskom, Standard Bank, Anglo American and 15 more. Filter by field of study, funder type, and application status.",
  keywords: [
    "bursaries South Africa 2026",
    "SA bursary directory",
    "NSFAS bursary apply",
    "corporate bursaries SA",
    "engineering bursary South Africa",
    "finance bursary SA",
    "government bursary South Africa",
    "full bursary South Africa 2026",
  ],
  openGraph: {
    title: "SA Bursaries 2026 — Find Funding for Your Studies",
    description:
      "NSFAS, Sasol, Eskom, Standard Bank, Anglo American and 15 more. Filter by field of study and check if applications are open.",
    url: "https://careerintelsa.co.za/bursaries",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SA Bursaries 2026 | CareerIntel SA",
    description: "Find the right bursary for your field of study. Free directory — no sign-up needed.",
  },
  alternates: {
    canonical: "https://careerintelsa.co.za/bursaries",
  },
};

export default function BursariesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
