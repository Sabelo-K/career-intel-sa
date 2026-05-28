"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  Brain, LayoutDashboard, FileText, MessageCircle,
  GitBranch, Target, BarChart3, BookOpen, Mic,
  User, Settings, Zap, ChevronRight, Crown, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/cv-builder",    icon: FileText,        label: "CV Builder"      },
  { href: "/career-coach",  icon: MessageCircle,   label: "AI Career Coach" },
  { href: "/career-paths",  icon: GitBranch,       label: "Career Paths"    },
  { href: "/skills-gap",    icon: Target,          label: "Skills Gap"      },
  { href: "/job-market",    icon: BarChart3,       label: "Job Market"      },
  { href: "/courses",       icon: BookOpen,        label: "Courses"         },
  { href: "/interview-prep",icon: Mic,             label: "Interview Prep"  },
];

const BOTTOM_ITEMS = [
  { href: "/profile",  icon: User,     label: "Profile"  },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-sm tracking-tight text-foreground">
        Career<span className="text-indigo-400">Intel</span>
        <span className="text-amber-400 text-xs ml-1">SA</span>
      </span>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.plan && d.plan !== "FREE") setIsPaid(true); })
      .catch(() => {});
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-1 rounded-xl hover:bg-secondary text-muted-foreground touch-manipulation active:scale-95 transition-transform"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Mobile backdrop ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      {/* Desktop: always visible fixed strip                                    */}
      {/* Mobile: slide-in drawer from left                                      */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 md:w-60 border-r border-border bg-card flex flex-col z-50",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo row */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border flex-shrink-0">
          <Link href="/dashboard">
            <Logo />
          </Link>
          {/* Close button — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground touch-manipulation"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        isActive
                          ? "text-indigo-400"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Upgrade card — hidden for paid users */}
          {!isPaid && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Go Premium</span>
              </div>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                Unlock unlimited AI coaching, simulations &amp; salary forecasting.
              </p>
              <Link
                href="/upgrade"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold transition-all touch-manipulation"
              >
                <Zap className="w-3 h-3" />
                From R49/mo
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom: profile + settings */}
        <div className="border-t border-border p-3 space-y-0.5 flex-shrink-0">
          {BOTTOM_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "w-7 h-7" } }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                My Account
              </div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
