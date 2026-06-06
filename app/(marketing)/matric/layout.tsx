import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matric Career Matcher — What Can You Study? | CareerIntel SA",
  description:
    "Enter your matric symbols and instantly see your APS score, which university programmes you qualify for, and the careers that match your CAPS subjects. Free — no sign-up needed.",
  keywords: [
    "matric career matcher South Africa",
    "APS score calculator",
    "matric results career guide",
    "what to study after matric",
    "CAPS subjects career match",
    "university programmes South Africa",
    "NSC matric career options",
  ],
  openGraph: {
    title: "Matric Career Matcher — What Can You Study?",
    description:
      "Enter your matric symbols → get your APS score, qualifying university programmes, and careers that match your subjects. Free on CareerIntel SA.",
    url: "https://careerintelsa.co.za/matric",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matric Career Matcher — What Can You Study?",
    description: "Find out which careers and university programmes your matric subjects unlock. Free.",
  },
  alternates: {
    canonical: "https://careerintelsa.co.za/matric",
  },
};

export default function MatricLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
