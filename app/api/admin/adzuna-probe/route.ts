/**
 * GET /api/admin/adzuna-probe?sample=24
 *
 * Diagnostic, admin-only. Answers one question before we build anything:
 * IS THE ADZUNA SIGNAL STRONG ENOUGH TO DRIVE DEMAND SCORES?
 *
 * Samples careers spread across our static demandScore range, fetches the real
 * number of live SA listings for each, then reports:
 *   - how many careers return usable volume (vs zero / no data)
 *   - Spearman rank correlation between our demandScore and real listings
 *   - the worst mismatches, which are where our static data is most wrong
 *
 * Read-only: changes nothing. Rate-limited by design — Adzuna's free tier is
 * ~1,000 calls/day and we spend at most `sample` of them.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SA_CAREERS } from "@/lib/data/sa-careers";
import { getAdzunaListingCount, isAdzunaConfigured } from "@/lib/adzuna";

export const runtime     = "nodejs";
export const dynamic     = "force-dynamic";
export const maxDuration = 60;

/** Spearman rank correlation — robust to the two scales being different units. */
function spearman(a: number[], b: number[]): number | null {
  const n = a.length;
  if (n < 4) return null;
  const rank = (xs: number[]) => {
    const idx = xs.map((v, i) => [v, i] as const).sort((p, q) => p[0] - q[0]);
    const r = new Array<number>(n);
    idx.forEach(([, i], pos) => { r[i] = pos + 1; });
    return r;
  };
  const ra = rank(a), rb = rank(b);
  const d2 = ra.reduce((s, v, i) => s + (v - rb[i]) ** 2, 0);
  return 1 - (6 * d2) / (n * (n * n - 1));
}

export async function GET(req: NextRequest) {
  // ── Admin guard ───────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return NextResponse.json({ error: "Admin not configured" }, { status: 403 });
  const clerk = await currentUser();
  if ((clerk?.primaryEmailAddress?.emailAddress ?? "").toLowerCase() !== adminEmail.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAdzunaConfigured()) {
    return NextResponse.json({ error: "Adzuna not configured (ADZUNA_APP_ID / ADZUNA_APP_KEY missing)" }, { status: 500 });
  }

  const sampleSize = Math.min(Number(req.nextUrl.searchParams.get("sample") ?? 24), 60);

  // Spread the sample evenly across the demandScore range so we can see whether
  // high-scoring careers really do have more listings than low-scoring ones.
  const sorted = [...SA_CAREERS].sort((a, b) => b.demandScore - a.demandScore);
  const step   = Math.max(1, Math.floor(sorted.length / sampleSize));
  const sample = sorted.filter((_, i) => i % step === 0).slice(0, sampleSize);

  const rows: {
    title: string; sector: string; demandScore: number;
    listings: number | null;      // keyword match (loose)
    listingsExact: number | null; // exact-phrase match
  }[] = [];

  // Measure BOTH matching modes so we can tell a genuine data problem apart
  // from a measurement artifact. Sequential with a small delay — friendlier to
  // Adzuna's rate limit than a burst.
  for (const c of sample) {
    const listings      = await getAdzunaListingCount(c.title);
    await new Promise((r) => setTimeout(r, 120));
    const listingsExact = await getAdzunaListingCount(c.title, { exactPhrase: true });
    await new Promise((r) => setTimeout(r, 120));
    rows.push({ title: c.title, sector: c.sector, demandScore: c.demandScore, listings, listingsExact });
  }

  const usable  = rows.filter((r) => r.listings !== null && r.listings > 0);
  const zero    = rows.filter((r) => r.listings === 0);
  const failed  = rows.filter((r) => r.listings === null);

  const rho = usable.length >= 4
    ? spearman(usable.map((r) => r.demandScore), usable.map((r) => r.listings as number))
    : null;

  // Same correlation, but using exact-phrase counts
  const usableExact = rows.filter((r) => r.listingsExact !== null && r.listingsExact > 0);
  const rhoExact = usableExact.length >= 4
    ? spearman(usableExact.map((r) => r.demandScore), usableExact.map((r) => r.listingsExact as number))
    : null;

  // How much does loose matching inflate each count? A high median ratio is
  // strong evidence the keyword mode is the problem, not our scores.
  const ratios = rows
    .filter((r) => r.listings && r.listingsExact && r.listingsExact > 0)
    .map((r) => (r.listings as number) / (r.listingsExact as number))
    .sort((a, b) => a - b);
  const medianInflation = ratios.length ? ratios[Math.floor(ratios.length / 2)] : null;

  // Where our static score disagrees most with the live market
  const byListings = [...usable].sort((a, b) => (b.listings! - a.listings!));
  const mismatches = usable
    .map((r) => ({
      ...r,
      listingRank: byListings.findIndex((x) => x.title === r.title) + 1,
      scoreRank:   [...usable].sort((a, b) => b.demandScore - a.demandScore).findIndex((x) => x.title === r.title) + 1,
    }))
    .map((r) => ({ ...r, gap: Math.abs(r.listingRank - r.scoreRank) }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);

  const verdict =
    usable.length < sample.length * 0.5
      ? "WEAK — too many careers return no listings; Adzuna alone can't drive demand scores."
      : rho === null
        ? "INCONCLUSIVE — not enough usable data points."
        : rho >= 0.5
          ? `USABLE — listings broadly track our demand scores (rho ${rho.toFixed(2)}). Safe to blend as a live signal.`
          : rho >= 0.2
            ? `MIXED — weak positive correlation (rho ${rho.toFixed(2)}). Usable as a secondary signal, not a replacement.`
            : `POOR — little/no correlation (rho ${rho.toFixed(2)}). Either our scores or the title matching need work before trusting it.`;

  const verdictExact =
    rhoExact === null ? "INCONCLUSIVE"
    : rhoExact >= 0.5 ? `USABLE with exact-phrase matching (rho ${rhoExact.toFixed(2)})`
    : rhoExact >= 0.2 ? `MIXED with exact-phrase matching (rho ${rhoExact.toFixed(2)})`
    : `POOR even with exact-phrase matching (rho ${rhoExact.toFixed(2)}) — the demand scores themselves are the problem, not the matching.`;

  return NextResponse.json({
    sampled:        rows.length,
    usable:         usable.length,
    usableExact:    usableExact.length,
    zeroListings:   zero.length,
    failedRequests: failed.length,
    spearmanRho:      rho,
    spearmanRhoExact: rhoExact,
    medianInflation,   // keyword count ÷ exact-phrase count
    verdict,
    verdictExact,
    totalLiveListings: usable.reduce((s, r) => s + (r.listings ?? 0), 0),
    biggestMismatches: mismatches.map((m) => ({
      title: m.title, demandScore: m.demandScore, listings: m.listings,
      ourRank: m.scoreRank, marketRank: m.listingRank,
    })),
    rows: rows.sort((a, b) => (b.listings ?? -1) - (a.listings ?? -1)),
  });
}
