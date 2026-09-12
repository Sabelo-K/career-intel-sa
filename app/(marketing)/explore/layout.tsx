import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore & Compare SA Careers — Skills, Routes & Pay",
  description:
    "Explore South African career possibilities. See demand, monthly ZAR pay, automation risk and which roles are one step away — 307 careers across 26 sectors. Free, no sign-up.",
  keywords: [
    "South Africa careers list",
    "SA career map",
    "highest paying careers South Africa",
    "in demand jobs South Africa",
    "automation risk South Africa jobs",
    "SA salary by career",
    "career change South Africa",
  ],
  openGraph: {
    title: "Explore & Compare SA Careers",
    description:
      "Demand, ZAR pay and automation risk for every career we track — and what each one is a step away from. Free on CareerIntel SA.",
    url: "https://careerintelsa.co.za/explore",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore & Compare SA Careers",
    description: "Demand, pay and automation risk for every SA career. Free — no sign-up.",
  },
  alternates: { canonical: "https://careerintelsa.co.za/explore" },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
