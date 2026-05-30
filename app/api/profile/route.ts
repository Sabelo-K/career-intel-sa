/**
 * GET  /api/profile — load the user's saved profile
 * POST /api/profile — create/update the user's profile
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Province, EducationLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/db-helpers";
import { z } from "zod";

const ProfileSchema = z.object({
  currentRole:       z.string().optional(),
  targetRole:        z.string().optional(),
  province:          z.string().optional(),
  yearsExperience:   z.number().min(0).max(60).optional(),
  educationLevel:    z.string().optional(),
  industry:          z.string().optional(),
  skills:            z.array(z.string()).optional(),
  subjects:          z.array(z.string()).optional(),
  salaryExpectation: z.number().optional(),
  isOpenToWork:      z.boolean().optional(),
  linkedinUrl:       z.string().url().optional().or(z.literal("")),
  githubUrl:         z.string().url().optional().or(z.literal("")),
  portfolioUrl:      z.string().url().optional().or(z.literal("")),
  bio:               z.string().max(1000).optional(),
  institution:       z.string().optional(),
  fieldOfStudy:      z.string().optional(),
  yearCompleted:     z.number().min(1970).max(2030).optional(),
});

// Map display labels → Prisma Province enum
const PROVINCE_MAP: Record<string, Province> = {
  "Gauteng":       Province.GAUTENG,
  "Western Cape":  Province.WESTERN_CAPE,
  "KwaZulu-Natal": Province.KWAZULU_NATAL,
  "Eastern Cape":  Province.EASTERN_CAPE,
  "Free State":    Province.FREE_STATE,
  "Limpopo":       Province.LIMPOPO,
  "Mpumalanga":    Province.MPUMALANGA,
  "North West":    Province.NORTH_WEST,
  "Northern Cape": Province.NORTHERN_CAPE,
};

// Map display labels → Prisma EducationLevel enum
const EDUCATION_MAP: Record<string, EducationLevel> = {
  "Grade 10/11":               EducationLevel.GRADE_10,
  "Grade 12 / Matric":         EducationLevel.GRADE_12_MATRIC,
  "Certificate (NQF 1-5)":     EducationLevel.CERTIFICATE,
  "Diploma (NQF 6)":           EducationLevel.DIPLOMA,
  "Advanced Diploma":          EducationLevel.ADVANCED_DIPLOMA,
  "Bachelor's Degree (NQF 7)": EducationLevel.DEGREE,
  "Honours (NQF 8)":           EducationLevel.HONOURS,
  "Master's Degree (NQF 9)":   EducationLevel.MASTERS,
  "PhD (NQF 10)":               EducationLevel.PHD,
};

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({
      where:   { clerkId: userId },
      include: { profile: true },
    });

    if (!dbUser) return NextResponse.json({ profile: null });
    return NextResponse.json({ profile: dbUser.profile });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const parsed = ProfileSchema.parse(body);

    const clerkUser = await currentUser();
    const dbUser = await getOrCreateUser(
      userId,
      clerkUser?.primaryEmailAddress?.emailAddress,
      clerkUser?.fullName
    );

    const province: Province | undefined       = parsed.province      ? PROVINCE_MAP[parsed.province]   : undefined;
    const educationLevel: EducationLevel | undefined = parsed.educationLevel ? EDUCATION_MAP[parsed.educationLevel] : undefined;

    const profileData = {
      currentRole:       parsed.currentRole       ?? undefined,
      targetRole:        parsed.targetRole         ?? undefined,
      province,
      yearsExperience:   parsed.yearsExperience    ?? undefined,
      educationLevel,
      industry:          parsed.industry           ?? undefined,
      skills:            parsed.skills             ?? undefined,
      subjects:          parsed.subjects           ?? undefined,
      salaryExpectation: parsed.salaryExpectation  ?? undefined,
      isOpenToWork:      parsed.isOpenToWork       ?? undefined,
      linkedinUrl:       parsed.linkedinUrl        || undefined,
      githubUrl:         parsed.githubUrl          || undefined,
      portfolioUrl:      parsed.portfolioUrl       || undefined,
      bio:               parsed.bio                ?? undefined,
      institution:       parsed.institution        ?? undefined,
      fieldOfStudy:      parsed.fieldOfStudy       ?? undefined,
      yearCompleted:     parsed.yearCompleted       ?? undefined,
    };

    const profile = await db.profile.upsert({
      where:  { userId: dbUser.id },
      update: profileData,
      create: { userId: dbUser.id, ...profileData },
    });

    return NextResponse.json({ profile, success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    console.error("Profile POST error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
