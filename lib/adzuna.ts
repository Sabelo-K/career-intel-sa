/**
 * Adzuna South Africa job-search client
 *
 * Free API — sign up at https://developer.adzuna.com
 * Free tier: 1 000 requests / day, no credit card required.
 *
 * Required env vars:
 *   ADZUNA_APP_ID   — from your Adzuna developer dashboard
 *   ADZUNA_APP_KEY  — from your Adzuna developer dashboard
 */

export interface AdzunaJob {
  id:          string;
  title:       string;
  company:     string;
  location:    string;
  /** Monthly salary minimum in ZAR (converted from annual), or null if not advertised */
  salaryMin:   number | null;
  /** Monthly salary maximum in ZAR (converted from annual), or null if not advertised */
  salaryMax:   number | null;
  description: string;
  url:         string;
  postedAt:    string; // ISO date string
}

/** Map Prisma Province enum values → Adzuna "where" strings */
const PROVINCE_TO_ADZUNA: Record<string, string> = {
  GAUTENG:       "Gauteng",
  WESTERN_CAPE:  "Western Cape",
  KWAZULU_NATAL: "KwaZulu-Natal",
  EASTERN_CAPE:  "Eastern Cape",
  FREE_STATE:    "Free State",
  LIMPOPO:       "Limpopo",
  MPUMALANGA:    "Mpumalanga",
  NORTH_WEST:    "North West",
  NORTHERN_CAPE: "Northern Cape",
};

export interface AdzunaSearchOptions {
  keywords:           string[];
  province?:          string | null;
  /** Monthly minimum salary in ZAR — Adzuna expects annual, we convert */
  minSalaryMonthly?:  number | null;
  /** true = remote only, false = on-site only, null/undefined = any */
  remote?:            boolean | null;
  maxResults?:        number;
  /** Only return jobs posted at most this many days ago (cron: 1, UI: omit) */
  maxDaysOld?:        number;
}

/**
 * Search Adzuna SA for jobs matching the given criteria.
 * Returns an empty array on any error so callers can degrade gracefully.
 * Results are cached by Next.js for 1 hour per unique query.
 */
export async function searchAdzunaJobs(opts: AdzunaSearchOptions): Promise<AdzunaJob[]> {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  // Use the first keyword as an exact phrase match (the role title),
  // and OR-join any additional keywords for broader coverage.
  // This prevents "Quality Assurance Analyst" splitting into
  // "Quality OR Assurance OR Analyst" which matches completely unrelated jobs.
  const [primaryKeyword, ...extraKeywords] = opts.keywords;

  const params = new URLSearchParams({
    app_id:           appId,
    app_key:          appKey,
    results_per_page: String(opts.maxResults ?? 5),
    what:             primaryKeyword,   // exact phrase match for the role title
    sort_by:          "date",
    // Note: do NOT pass content_type as a query param — Adzuna returns JSON by
    // default and passing it causes a 400 on their SA endpoint.
  });

  // Add extra keywords as OR broadening terms if present
  if (extraKeywords.length > 0) {
    params.set("what_or", extraKeywords.join(" "));
  }

  if (opts.province) {
    params.set("where", PROVINCE_TO_ADZUNA[opts.province] ?? opts.province);
  }

  if (opts.minSalaryMonthly && opts.minSalaryMonthly > 0) {
    // Adzuna stores salaries annually
    params.set("salary_min", String(opts.minSalaryMonthly * 12));
  }

  if (opts.maxDaysOld && opts.maxDaysOld > 0) {
    params.set("max_days_old", String(opts.maxDaysOld));
  }

  // Adzuna has no dedicated remote flag — appending "remote" to keyword search is the standard workaround
  if (opts.remote === true) {
    params.set("what_and", "remote");
  }

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/za/search/1?${params}`,
      { next: { revalidate: 3600 } } // server-side cache: 1 hour
    );
    if (!res.ok) return [];

    const data = await res.json() as {
      results?: Record<string, unknown>[];
    };

    return (data.results ?? []).map((j) => {
      const company  = j.company  as Record<string, unknown> | undefined;
      const location = j.location as Record<string, unknown> | undefined;
      const raw      = j.description as string | undefined ?? "";

      // Strip HTML tags that Adzuna occasionally includes
      const description = raw.replace(/<[^>]+>/g, " ").slice(0, 240).trimEnd();

      return {
        id:          String(j.id ?? ""),
        title:       String(j.title ?? ""),
        company:     String(company?.display_name  ?? "Company not listed"),
        location:    String(location?.display_name ?? "South Africa"),
        // Convert annual → monthly, round to nearest hundred
        salaryMin:   j.salary_min ? Math.round(Number(j.salary_min) / 12 / 100) * 100 : null,
        salaryMax:   j.salary_max ? Math.round(Number(j.salary_max) / 12 / 100) * 100 : null,
        description: description + (raw.length > 240 ? "…" : ""),
        url:         String(j.redirect_url ?? ""),
        postedAt:    String(j.created ?? ""),
      };
    });
  } catch {
    return [];
  }
}

/** Check whether Adzuna credentials are configured */
export function isAdzunaConfigured(): boolean {
  return !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}
