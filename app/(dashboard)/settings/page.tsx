"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Palette, Briefcase,
  Crown, CheckCircle2, LogOut, Trash2, Download,
  Mail, Lock, ExternalLink, Save, AlertTriangle,
  Moon, Sun, Globe, Info, Zap, ChevronRight,
  Eye, EyeOff, MapPin, DollarSign, Link2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ─── Reusable sub-components ─────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-indigo-400",
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="border-t border-border pt-4">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? "bg-indigo-600" : "bg-secondary border border-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/20">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function DangerAction({
  icon: Icon,
  title,
  description,
  buttonLabel,
  buttonVariant = "outline",
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: "outline" | "destructive";
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={onClick}
        className={buttonVariant === "destructive" ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50" : ""}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  // Save state
  const [saved, setSaved] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    weeklyDigest: true,
    jobAlerts: true,
    courseRecommendations: true,
    salaryUpdates: false,
    marketInsights: true,
    productUpdates: false,
    promotions: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    recruiterVisible: true,
    aiPersonalisation: true,
    anonymousAnalytics: true,
    showSalaryExpectation: false,
  });

  // Appearance
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [compactMode, setCompactMode] = useState(false);

  // Career preferences
  const [jobType, setJobType] = useState<string[]>(["full-time"]);
  const [remotePreference, setRemotePreference] = useState("hybrid");
  const [industries, setIndustries] = useState<string[]>(["Technology"]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [openToWork, setOpenToWork] = useState(true);

  // Confirm delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    // Persist profile fields that exist on the schema
    try {
      await fetch("/api/profile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          isOpenToWork:      openToWork,
          salaryExpectation: salaryMin ? Number(salaryMin) : undefined,
        }),
      });
    } catch { /* non-fatal — preferences still saved locally */ }

    // Save UI-only preferences to localStorage
    try {
      localStorage.setItem("ci_notifs",       JSON.stringify(notifs));
      localStorage.setItem("ci_privacy",      JSON.stringify(privacy));
      localStorage.setItem("ci_career_prefs", JSON.stringify({
        jobType, remotePreference, industries, salaryMin, salaryMax,
      }));
    } catch { /* ignore */ }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `careerintel-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed — please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Deletion failed");
      }
      // Sign out and redirect — account is gone
      await signOut(() => router.push("/"));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Deletion failed. Please contact support.");
      setDeleting(false);
    }
  };

  const toggleJobType = (type: string) => {
    setJobType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleIndustry = (industry: string) => {
    setIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const [planKey, setPlanKey]           = useState<string>("FREE");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [profileLink, setProfileLink]   = useState<string | null>(null);
  const [linkCopied, setLinkCopied]     = useState(false);

  useEffect(() => {
    // Load plan info
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan)          setPlanKey(d.plan);
        if (d.planExpiresAt) setPlanExpiresAt(d.planExpiresAt);
      })
      .catch(() => {});

    // Load profile prefs + build share link from Clerk user id
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.isOpenToWork !== undefined) setOpenToWork(d.profile.isOpenToWork);
        if (d.profile?.salaryExpectation) setSalaryMin(String(d.profile.salaryExpectation));
      })
      .catch(() => {});

    // Load UI prefs from localStorage
    try {
      const savedNotifs = localStorage.getItem("ci_notifs");
      if (savedNotifs) setNotifs(JSON.parse(savedNotifs));
      const savedPrivacy = localStorage.getItem("ci_privacy");
      if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
      const savedCareer = localStorage.getItem("ci_career_prefs");
      if (savedCareer) {
        const c = JSON.parse(savedCareer);
        if (c.jobType)           setJobType(c.jobType);
        if (c.remotePreference)  setRemotePreference(c.remotePreference);
        if (c.industries)        setIndustries(c.industries);
        if (c.salaryMin)         setSalaryMin(c.salaryMin);
        if (c.salaryMax)         setSalaryMax(c.salaryMax);
      }
    } catch { /* ignore */ }
  }, []);

  // Build shareable link from Clerk user ID
  useEffect(() => {
    if (user?.id && typeof window !== "undefined") {
      setProfileLink(`${window.location.origin}/p/${user.id}`);
    }
  }, [user?.id]);

  const copyProfileLink = async () => {
    if (!profileLink) return;
    try {
      await navigator.clipboard.writeText(profileLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch { /* fallback */ }
  };

  const PLAN_DISPLAY: Record<string, { name: string; color: string }> = {
    FREE:       { name: "Free Plan",         color: "text-muted-foreground" },
    PREMIUM:    { name: "Premium",           color: "text-indigo-400" },
    RECRUITER:  { name: "Recruiter",         color: "text-amber-400" },
    ENTERPRISE: { name: "Enterprise",        color: "text-emerald-400" },
  };
  const { name: planName, color: planColor } = PLAN_DISPLAY[planKey] ?? PLAN_DISPLAY.FREE;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account, preferences, and privacy settings.
          </p>
        </div>
        <Button onClick={handleSave} variant="indigo" size="sm" className="gap-2 flex-shrink-0">
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-3.5 h-3.5" />Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="w-3.5 h-3.5" />Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="w-3.5 h-3.5" />Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
            <Palette className="w-3.5 h-3.5" />Appearance
          </TabsTrigger>
          <TabsTrigger value="career" className="gap-1.5 text-xs sm:text-sm">
            <Briefcase className="w-3.5 h-3.5" />Career
          </TabsTrigger>
        </TabsList>

        {/* ── Account Tab ─────────────────────────────────────────── */}
        <TabsContent value="account" className="space-y-4">
          {/* Profile summary */}
          <SectionCard title="Account Details" icon={User} description="Your CareerIntel SA account information.">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <Badge variant="outline" className={`mt-1 text-xs ${planColor}`}>
                  {planName}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
                <Input defaultValue={user?.fullName || ""} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <Input
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email is managed by your Clerk account.{" "}
                  <button
                    onClick={() => openUserProfile()}
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Change email
                  </button>
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Shareable profile link */}
          <SectionCard title="Shareable Profile Link" icon={Link2} iconColor="text-violet-400"
            description="Share your CareerIntel SA profile with recruiters and employers — no account needed to view it.">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={profileLink ?? "Loading…"}
                  readOnly
                  className="text-xs text-muted-foreground opacity-80 select-all"
                />
                <Button
                  variant={linkCopied ? "indigo" : "outline"}
                  size="sm"
                  className="gap-2 flex-shrink-0"
                  onClick={copyProfileLink}
                  disabled={!profileLink}
                >
                  {linkCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {linkCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
              {profileLink && (
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your name, current role, skills, and career goal — no login required.{" "}
                  <a href={profileLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                    Preview it →
                  </a>
                </p>
              )}
            </div>
          </SectionCard>

          {/* Subscription */}
          <SectionCard
            title="Subscription Plan"
            icon={Crown}
            iconColor="text-amber-400"
            description="Your current plan and billing information."
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border mb-4">
              <div>
                <p className={`text-sm font-semibold ${planColor}`}>{planName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {planKey === "FREE"
                    ? "15 AI messages · 3 skills gaps · 1 simulation per month"
                    : planExpiresAt
                      ? `Active until ${new Date(planExpiresAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`
                      : "Full access — all features unlocked"}
                </p>
              </div>
              <Badge variant="outline" className={`text-xs ${planKey !== "FREE" ? "border-indigo-500/30 text-indigo-400" : ""}`}>
                {planKey === "FREE" ? "Free" : "Active"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { name: "Graduate", price: "R49/mo", color: "border-violet-500/30 bg-violet-500/5", textColor: "text-violet-300" },
                { name: "Professional", price: "R99/mo", color: "border-indigo-500/40 bg-indigo-500/10", textColor: "text-indigo-300", popular: true },
                { name: "Recruiter", price: "R499/mo", color: "border-amber-500/30 bg-amber-500/5", textColor: "text-amber-300" },
              ].map((plan) => (
                <div key={plan.name} className={`relative rounded-xl border ${plan.color} p-3 text-center`}>
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <p className={`text-sm font-semibold ${plan.textColor}`}>{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.price}</p>
                </div>
              ))}
            </div>
            {planKey === "FREE" ? (
              <Link href="/upgrade">
                <Button variant="indigo" className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  Upgrade Your Plan
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-sm">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">Plan active</span>
                </div>
                {planExpiresAt && (() => {
                  const ms   = new Date(planExpiresAt).getTime() - Date.now();
                  const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
                  return (
                    <span className={`text-xs font-semibold ${days <= 5 ? "text-amber-400" : "text-muted-foreground"}`}>
                      {days}d remaining
                    </span>
                  );
                })()}
              </div>
            )}
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security" icon={Lock} iconColor="text-emerald-400" description="Manage your login and security settings.">
            <div className="divide-y divide-border">
              <DangerAction
                icon={Lock}
                title="Change Password"
                description="Update your account password via Clerk."
                buttonLabel="Change Password"
                onClick={() => openUserProfile()}
              />
              <DangerAction
                icon={ExternalLink}
                title="Manage Account"
                description="Update email, phone, connected accounts, and 2FA."
                buttonLabel="Open Clerk"
                onClick={() => openUserProfile()}
              />
              <DangerAction
                icon={LogOut}
                title="Sign Out"
                description="Sign out of your CareerIntel SA account on this device."
                buttonLabel="Sign Out"
                onClick={() => signOut(() => router.push("/"))}
              />
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Notifications Tab ───────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4">
          <SectionCard
            title="Email Notifications"
            icon={Mail}
            iconColor="text-blue-400"
            description="Choose which emails CareerIntel SA sends you."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="Weekly Career Digest"
                description="A personalised summary of SA job market trends and your career progress."
                checked={notifs.weeklyDigest}
                onChange={(v) => setNotifs({ ...notifs, weeklyDigest: v })}
              />
              <ToggleRow
                label="Job Alert Emails"
                description="New job opportunities matching your target role and province."
                checked={notifs.jobAlerts}
                onChange={(v) => setNotifs({ ...notifs, jobAlerts: v })}
              />
              <ToggleRow
                label="Course Recommendations"
                description="Curated courses from Coursera, UCT, UNISA, and SETAs based on your skills gaps."
                checked={notifs.courseRecommendations}
                onChange={(v) => setNotifs({ ...notifs, courseRecommendations: v })}
              />
              <ToggleRow
                label="Salary Market Updates"
                description="Monthly salary benchmarking reports for your role and province."
                checked={notifs.salaryUpdates}
                onChange={(v) => setNotifs({ ...notifs, salaryUpdates: v })}
                badge="Monthly"
              />
              <ToggleRow
                label="SA Market Insights"
                description="Industry reports on SA's labour market, BEE updates, and sector trends."
                checked={notifs.marketInsights}
                onChange={(v) => setNotifs({ ...notifs, marketInsights: v })}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Platform Updates"
            icon={Bell}
            iconColor="text-violet-400"
            description="Updates about CareerIntel SA features and offers."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="Product Updates"
                description="New features, improvements, and platform announcements."
                checked={notifs.productUpdates}
                onChange={(v) => setNotifs({ ...notifs, productUpdates: v })}
              />
              <ToggleRow
                label="Promotional Emails"
                description="Special offers, discounts, and upgrade opportunities."
                checked={notifs.promotions}
                onChange={(v) => setNotifs({ ...notifs, promotions: v })}
              />
            </div>
          </SectionCard>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary border border-border text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>
              You can unsubscribe from all marketing emails at any time via the unsubscribe link in any email.
              Transactional emails (account security, billing) cannot be disabled.
            </p>
          </div>
        </TabsContent>

        {/* ── Privacy Tab ─────────────────────────────────────────── */}
        <TabsContent value="privacy" className="space-y-4">
          <SectionCard
            title="Profile Visibility"
            icon={Eye}
            iconColor="text-indigo-400"
            description="Control who can see your CareerIntel SA profile."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="Visible to Recruiters"
                description="Allow SA employers and recruiters on CareerIntel to discover your profile."
                checked={privacy.recruiterVisible}
                onChange={(v) => setPrivacy({ ...privacy, recruiterVisible: v })}
              />
              <ToggleRow
                label="Show Salary Expectation"
                description="Display your salary range to recruiters viewing your profile."
                checked={privacy.showSalaryExpectation}
                onChange={(v) => setPrivacy({ ...privacy, showSalaryExpectation: v })}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="AI & Data Personalisation"
            icon={Shield}
            iconColor="text-emerald-400"
            description="Control how your data is used to improve your experience."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="AI Personalisation"
                description="Use your profile, skills, and activity to improve AI career coach responses and recommendations."
                checked={privacy.aiPersonalisation}
                onChange={(v) => setPrivacy({ ...privacy, aiPersonalisation: v })}
              />
              <ToggleRow
                label="Anonymous Usage Analytics"
                description="Help improve CareerIntel SA by sharing anonymised usage data. No personal information is shared."
                checked={privacy.anonymousAnalytics}
                onChange={(v) => setPrivacy({ ...privacy, anonymousAnalytics: v })}
              />
            </div>
          </SectionCard>

          {/* POPIA notice */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-300 mb-1">POPIA Compliant</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  CareerIntel SA is fully compliant with South Africa&apos;s Protection of Personal
                  Information Act (POPIA). Your personal data is stored securely, never sold to
                  third parties, and only used to improve your career intelligence experience.
                </p>
                <a
                  href="/privacy"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 underline underline-offset-2"
                >
                  Read our Privacy Policy <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Data management */}
          <SectionCard
            title="Your Data"
            icon={EyeOff}
            iconColor="text-amber-400"
            description="Access, export, or delete your personal data."
          >
            <div className="divide-y divide-border">
              <DangerAction
                icon={Download}
                title="Export My Data"
                description="Download a copy of all data CareerIntel SA holds about you (POPIA Section 23 right)."
                buttonLabel={exporting ? "Exporting…" : "Download Export"}
                onClick={handleExport}
              />
              <div className="pt-3">
                <AnimatePresence mode="wait">
                  {!showDeleteConfirm ? (
                    <DangerAction
                      icon={Trash2}
                      title="Delete My Account"
                      description="Permanently delete your account and all associated data. This action cannot be undone."
                      buttonLabel="Delete Account"
                      buttonVariant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    />
                  ) : (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 font-medium">
                          This will permanently delete your account, CV data, chat history, and all saved settings. This cannot be undone.
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                          Type <span className="text-red-400 font-mono font-semibold">DELETE</span> to confirm
                        </label>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                          className="border-red-500/30 focus:ring-red-500/30"
                        />
                      </div>
                      {deleteError && (
                        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {deleteError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={deleting}
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null); }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0"
                          disabled={deleteConfirmText !== "DELETE" || deleting}
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          {deleting ? "Deleting…" : "Delete Forever"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Appearance Tab ──────────────────────────────────────── */}
        <TabsContent value="appearance" className="space-y-4">
          <SectionCard
            title="Theme"
            icon={Moon}
            iconColor="text-indigo-400"
            description="Choose how CareerIntel SA looks on your device."
          >
            <div className="grid grid-cols-3 gap-3">
              {(["dark", "light", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`relative rounded-xl border-2 p-3 transition-all ${
                    theme === t
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-border bg-secondary hover:border-border/80"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {t === "dark" && <Moon className="w-5 h-5 text-indigo-300" />}
                    {t === "light" && <Sun className="w-5 h-5 text-amber-400" />}
                    {t === "system" && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-slate-800 to-white border border-border" />
                    )}
                    <span className="text-xs font-medium capitalize text-foreground">{t}</span>
                  </div>
                  {theme === t && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              Full light mode is coming soon. Dark mode is active by default.
            </p>
          </SectionCard>

          <SectionCard
            title="Language & Region"
            icon={Globe}
            iconColor="text-emerald-400"
            description="Set your preferred language for the CareerIntel SA interface."
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Interface Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="en">English (South African)</option>
                  <option value="af" disabled>Afrikaans (Coming Soon)</option>
                  <option value="zu" disabled>isiZulu (Coming Soon)</option>
                  <option value="xh" disabled>isiXhosa (Coming Soon)</option>
                  <option value="st" disabled>Sesotho (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Salary Currency</label>
                <Input value="South African Rand (ZAR)" disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground mt-1">All salary data is displayed in ZAR as this platform is built for the SA market.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Display"
            icon={Palette}
            iconColor="text-violet-400"
            description="Adjust how content is displayed across the platform."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="Compact Mode"
                description="Show more content on screen with reduced padding and smaller elements."
                checked={compactMode}
                onChange={setCompactMode}
              />
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Career Preferences Tab ──────────────────────────────── */}
        <TabsContent value="career" className="space-y-4">
          {/* Job search status */}
          <SectionCard
            title="Job Search Status"
            icon={Briefcase}
            iconColor="text-emerald-400"
            description="Let recruiters know whether you are currently looking for work."
          >
            <div className="divide-y divide-border">
              <ToggleRow
                label="Open to Work"
                description="Show an 'Open to Work' badge on your profile, visible to SA recruiters."
                checked={openToWork}
                onChange={setOpenToWork}
              />
            </div>
          </SectionCard>

          {/* Job type */}
          <SectionCard
            title="Job Type Preference"
            icon={Briefcase}
            iconColor="text-indigo-400"
            description="Select all the employment types you are interested in."
          >
            <div className="flex flex-wrap gap-2">
              {[
                { id: "full-time", label: "Full-time" },
                { id: "part-time", label: "Part-time" },
                { id: "contract", label: "Contract" },
                { id: "freelance", label: "Freelance" },
                { id: "internship", label: "Internship" },
                { id: "learnerships", label: "Learnerships / SETA" },
                { id: "graduate", label: "Graduate Programme" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleJobType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    jobType.includes(type.id)
                      ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Work arrangement */}
          <SectionCard
            title="Work Arrangement"
            icon={MapPin}
            iconColor="text-blue-400"
            description="Your preferred working arrangement."
          >
            <div className="grid grid-cols-3 gap-3">
              {["onsite", "hybrid", "remote"].map((pref) => (
                <button
                  key={pref}
                  onClick={() => setRemotePreference(pref)}
                  className={`rounded-xl border-2 p-3 text-center transition-all ${
                    remotePreference === pref
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-border bg-secondary hover:border-border/80"
                  }`}
                >
                  <span className="text-sm block mb-1">
                    {pref === "onsite" ? "🏢" : pref === "hybrid" ? "🔀" : "🏠"}
                  </span>
                  <span className="text-xs font-medium capitalize text-foreground">{pref}</span>
                  {remotePreference === pref && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mx-auto mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Preferred industries */}
          <SectionCard
            title="Preferred Industries"
            icon={Briefcase}
            iconColor="text-violet-400"
            description="Select industries you want to work in. Used for AI recommendations."
          >
            <div className="flex flex-wrap gap-2">
              {[
                "Technology", "Finance & Banking", "Healthcare", "Mining & Resources",
                "Renewable Energy", "Education", "Retail & FMCG", "Manufacturing",
                "Telecoms", "Government / Public Sector", "Media & Marketing",
                "Construction & Engineering", "Agriculture", "Legal",
              ].map((ind) => (
                <button
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    industries.includes(ind)
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Salary range */}
          <SectionCard
            title="Salary Expectation"
            icon={DollarSign}
            iconColor="text-amber-400"
            description="Your expected monthly salary range (ZAR). Used for job matching and salary intelligence."
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Minimum (ZAR/month)</label>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 25000"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Maximum (ZAR/month)</label>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 60000"
                  min={0}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is used to personalise salary insights and filter job recommendations.
              {privacy.showSalaryExpectation ? " Your salary expectation is visible to recruiters." : " Your salary expectation is private."}
            </p>
          </SectionCard>

          {/* Save reminder */}
          <div className="flex justify-end">
            <Button onClick={handleSave} variant="indigo" className="gap-2">
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Changes Saved!" : "Save Career Preferences"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
