"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Brain, RefreshCw, ArrowRight } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry in production (Sentry is auto-configured via next.config)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050B1A] text-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          Career<span className="text-indigo-400">Intel</span>
          <span className="text-xs ml-1 text-amber-400 font-medium">SA</span>
        </span>
      </Link>

      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-2">
          An unexpected error occurred. Our team has been notified automatically.
        </p>
        {error.digest && (
          <p className="text-white/25 text-xs mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all"
          >
            Back to dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
