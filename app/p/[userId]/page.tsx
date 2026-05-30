/**
 * /p/[userId] — Public shareable career profile
 * No auth required. Share as: career-intel-sa.vercel.app/p/<clerkId>
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin, Briefcase, Target, BookOpen, Globe, GraduationCap, CheckCircle2, Brain,
} from "lucide-react";

// ── Data fetching ─────────────────────────────────────────────────────────────

interface PublicProfile {
  name:            string;
  currentRole:     string | null;
  targetRole:      string | null;
  province:        string | null;
  industry:        string | null;
  skills:          string[];
  bio:             string | null;
  educationLevel:  string | null;
  yearsExperience: number | null;
  linkedinUrl:     string | null;
  githubUrl:       string | null;
  portfolioUrl:    string | null;
  isOpenToWork:    boolean;
  joinedYear:      number;
}

async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user/public/${userId}`, {
      next: { revalidate: 300 }, // 5 minute cache
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile ?? null;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { userId: string } }
): Promise<Metadata> {
  const profile = await getPublicProfile(params.userId);
  if (!profile) return { title: "Profile Not Found | CareerIntel SA" };

  return {
    title:       `${profile.name} | CareerIntel SA`,
    description: profile.bio ??
      `${profile.currentRole ?? "Professional"} based in ${profile.province ?? "South Africa"}. Explore their career profile on CareerIntel SA.`,
    openGraph: {
      title:       `${profile.name} | CareerIntel SA`,
      description: profile.bio ?? `Career profile of ${profile.name} on CareerIntel SA`,
      siteName:    "CareerIntel SA",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EDUCATION_DISPLAY: Record<string, string> = {
  GRADE_10:        "Grade 10", GRADE_11: "Grade 11", GRADE_12_MATRIC: "Matric / NSC",
  CERTIFICATE:     "Certificate (NQF 1–5)", DIPLOMA: "Diploma (NQF 6)",
  ADVANCED_DIPLOMA:"Advanced Diploma", DEGREE: "Bachelor's Degree (NQF 7)",
  HONOURS:         "Honours (NQF 8)", MASTERS: "Master's Degree (NQF 9)",
  PHD:             "PhD (NQF 10)",
};

export default async function PublicProfilePage(
  { params }: { params: { userId: string } }
) {
  const profile = await getPublicProfile(params.userId);
  if (!profile) notFound();

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d1526] text-foreground">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">
              Career<span className="text-indigo-400">Intel</span>
              <span className="text-amber-400 text-xs ml-1">SA</span>
            </span>
          </Link>
          <Link
            href="/sign-up"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Build Your Profile
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                  {profile.currentRole && (
                    <p className="text-sm text-indigo-300 font-medium mt-0.5">{profile.currentRole}</p>
                  )}
                </div>
                {profile.isOpenToWork && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium flex-shrink-0">
                    🟢 Open to Work
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {profile.province && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.province}</span>
                )}
                {profile.industry && (
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{profile.industry}</span>
                )}
                {profile.yearsExperience !== null && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {profile.yearsExperience} year{profile.yearsExperience !== 1 ? "s" : ""} experience
                  </span>
                )}
                {profile.educationLevel && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {EDUCATION_DISPLAY[profile.educationLevel] ?? profile.educationLevel}
                  </span>
                )}
              </div>

              {/* Links */}
              {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Globe className="w-3 h-3" />LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Globe className="w-3 h-3" />GitHub
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Globe className="w-3 h-3" />Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-sm text-foreground/90 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Target role */}
        {profile.targetRole && (
          <div className="bg-card border border-indigo-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Career Goal</span>
            </div>
            <p className="text-sm font-semibold text-indigo-300">{profile.targetRole}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Skills · {profile.skills.length} listed
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-secondary border border-border text-foreground/90 px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/30 border border-indigo-500/20 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">Build Your CareerIntel SA Profile</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Get your Employability Score, Skills Gap analysis, AI career coaching, and a shareable profile like this one.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Create Free Profile
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 hover:bg-white/[0.12] text-white text-sm font-medium transition-colors"
            >
              Learn More
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3">Free forever · No credit card · Built for the SA job market</p>
        </div>
      </main>
    </div>
  );
}
