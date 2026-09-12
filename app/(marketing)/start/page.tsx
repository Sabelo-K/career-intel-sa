import type { Metadata } from "next";
import { JourneyStart } from "@/components/journey/start";
export const metadata: Metadata = { title: "Find your career starting point", description: "Career guidance for school learners, job seekers and working adults in South Africa.", alternates: { canonical: "/start" } };
export default function StartPage() { return <JourneyStart />; }
