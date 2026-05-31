"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "careerintelsa_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't already acknowledged
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "acknowledged");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
          We use essential cookies for authentication and session management. No advertising or
          tracking cookies are used. By continuing to use CareerIntel SA, you agree to our{" "}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
            Terms of Service
          </Link>
          . This platform is POPIA compliant.
        </p>
        <button
          onClick={dismiss}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          I Agree
        </button>
      </div>
    </div>
  );
}
