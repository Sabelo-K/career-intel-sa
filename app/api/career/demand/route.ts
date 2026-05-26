import { NextRequest, NextResponse } from "next/server";
import { SA_CAREERS, SA_SECTORS } from "@/lib/data/sa-careers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const sector = searchParams.get("sector");
  const minDemand = Number(searchParams.get("minDemand") || 0);
  const limit = Number(searchParams.get("limit") || 50);

  let results = SA_CAREERS;

  if (search) {
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.sector.toLowerCase().includes(search) ||
        c.topSkills.some((s) => s.toLowerCase().includes(search))
    );
  }

  if (sector) {
    results = results.filter((c) => c.sector.toLowerCase().includes(sector.toLowerCase()));
  }

  if (minDemand > 0) {
    results = results.filter((c) => c.demandScore >= minDemand);
  }

  results = results.sort((a, b) => b.demandScore - a.demandScore).slice(0, limit);

  return NextResponse.json({ careers: results, sectors: SA_SECTORS, total: results.length });
}
