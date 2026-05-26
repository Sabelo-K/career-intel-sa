import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050B1A] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Career<span className="text-indigo-400">Intel</span>
              <span className="text-amber-400 text-sm ml-1">SA</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm">Sign in to your career intelligence dashboard</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
