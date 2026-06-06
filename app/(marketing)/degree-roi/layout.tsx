import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Is Your Degree Worth It? SA Degree ROI Calculator | CareerIntel SA",
  description:
    "Calculate the real return on investment of any South African university degree. See total cost, salary timeline, break-even point vs the TVET alternative. Free — no sign-up needed.",
  keywords: [
    "is a degree worth it South Africa",
    "SA degree ROI calculator",
    "university cost South Africa",
    "degree vs TVET South Africa",
    "return on investment degree SA",
    "should I study South Africa",
    "university salary South Africa",
  ],
  openGraph: {
    title: "Is Your Degree Worth It? SA Degree ROI Calculator",
    description:
      "See the real cost, salary trajectory, and break-even point of any SA degree vs the TVET route. Free on CareerIntel SA.",
    url: "https://careerintelsa.co.za/degree-roi",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is Your Degree Worth It? SA Degree ROI Calculator",
    description: "Calculate the real return on your degree. SA salary data, degree costs, TVET comparison. Free.",
  },
  alternates: {
    canonical: "https://careerintelsa.co.za/degree-roi",
  },
};

export default function DegreeROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
