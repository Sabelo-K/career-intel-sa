"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] transition-colors text-white/60 hover:text-white/90",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
        )}
        aria-label={t("language")}
      >
        <span>{current.flag}</span>
        <span className="font-medium">{current.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-40 rounded-xl border border-white/10 bg-[#0d1117] shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              {t("language")}
            </p>
          </div>
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/[0.07] transition-colors text-left"
              >
                <span>{lang.flag}</span>
                <span className={cn(
                  "flex-1 font-medium",
                  language === lang.code ? "text-white" : "text-white/60"
                )}>
                  {lang.label}
                </span>
                {language === lang.code && (
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
