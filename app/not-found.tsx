import Link from "next/link";
import { Brain, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050B1A] text-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Career<span className="text-indigo-400">Intel</span>
          <span className="text-xs ml-1 text-amber-400 font-medium">SA</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-white/10 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            Go to homepage <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/salary-check"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all"
          >
            <Search className="w-4 h-4" /> Check my salary
          </Link>
        </div>
      </div>
    </div>
  );
}
