"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  Brain, LayoutDashboard, FileText, MessageCircle,
  GitBranch, Target, BarChart3, BookOpen, Mic,
  User, Settings, Zap, ChevronRight, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cv-builder", icon: FileText, label: "CV Builder" },
  { href: "/career-coach", icon: MessageCircle, label: "AI Career Coach" },
  { href: "/career-paths", icon: GitBranch, label: "Career Paths" },
  { href: "/skills-gap", icon: Target, label: "Skills Gap" },
  { href: "/job-market", icon: BarChart3, label: "Job Market" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/interview-prep", icon: Mic, label: "Interview Prep" },
];

const BOTTOM_ITEMS = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-card flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            Career<span className="text-indigo-400">Intel</span>
            <span className="text-amber-400 text-xs ml-1">SA</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Upgrade card */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">Go Premium</span>
          </div>
          <p className="text-xs text-white/50 mb-3">Unlock unlimited AI coaching, simulations & salary forecasting.</p>
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Zap className="w-3 h-3" />
            Upgrade — R199/mo
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-0.5 flex-shrink-0">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">My Account</div>
            <div className="text-xs text-muted-foreground">Free Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
