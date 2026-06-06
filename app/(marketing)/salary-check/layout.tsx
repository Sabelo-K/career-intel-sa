import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Am I Underpaid? Free SA Salary Checker | CareerIntel SA",
  description:
    "Check your salary against the South African market in 30 seconds. Enter your role, province, and experience — get an instant ZAR salary benchmark. Free, no sign-up required.",
  keywords: [
    "am I underpaid South Africa",
    "SA salary checker",
    "South Africa salary benchmark",
    "ZAR salary comparison",
    "South Africa job salary",
    "salary check SA",
  ],
  openGraph: {
    title: "Am I Underpaid? Free SA Salary Checker",
    description:
      "Check your salary against the SA market. Role + province + experience = instant benchmark. Free on CareerIntel SA.",
    url: "https://careerintelsa.co.za/salary-check",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Underpaid? Free SA Salary Checker",
    description: "Check your salary against the South African market. Free — no sign-up needed.",
  },
  alternates: {
    canonical: "https://careerintelsa.co.za/salary-check",
  },
};

export default function SalaryCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
