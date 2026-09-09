/**
 * Plain-English search aliases.
 *
 * People do not search the way our data is labelled. They type "lawyer", not
 * "Legal & Compliance"; "coding", not "Software Engineer". These mappings expand
 * a typed query into the sector and title terms our rows actually carry.
 *
 * This used to be a local const inside the /job-market page component, which
 * meant the landing-page hero could not reach it. A hero typeahead that returns
 * nothing for "boilermaker" or "call centre" is a dead end in the most visible
 * spot on the site, so it lives here now and both surfaces share it.
 */

export const SEARCH_ALIASES: Record<string, string[]> = {
  law: ["Legal & Compliance", "Attorney", "Paralegal", "Labour Relations"],
  lawyer: ["Legal & Compliance", "Attorney", "Paralegal", "Labour Relations"],
  advocate: ["Legal & Compliance", "Attorney"],
  legal: ["Legal & Compliance"],
  doctor: ["Healthcare", "Medical", "MBChB"],
  medicine: ["Healthcare", "MBChB", "Clinical"],
  physician: ["Healthcare", "Medical"],
  nurse: ["Healthcare", "Nursing"],
  nursing: ["Healthcare", "Nursing", "Nurse"],
  coding: ["Technology", "Software", "Developer"],
  programming: ["Technology", "Software Engineer", "Developer"],
  programmer: ["Technology", "Software Engineer", "Developer"],
  developer: ["Software Engineer", "Technology"],
  coder: ["Technology", "Software Engineer"],
  finance: ["Finance", "Accounting", "Chartered Accountant"],
  accounting: ["Finance", "Chartered Accountant", "BCom"],
  accountant: ["Finance", "Chartered Accountant", "Accounting"],
  ca: ["Chartered Accountant", "Finance"],
  teaching: ["Education", "Teacher", "BEd"],
  teacher: ["Education", "BEd"],
  marketing: ["Marketing", "Media & Creative", "Digital Marketing"],
  design: ["UX", "Graphic", "Media & Creative"],
  designer: ["UX", "Graphic", "Media & Creative"],
  mining: ["Mining & Resources"],
  trade: ["Construction & Trades", "Electrician", "Plumber"],
  electrician: ["Electrical", "Construction & Trades"],
  plumber: ["Construction & Trades", "Plumbing"],
  hr: ["Human Resources"],
  it: ["Technology", "Information Technology"],
  tech: ["Technology"],
  cyber: ["Cybersecurity"],
  security: ["Cybersecurity", "Security"],
  data: ["Data Scientist", "Data Analyst", "Technology"],
  engineering: ["Engineering"],
  engineer: ["Engineering", "Technology"],
  psychology: ["Industrial Psychology", "Psychology"],
  "social work": ["Social Worker", "Social"],
  pharmacy: ["Pharmacy", "Healthcare"],
  pharmacist: ["Pharmacy", "Healthcare"],
  architect: ["Architecture", "Cloud Architect"],
  journalism: ["Media & Creative", "Journalist"],
  journalist: ["Media & Creative", "Journalist"],
};

/** The minimum shape a row needs for `matchesQuery` to rank it. */
export interface SearchableCareer {
  title: string;
  sector: string;
  topSkills?: string[];
  relatedCareers?: string[];
}

/**
 * Does this career answer the typed query?
 *
 * Matches on alias expansion first, then title, sector, skills and related
 * roles — so "python" finds Data Scientist even though no title contains it.
 * An empty query matches everything.
 */
export function matchesQuery(career: SearchableCareer, rawQuery: string): boolean {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;

  const aliasTerms = SEARCH_ALIASES[q] ?? [];
  const matchesAlias = aliasTerms.some(
    (term) =>
      career.title.toLowerCase().includes(term.toLowerCase()) ||
      career.sector.toLowerCase().includes(term.toLowerCase())
  );

  return (
    matchesAlias ||
    career.title.toLowerCase().includes(q) ||
    career.sector.toLowerCase().includes(q) ||
    (career.topSkills ?? []).some((s) => s.toLowerCase().includes(q)) ||
    (career.relatedCareers ?? []).some((r) => r.toLowerCase().includes(q))
  );
}

/**
 * Rank matches so the typeahead's first row is the one most likely intended.
 * Lower score sorts first: an exact title match beats a prefix, which beats a
 * mention anywhere else.
 */
export function matchRank(career: SearchableCareer, rawQuery: string): number {
  const q = rawQuery.toLowerCase().trim();
  const title = career.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (career.sector.toLowerCase().includes(q)) return 3;
  return 4;
}
