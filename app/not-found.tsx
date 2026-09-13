import Link from "next/link";
import { Brain, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-4 h-4 text-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Career<span className="text-indigo-700">Intel</span>
          <span className="text-xs ml-1 text-amber-700 font-medium">SA</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-muted-foreground mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-primary-foreground text-sm font-semibold transition-all"
          >
            Go to homepage <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/salary-check"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border hover:border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
          >
            <Search className="w-4 h-4" /> Check my salary
          </Link>
        </div>
      </div>
    </div>
  );
}
