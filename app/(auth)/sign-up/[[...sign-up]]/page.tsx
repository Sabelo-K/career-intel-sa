import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Brain, CheckCircle } from "lucide-react";
import { clerkDarkAppearance } from "@/lib/clerk-appearance";

const PERKS = [
  "Free forever — no credit card needed",
  "AI career coach with SA market knowledge",
  "Skills gap analysis & learning roadmap",
  "Salary intelligence in ZAR",
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#050B1A] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Career<span className="text-indigo-400">Intel</span>
              <span className="text-amber-400 text-sm ml-1">SA</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Build your future-proof{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              SA career
            </span>
          </h1>
          <p className="text-white/50 mb-8">
            Join thousands of South Africans using AI-powered intelligence to close skills gaps, predict salaries, and land better jobs.
          </p>
          <ul className="space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/70">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-center mb-6 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">CareerIntel SA</span>
            </Link>
          </div>
          <SignUp appearance={clerkDarkAppearance} />
        </div>
      </div>
    </div>
  );
}
