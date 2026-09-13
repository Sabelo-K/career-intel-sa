
import { JourneyBrand } from "@/components/journey/chrome";
/**
 * /p/[userId]/score — Public shareable Employability Score card
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Brain, MapPin, Briefcase, Star, ArrowRight } from "lucide-react";

interface ScoreData {
  name:        string;
  score:       number | null;
  topCareer:   string | null;
  currentRole: string | null;
  province:    string | null;
  joinedYear:  number;
}

const PROVINCE_LABELS: Record<string, string> = {
  GAUTENG: "Gauteng", WESTERN_CAPE: "Western Cape", KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE: "Eastern Cape", FREE_STATE: "Free State", LIMPOPO: "Limpopo",
  MPUMALANGA: "Mpumalanga", NORTH_WEST: "North West", NORTHERN_CAPE: "Northern Cape",
};

async function getScoreData(userId: string): Promise<ScoreData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res  = await fetch(`${base}/api/user/score/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const data = await getScoreData((await params).userId);
  if (!data) return { title: "CareerIntel SA" };
  return {
    title: `${data.name}'s Employability Score | CareerIntel SA`,
    description: data.score
      ? `${data.name} scored ${data.score}/100 on CareerIntel SA's Employability Index 🇿🇦`
      : `${data.name}'s career profile on CareerIntel SA`,
    openGraph: {
      title: `${data.name} scored ${data.score ?? "??"}/100 on CareerIntel SA`,
      description: "Check your own employability score free at careerintelsa.co.za",
    },
  };
}

function ScoreRing({ score }: { score: number }) {
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#6366f1" : "#f59e0b";

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default async function PublicScorePage({ params }: { params: Promise<{ userId: string }> }) {
  const data = await getScoreData((await params).userId);
  if (!data) notFound();

  const province = data.province ? (PROVINCE_LABELS[data.province] ?? data.province) : null;
  const scoreLabel = !data.score ? null
    : data.score >= 80 ? "Exceptional"
    : data.score >= 65 ? "Strong"
    : data.score >= 50 ? "Developing"
    : "Building";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 text-center shadow-2xl">
        {/* Brand */}<div className="flex justify-center mb-8"><JourneyBrand /></div>

        {/* Name */}
        <h1 className="text-xl font-bold text-foreground mb-1">{data.name}</h1>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-6">
          {data.currentRole && (
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{data.currentRole}</span>
          )}
          {province && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{province}</span>
          )}
        </div>

        {/* Score ring or no-score state */}
        {data.score !== null ? (
          <>
            <ScoreRing score={data.score} />
            <div className="mt-4 mb-2">
              <span className="text-lg font-bold text-foreground">{scoreLabel} Employability</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Scored on CareerIntel SA&apos;s Employability Index — skills, profile, CV, and activity combined.
            </p>
          </>
        ) : (
          <div className="py-8 mb-6">
            <Star className="w-12 h-12 text-amber-700/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Score not yet calculated</p>
          </div>
        )}

        {data.topCareer && (
          <div className="bg-secondary border border-border rounded-xl px-4 py-3 mb-6">
            <div className="text-[10px] text-muted-foreground mb-0.5">Top career target</div>
            <div className="font-semibold text-foreground text-sm">{data.topCareer}</div>
          </div>
        )}

        {/* CTA */}
        <Link href="/sign-up"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-primary-foreground text-sm font-semibold transition-all">
          Check my score free <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[10px] text-muted-foreground mt-3">careerintelsa.co.za · Free forever</p>
      </div>
    </div>
  );
}
