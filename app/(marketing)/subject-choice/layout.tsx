import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subject Choice Guide — Which Careers Do Your Subjects Open? | CareerIntel SA",
  description:
    "Free Grade 9–11 subject choice guide for South African learners. Pick the subjects you enjoy and see exactly which careers they open — and which close. Find out what dropping Mathematics really costs.",
  keywords: [
    "subject choice South Africa",
    "Grade 9 subject choice",
    "what careers can I do with my subjects",
    "Maths Literacy vs Mathematics careers",
    "CAPS subjects careers",
    "high school subject guide SA",
  ],
  openGraph: {
    title: "Which careers do your school subjects open?",
    description:
      "Free guide for Grades 9–11. See which careers your subjects unlock — and what dropping Mathematics closes.",
    url: "https://careerintelsa.co.za/subject-choice",
    siteName: "CareerIntel SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Which careers do your school subjects open?",
    description: "Free SA subject-choice guide for Grades 9–11. No sign-up needed.",
  },
  alternates: { canonical: "https://careerintelsa.co.za/subject-choice" },
};

export default function SubjectChoiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
