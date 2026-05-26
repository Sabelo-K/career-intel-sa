import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SA_CAREERS, SA_SECTORS, TOP_GROWING_CAREERS_2025, SCARCE_SKILLS } from "@/lib/data/sa-careers";
import { SA_PROVINCES, SA_MARKET_STATS } from "@/lib/data/sa-provinces";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const topDemand = SA_CAREERS.sort((a, b) => b.demandScore - a.demandScore).slice(0, 10);
  const highestPaid = SA_CAREERS.sort((a, b) => b.avgSalaryZar - a.avgSalaryZar).slice(0, 10);
  const highestGrowth = SA_CAREERS
    .filter((c) => ["STRONG_GROWTH", "EXPLOSIVE_GROWTH"].includes(c.growthTrend))
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 10);

  return NextResponse.json({
    marketStats: SA_MARKET_STATS,
    topDemandCareers: topDemand,
    highestPaidCareers: highestPaid,
    highestGrowthCareers: highestGrowth,
    sectors: SA_SECTORS,
    provinces: SA_PROVINCES,
    growingCareers: TOP_GROWING_CAREERS_2025,
    scarceSkills: SCARCE_SKILLS,
    lastUpdated: new Date().toISOString(),
  });
}
