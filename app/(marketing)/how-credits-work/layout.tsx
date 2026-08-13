import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Credits Work — Pricing Explained | CareerIntel SA",
  description:
    "Exactly what each action costs on CareerIntel SA: AI coach messages, skills gap analyses and career simulations. See your free monthly allowance, what's always free, and credit pack prices in ZAR.",
  keywords: [
    "CareerIntel SA credits",
    "CareerIntel SA pricing",
    "AI career coach cost South Africa",
    "career platform pricing ZAR",
  ],
  openGraph: {
    title: "How Credits Work — CareerIntel SA",
    description:
      "What each action costs, your free monthly allowance, and what's always free. No surprises.",
    url: "https://careerintelsa.co.za/how-credits-work",
    siteName: "CareerIntel SA",
    type: "website",
  },
  alternates: { canonical: "https://careerintelsa.co.za/how-credits-work" },
};

export default function HowCreditsWorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
