/**
 * South African CAPS (Curriculum and Assessment Policy Statement)
 * Grade 10–12 subjects and their career mappings.
 */

// ── All CAPS subjects ─────────────────────────────────────────────────────────

export const CAPS_SUBJECTS = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "Accounting",
  "Business Studies",
  "Economics",
  "Information Technology (IT)",
  "Computer Applications Technology (CAT)",
  "Engineering Graphics & Design",
  "History",
  "Geography",
  "Agricultural Sciences",
  "Agricultural Technology",
  "Electrical Technology",
  "Civil Technology",
  "Mechanical Technology",
  "Tourism",
  "Consumer Studies",
  "Visual Arts",
  "Dramatic Arts",
  "Music",
  "Life Orientation",
] as const;

export type CapsSubject = (typeof CAPS_SUBJECTS)[number];

// ── Subject groups for UI display ─────────────────────────────────────────────

export const SUBJECT_GROUPS: { label: string; color: string; subjects: string[] }[] = [
  {
    label: "Mathematics & Sciences",
    color: "indigo",
    subjects: ["Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences"],
  },
  {
    label: "Business & Finance",
    color: "emerald",
    subjects: ["Accounting", "Business Studies", "Economics"],
  },
  {
    label: "Technology & Computing",
    color: "violet",
    subjects: [
      "Information Technology (IT)",
      "Computer Applications Technology (CAT)",
      "Engineering Graphics & Design",
    ],
  },
  {
    label: "Technical Trades",
    color: "amber",
    subjects: ["Electrical Technology", "Civil Technology", "Mechanical Technology", "Agricultural Technology"],
  },
  {
    label: "Social & Humanities",
    color: "blue",
    subjects: ["History", "Geography", "Agricultural Sciences", "Tourism", "Consumer Studies"],
  },
  {
    label: "Arts & Expression",
    color: "pink",
    subjects: ["Visual Arts", "Dramatic Arts", "Music"],
  },
];

// ── Career → subject mappings ─────────────────────────────────────────────────

export interface SubjectRequirements {
  required: string[];      // Needed to enter this career path
  recommended: string[];   // Boost your chances / helpful
}

export const CAREER_SUBJECTS: Record<string, SubjectRequirements> = {

  // ── Technology ───────────────────────────────────────────────────────────────
  "software-engineer":         { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)", "Physical Sciences"] },
  "data-scientist":            { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences", "Computer Applications Technology (CAT)"] },
  "cloud-architect":           { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "cybersecurity-analyst":     { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "data-analyst":              { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Accounting", "Computer Applications Technology (CAT)"] },
  "ai-ml-engineer":            { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences", "Computer Applications Technology (CAT)"] },
  "devops-engineer":           { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "product-manager":           { required: ["Mathematics"], recommended: ["Business Studies", "Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "ux-designer":               { required: ["Mathematics"], recommended: ["Visual Arts", "Computer Applications Technology (CAT)", "Information Technology (IT)"] },
  "full-stack-developer":      { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "mobile-developer":          { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "database-administrator":    { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "it-support":                { required: ["Mathematics"], recommended: ["Computer Applications Technology (CAT)", "Information Technology (IT)"] },
  "network-engineer":          { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences"] },
  "bi-developer":              { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Accounting", "Computer Applications Technology (CAT)"] },
  "qa-engineer":               { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "solutions-architect":       { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences"] },
  "scrum-master":              { required: ["Mathematics"], recommended: ["Business Studies", "Information Technology (IT)"] },
  "data-engineer":             { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences"] },
  "blockchain-developer":      { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences"] },

  // ── Finance & Accounting ─────────────────────────────────────────────────────
  "financial-analyst":         { required: ["Mathematics", "Accounting"], recommended: ["Economics", "Business Studies"] },
  "chartered-accountant":      { required: ["Mathematics", "Accounting"], recommended: ["Economics", "Business Studies"] },
  "actuary":                   { required: ["Mathematics"], recommended: ["Physical Sciences", "Accounting", "Economics"] },
  "tax-consultant":            { required: ["Mathematics", "Accounting"], recommended: ["Economics", "Business Studies"] },
  "financial-planner":         { required: ["Mathematics"], recommended: ["Accounting", "Economics", "Business Studies"] },
  "compliance-officer":        { required: ["Mathematics"], recommended: ["Accounting", "Business Studies", "Economics"] },
  "investment-analyst":        { required: ["Mathematics", "Accounting"], recommended: ["Economics", "Business Studies"] },
  "insurance-broker":          { required: ["Mathematics"], recommended: ["Accounting", "Business Studies", "Economics"] },
  "bookkeeper":                { required: ["Accounting"], recommended: ["Mathematics", "Business Studies", "Economics"] },

  // ── Engineering ──────────────────────────────────────────────────────────────
  "civil-engineer":            { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Geography"] },
  "electrical-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Electrical Technology"] },
  "mechanical-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Mechanical Technology"] },
  "chemical-engineer":         { required: ["Mathematics", "Physical Sciences"], recommended: ["Life Sciences", "Geography"] },
  "structural-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Civil Technology"] },
  "industrial-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Business Studies"] },
  "project-manager":           { required: ["Mathematics"], recommended: ["Business Studies", "Engineering Graphics & Design", "Economics"] },
  "renewable-energy-engineer": { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Geography"] },

  // ── Trades & Artisans ────────────────────────────────────────────────────────
  "electrician-artisan":       { required: ["Mathematics"], recommended: ["Electrical Technology", "Physical Sciences", "Engineering Graphics & Design"] },
  "plumber":                   { required: ["Mathematics"], recommended: ["Civil Technology", "Physical Sciences"] },
  "solar-pv-installer":        { required: ["Mathematics"], recommended: ["Electrical Technology", "Physical Sciences"] },
  "motor-mechanic":            { required: ["Mathematics"], recommended: ["Mechanical Technology", "Physical Sciences"] },
  "welder":                    { required: ["Mathematics"], recommended: ["Mechanical Technology", "Engineering Graphics & Design"] },
  "carpenter":                 { required: ["Mathematics"], recommended: ["Civil Technology", "Engineering Graphics & Design"] },
  "hvac-technician":           { required: ["Mathematics"], recommended: ["Mechanical Technology", "Physical Sciences", "Electrical Technology"] },
  "diesel-mechanic":           { required: ["Mathematics"], recommended: ["Mechanical Technology", "Physical Sciences"] },
  "refrigeration-mechanic":    { required: ["Mathematics"], recommended: ["Mechanical Technology", "Physical Sciences", "Electrical Technology"] },
  "bricklayer":                { required: ["Mathematics"], recommended: ["Civil Technology"] },
  "painter-decorator":         { required: ["Mathematical Literacy"], recommended: ["Consumer Studies", "Visual Arts"] },

  // ── Healthcare ───────────────────────────────────────────────────────────────
  "medical-doctor":            { required: ["Mathematics", "Physical Sciences", "Life Sciences"], recommended: [] },
  "nurse-professional":        { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences"] },
  "pharmacist":                { required: ["Mathematics", "Physical Sciences", "Life Sciences"], recommended: [] },
  "physiotherapist":           { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences"] },
  "radiographer":              { required: ["Mathematics", "Physical Sciences"], recommended: ["Life Sciences"] },
  "paramedic":                 { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences"] },
  "psychologist":              { required: ["Mathematics", "Life Sciences"], recommended: ["Business Studies", "Geography"] },
  "dentist":                   { required: ["Mathematics", "Physical Sciences", "Life Sciences"], recommended: [] },
  "occupational-therapist":    { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences"] },

  // ── Legal ────────────────────────────────────────────────────────────────────
  "attorney":                  { required: ["Mathematics"], recommended: ["History", "Business Studies", "Economics"] },
  "paralegal":                 { required: ["Mathematical Literacy"], recommended: ["Business Studies", "History"] },
  "labour-relations":          { required: ["Mathematics"], recommended: ["Business Studies", "History", "Economics"] },

  // ── Human Resources ──────────────────────────────────────────────────────────
  "hr-manager":                { required: ["Mathematics"], recommended: ["Business Studies", "Economics", "History"] },
  "recruiter":                 { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },

  // ── Mining & Resources ───────────────────────────────────────────────────────
  "mining-engineer":           { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Engineering Graphics & Design"] },
  "geologist":                 { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Life Sciences"] },
  "mine-safety-officer":       { required: ["Mathematics"], recommended: ["Physical Sciences", "Life Sciences"] },
  "metallurgist":              { required: ["Mathematics", "Physical Sciences"], recommended: ["Life Sciences"] },

  // ── Media & Creative ─────────────────────────────────────────────────────────
  "graphic-designer":          { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Computer Applications Technology (CAT)"] },
  "content-creator":           { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Dramatic Arts", "Computer Applications Technology (CAT)"] },
  "journalist":                { required: ["Mathematical Literacy"], recommended: ["History", "Geography", "Dramatic Arts"] },
  "copywriter":                { required: ["Mathematical Literacy"], recommended: ["History", "Dramatic Arts"] },
  "video-editor":              { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Computer Applications Technology (CAT)", "Dramatic Arts"] },
  "pr-manager":                { required: ["Mathematical Literacy"], recommended: ["Business Studies", "History", "Dramatic Arts"] },

  // ── Property & Construction ──────────────────────────────────────────────────
  "estate-agent":              { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Geography"] },
  "quantity-surveyor":         { required: ["Mathematics"], recommended: ["Engineering Graphics & Design", "Civil Technology", "Economics"] },
  "site-agent":                { required: ["Mathematics"], recommended: ["Civil Technology", "Engineering Graphics & Design"] },
  "town-planner":              { required: ["Mathematics"], recommended: ["Geography", "Engineering Graphics & Design", "History"] },
  "architect":                 { required: ["Mathematics", "Engineering Graphics & Design"], recommended: ["Physical Sciences", "Visual Arts"] },

  // ── Hospitality & Tourism ────────────────────────────────────────────────────
  "hotel-manager":             { required: ["Mathematical Literacy"], recommended: ["Tourism", "Business Studies", "Consumer Studies"] },
  "tour-guide":                { required: ["Mathematical Literacy"], recommended: ["Tourism", "Geography", "History"] },
  "events-coordinator":        { required: ["Mathematical Literacy"], recommended: ["Tourism", "Business Studies", "Consumer Studies"] },
  "chef":                      { required: ["Mathematical Literacy"], recommended: ["Consumer Studies", "Life Sciences", "Business Studies"] },

  // ── Logistics & Supply Chain ─────────────────────────────────────────────────
  "supply-chain-manager":      { required: ["Mathematics"], recommended: ["Business Studies", "Economics", "Geography"] },
  "logistics-coordinator":     { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Geography", "Economics"] },
  "freight-forwarder":         { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Geography"] },
  "warehouse-manager":         { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },
  "truck-driver":              { required: ["Mathematical Literacy"], recommended: ["Geography"] },

  // ── Agriculture ──────────────────────────────────────────────────────────────
  "agricultural-technician":   { required: ["Mathematics", "Agricultural Sciences"], recommended: ["Life Sciences", "Physical Sciences"] },
  "farm-manager":              { required: ["Mathematical Literacy", "Agricultural Sciences"], recommended: ["Life Sciences", "Business Studies"] },
  "veterinarian":              { required: ["Mathematics", "Life Sciences", "Physical Sciences"], recommended: ["Agricultural Sciences"] },
  "food-scientist":            { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences", "Agricultural Sciences"] },

  // ── BPO & Customer Service ───────────────────────────────────────────────────
  "call-centre-agent":         { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)"] },
  "customer-experience-manager":{ required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)"] },

  // ── Government & Public Sector ───────────────────────────────────────────────
  "public-administrator":      { required: ["Mathematical Literacy"], recommended: ["History", "Business Studies", "Economics"] },
  "policy-analyst":            { required: ["Mathematics"], recommended: ["History", "Economics", "Geography"] },

  // ── Education ────────────────────────────────────────────────────────────────
  "teacher":                   { required: ["Mathematics"], recommended: ["History", "Life Sciences", "Business Studies"] },
  "lecturer":                  { required: ["Mathematics"], recommended: ["Life Sciences", "History", "Physical Sciences"] },
  "school-principal":          { required: ["Mathematics"], recommended: ["Business Studies", "History"] },

  // ── Social Services ──────────────────────────────────────────────────────────
  "social-worker":             { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "History", "Geography"] },
  "ecd-practitioner":          { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Consumer Studies"] },
  "community-development-worker":{ required: ["Mathematical Literacy"], recommended: ["Geography", "History", "Business Studies"] },
  "ngo-manager":               { required: ["Mathematical Literacy"], recommended: ["Business Studies", "History", "Economics"] },
  "security-officer":          { required: ["Mathematical Literacy"], recommended: ["Business Studies"] },

  // ── Energy & Environment ─────────────────────────────────────────────────────
  "energy-auditor":            { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Engineering Graphics & Design"] },
  "environmental-scientist":   { required: ["Mathematics", "Life Sciences", "Geography"], recommended: ["Physical Sciences", "Agricultural Sciences"] },

  // ── Digital Marketing ────────────────────────────────────────────────────────
  "digital-marketing-specialist":{ required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)", "Economics"] },
  "retail-manager":            { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Consumer Studies"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // Expansion — remaining careers.
  // "Mathematical Literacy" as REQUIRED means "a numeracy subject is needed";
  // because Mathematics satisfies a Maths Lit requirement (see satisfies() in
  // the subject-choice tool), learners taking Mathematics also qualify.
  // Reserve "Mathematics" as required only where real Maths is genuinely
  // demanded for entry — over-requiring wrongly closes doors for learners.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Technology ───────────────────────────────────────────────────────────────
  "ai-engineer":               { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Physical Sciences"] },
  "penetration-tester":        { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "soc-analyst":               { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "platform-engineer":         { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "data-governance-analyst":   { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Accounting"] },
  "erp-consultant":            { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Accounting", "Business Studies"] },
  "it-project-manager":        { required: ["Mathematical Literacy"], recommended: ["Information Technology (IT)", "Business Studies", "Computer Applications Technology (CAT)"] },
  "business-analyst":          { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Business Studies", "Accounting"] },
  "startup-founder":           { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Accounting"] },

  // ── Engineering ──────────────────────────────────────────────────────────────
  "mechatronics-engineer":     { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design", "Mechanical Technology", "Electrical Technology"] },
  "automation-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology", "Information Technology (IT)"] },
  "biomedical-engineer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Life Sciences", "Engineering Graphics & Design"] },
  "petroleum-engineer":        { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Engineering Graphics & Design"] },
  "telecommunications-engineer":{ required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology", "Information Technology (IT)"] },

  // ── Finance & Banking ────────────────────────────────────────────────────────
  "risk-manager":              { required: ["Mathematics"], recommended: ["Accounting", "Economics", "Business Studies"] },
  "forex-trader":              { required: ["Mathematics"], recommended: ["Economics", "Accounting"] },
  "portfolio-manager":         { required: ["Mathematics"], recommended: ["Accounting", "Economics"] },
  "internal-auditor":          { required: ["Mathematics", "Accounting"], recommended: ["Business Studies", "Economics"] },
  "credit-analyst":            { required: ["Mathematics"], recommended: ["Accounting", "Economics"] },
  "treasury-analyst":          { required: ["Mathematics"], recommended: ["Accounting", "Economics"] },
  "management-accountant":     { required: ["Mathematics", "Accounting"], recommended: ["Business Studies", "Economics"] },
  "sars-tax-practitioner":     { required: ["Mathematics", "Accounting"], recommended: ["Business Studies", "Economics"] },
  "venture-capital-analyst":   { required: ["Mathematics"], recommended: ["Accounting", "Economics", "Business Studies"] },

  // ── Fraud & Financial Crime ──────────────────────────────────────────────────
  "fraud-analyst":             { required: ["Mathematics"], recommended: ["Accounting", "Information Technology (IT)"] },
  "fraud-investigator":        { required: ["Mathematical Literacy"], recommended: ["Accounting", "Business Studies"] },
  "forensic-accountant":       { required: ["Mathematics", "Accounting"], recommended: ["Business Studies", "Information Technology (IT)"] },
  "aml-analyst":               { required: ["Mathematics"], recommended: ["Accounting", "Business Studies"] },
  "kyc-officer":               { required: ["Mathematical Literacy"], recommended: ["Accounting", "Business Studies"] },
  "cybercrime-investigator":   { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)"] },
  "financial-crime-manager":   { required: ["Mathematics"], recommended: ["Accounting", "Business Studies"] },
  "fraud-risk-manager":        { required: ["Mathematics"], recommended: ["Accounting", "Business Studies"] },

  // ── Healthcare ───────────────────────────────────────────────────────────────
  "clinical-psychologist":     { required: ["Life Sciences"], recommended: ["Mathematics", "Life Orientation"] },
  "dietitian":                 { required: ["Mathematics", "Physical Sciences", "Life Sciences"], recommended: ["Consumer Studies"] },
  "speech-therapist":          { required: ["Life Sciences"], recommended: ["Mathematics", "Physical Sciences"] },
  "audiologist":               { required: ["Mathematics", "Life Sciences"], recommended: ["Physical Sciences"] },
  "emergency-care-practitioner":{ required: ["Life Sciences"], recommended: ["Mathematics", "Physical Sciences", "Life Orientation"] },
  "medical-scientist":         { required: ["Mathematics", "Physical Sciences", "Life Sciences"], recommended: [] },
  "sports-scientist":          { required: ["Life Sciences"], recommended: ["Mathematics", "Physical Sciences", "Life Orientation"] },
  "wellness-coach":            { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Life Orientation", "Consumer Studies"] },

  // ── Government & Public Sector ───────────────────────────────────────────────
  "municipal-manager":         { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Geography"] },
  "government-procurement":    { required: ["Mathematical Literacy"], recommended: ["Accounting", "Business Studies", "Economics"] },
  "diplomat":                  { required: ["Mathematical Literacy"], recommended: ["History", "Geography", "Economics"] },
  "statistician":              { required: ["Mathematics"], recommended: ["Information Technology (IT)", "Economics"] },
  "urban-planner":             { required: ["Mathematics"], recommended: ["Geography", "Engineering Graphics & Design"] },

  // ── Environment & Sustainability ─────────────────────────────────────────────
  "sustainability-manager":    { required: ["Mathematical Literacy"], recommended: ["Geography", "Life Sciences", "Business Studies"] },
  "water-engineer":            { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Civil Technology"] },
  "climate-change-analyst":    { required: ["Mathematics"], recommended: ["Geography", "Life Sciences"] },
  "waste-management-specialist":{ required: ["Mathematical Literacy"], recommended: ["Geography", "Life Sciences"] },

  // ── Energy ───────────────────────────────────────────────────────────────────
  "energy-manager":            { required: ["Mathematics"], recommended: ["Physical Sciences", "Electrical Technology"] },
  "wind-energy-technician":    { required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology", "Mechanical Technology"] },
  "battery-storage-specialist":{ required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology"] },

  // ── Education ────────────────────────────────────────────────────────────────
  "education-psychologist":    { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Life Orientation"] },
  "curriculum-developer":      { required: ["Mathematical Literacy"], recommended: ["Life Orientation", "History"] },
  "tvet-lecturer":             { required: ["Mathematical Literacy"], recommended: ["Mechanical Technology", "Electrical Technology", "Business Studies"] },
  "special-needs-educator":    { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Life Orientation"] },

  // ── Design & Creative ────────────────────────────────────────────────────────
  "motion-designer":           { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Computer Applications Technology (CAT)", "Information Technology (IT)"] },
  "ui-designer":               { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Computer Applications Technology (CAT)", "Information Technology (IT)"] },
  "3d-visualiser":             { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Engineering Graphics & Design", "Computer Applications Technology (CAT)"] },
  "interior-designer":         { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Engineering Graphics & Design", "Consumer Studies"] },
  "creative-director":         { required: ["Mathematical Literacy"], recommended: ["Visual Arts", "Dramatic Arts", "Business Studies"] },

  // ── Media & Creative ─────────────────────────────────────────────────────────
  "podcast-producer":          { required: ["Mathematical Literacy"], recommended: ["Dramatic Arts", "Music", "Computer Applications Technology (CAT)"] },
  "data-journalist":           { required: ["Mathematics"], recommended: ["Information Technology (IT)", "History"] },
  "documentary-filmmaker":     { required: ["Mathematical Literacy"], recommended: ["Dramatic Arts", "Visual Arts", "History"] },

  // ── Marketing & Communications ───────────────────────────────────────────────
  "brand-manager":             { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics", "Visual Arts"] },
  "social-media-manager":      { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)", "Visual Arts"] },
  "seo-specialist":            { required: ["Mathematical Literacy"], recommended: ["Information Technology (IT)", "Computer Applications Technology (CAT)", "Business Studies"] },
  "media-planner":             { required: ["Mathematics"], recommended: ["Business Studies", "Economics"] },
  "communications-manager":    { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Dramatic Arts", "History"] },
  "performance-marketer":      { required: ["Mathematics"], recommended: ["Business Studies", "Information Technology (IT)", "Economics"] },

  // ── Human Resources ──────────────────────────────────────────────────────────
  "hrbp":                      { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Life Orientation", "Economics"] },
  "learning-development":      { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Life Orientation"] },
  "compensation-benefits":     { required: ["Mathematics"], recommended: ["Accounting", "Business Studies"] },
  "payroll-administrator":     { required: ["Mathematical Literacy"], recommended: ["Accounting", "Business Studies", "Computer Applications Technology (CAT)"] },
  "talent-acquisition":        { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Life Orientation"] },

  // ── Insurance ────────────────────────────────────────────────────────────────
  "short-term-underwriter":    { required: ["Mathematics"], recommended: ["Accounting", "Business Studies"] },
  "claims-manager":            { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Accounting"] },
  "life-insurance-advisor":    { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Accounting", "Economics"] },

  // ── Legal & Compliance ───────────────────────────────────────────────────────
  "conveyancer":               { required: ["Mathematical Literacy"], recommended: ["Business Studies", "History"] },
  "data-privacy-officer":      { required: ["Mathematical Literacy"], recommended: ["Information Technology (IT)", "Business Studies"] },
  "anti-money-laundering":     { required: ["Mathematical Literacy"], recommended: ["Accounting", "Business Studies"] },

  // ── Logistics & Supply Chain ─────────────────────────────────────────────────
  "customs-clearing-agent":    { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Geography", "Economics"] },
  "demand-planner":            { required: ["Mathematics"], recommended: ["Business Studies", "Economics"] },
  "fleet-manager":             { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Mechanical Technology"] },

  // ── Mining & Resources ───────────────────────────────────────────────────────
  "mine-surveyor":             { required: ["Mathematics", "Physical Sciences"], recommended: ["Geography", "Engineering Graphics & Design"] },
  "ventilation-officer":       { required: ["Mathematics", "Physical Sciences"], recommended: ["Mechanical Technology"] },
  "metallurgical-technician":  { required: ["Mathematics", "Physical Sciences"], recommended: ["Engineering Graphics & Design"] },

  // ── Property & Construction ──────────────────────────────────────────────────
  "facilities-manager":        { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Civil Technology"] },
  "property-developer":        { required: ["Mathematics"], recommended: ["Business Studies", "Accounting", "Engineering Graphics & Design"] },
  "building-inspector":        { required: ["Mathematics"], recommended: ["Civil Technology", "Engineering Graphics & Design"] },
  "property-valuer":           { required: ["Mathematics"], recommended: ["Accounting", "Business Studies", "Geography"] },

  // ── Retail & FMCG ────────────────────────────────────────────────────────────
  "category-manager":          { required: ["Mathematics"], recommended: ["Business Studies", "Economics"] },
  "merchandiser":              { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Consumer Studies"] },
  "fmcg-sales-rep":            { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },
  "key-account-manager":       { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },
  "supply-planner":            { required: ["Mathematics"], recommended: ["Business Studies", "Economics"] },
  "trade-marketer":            { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Visual Arts"] },
  "e-commerce-manager":        { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Information Technology (IT)", "Computer Applications Technology (CAT)"] },

  // ── Security & Safety ────────────────────────────────────────────────────────
  "security-manager":          { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Life Orientation"] },
  "ohs-officer":               { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Physical Sciences"] },
  "fire-protection-specialist":{ required: ["Mathematics"], recommended: ["Physical Sciences", "Civil Technology"] },
  "investigations-officer":    { required: ["Mathematical Literacy"], recommended: ["Life Orientation", "History"] },

  // ── Social Services & NGO ────────────────────────────────────────────────────
  "monitoring-evaluation":     { required: ["Mathematics"], recommended: ["Geography", "Economics", "Life Orientation"] },
  "development-practitioner":  { required: ["Mathematical Literacy"], recommended: ["Geography", "History", "Life Orientation"] },
  "fundraising-manager":       { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },

  // ── Hospitality & Tourism ────────────────────────────────────────────────────
  "revenue-manager":           { required: ["Mathematics"], recommended: ["Business Studies", "Tourism", "Economics"] },
  "safari-guide":              { required: ["Mathematical Literacy"], recommended: ["Life Sciences", "Geography", "Tourism"] },
  "travel-consultant":         { required: ["Mathematical Literacy"], recommended: ["Tourism", "Geography", "Business Studies"] },

  // ── Trades & Artisans ────────────────────────────────────────────────────────
  "boilermaker":               { required: ["Mathematics"], recommended: ["Mechanical Technology", "Engineering Graphics & Design", "Physical Sciences"] },
  "millwright":                { required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology", "Mechanical Technology"] },
  "instrumentation-technician":{ required: ["Mathematics", "Physical Sciences"], recommended: ["Electrical Technology"] },
  "sheet-metal-worker":        { required: ["Mathematical Literacy"], recommended: ["Mechanical Technology", "Engineering Graphics & Design"] },
  "rigger":                    { required: ["Mathematical Literacy"], recommended: ["Mechanical Technology", "Physical Sciences"] },
  "tiler":                     { required: ["Mathematical Literacy"], recommended: ["Civil Technology", "Engineering Graphics & Design"] },

  // ── BPO & Customer Service ───────────────────────────────────────────────────
  "contact-centre-manager":    { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)"] },
  "customer-success-manager":  { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)"] },
  "quality-assurance-bpo":     { required: ["Mathematical Literacy"], recommended: ["Business Studies", "Computer Applications Technology (CAT)"] },
  "business-development-manager":{ required: ["Mathematical Literacy"], recommended: ["Business Studies", "Economics"] },

  // ── Agriculture & Agri-processing ────────────────────────────────────────────
  "agronomist":                { required: ["Mathematics", "Life Sciences"], recommended: ["Agricultural Sciences", "Physical Sciences", "Geography"] },
  "agricultural-economist":    { required: ["Mathematics"], recommended: ["Agricultural Sciences", "Economics", "Accounting"] },
  "food-technologist":         { required: ["Mathematics", "Physical Sciences"], recommended: ["Life Sciences", "Consumer Studies", "Agricultural Sciences"] },
  "viticulturist":             { required: ["Mathematics", "Life Sciences"], recommended: ["Agricultural Sciences", "Physical Sciences"] },
};

// ── NQF pathway by career (minimum NQF entry level from Grade 12) ─────────────

export const CAREER_NQF_PATHS: Record<string, { nqfRequired: number; qualification: string; institution: string; years: string }[]> = {
  "software-engineer":     [{ nqfRequired: 4, qualification: "BSc Computer Science or Software Engineering (NQF 7)", institution: "Wits, UCT, UP, UNISA, Stellenbosch", years: "3–4 years" }],
  "medical-doctor":        [{ nqfRequired: 4, qualification: "MBChB (NQF 8)", institution: "UCT, Wits, Pretoria, Stellenbosch, UFS, UZ, WSU, SMU", years: "6 years" }],
  "chartered-accountant":  [{ nqfRequired: 4, qualification: "BCom Accounting + SAICA Articles + Board Exams", institution: "UCT, Wits, UNISA, UJ, Stellenbosch", years: "6–8 years" }],
  "electrician-artisan":   [{ nqfRequired: 3, qualification: "N1–N3 Electrical Trade Certificate + Apprenticeship", institution: "TVET College + ETDP SETA", years: "3–4 years" }],
  "civil-engineer":        [{ nqfRequired: 4, qualification: "BEng Civil Engineering (NQF 8) + ECSA registration", institution: "UCT, Wits, UP, Stellenbosch, DUT", years: "4 years" }],
  "nurse-professional":    [{ nqfRequired: 4, qualification: "BCur (NQF 7) or Diploma in Nursing + SANC registration", institution: "UWC, UNISA, Colleges of Health Sciences", years: "4 years" }],
  "financial-analyst":     [{ nqfRequired: 4, qualification: "BCom Finance or Investment Management (NQF 7)", institution: "UCT, Wits, UNISA, UJ, Stellenbosch", years: "3 years" }],
  "data-scientist":        [{ nqfRequired: 4, qualification: "BSc Statistics / Data Science (NQF 7)", institution: "UCT, Wits, UP, UNISA, Stellenbosch", years: "3–4 years" }],
};

// ── Helpful SA study resources for high schoolers ────────────────────────────

export const HS_STUDY_RESOURCES = [
  {
    name: "Siyavula",
    description: "Free textbooks and practice for Maths, Physical Sciences, and Life Sciences aligned with CAPS.",
    url: "https://www.siyavula.com",
    subjects: ["Mathematics", "Physical Sciences", "Life Sciences"],
    free: true,
  },
  {
    name: "DBE Past Papers",
    description: "Official NSC past exam papers and memos from the Department of Basic Education.",
    url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate.aspx",
    subjects: ["All subjects"],
    free: true,
  },
  {
    name: "Khan Academy",
    description: "Free video lessons and exercises covering Mathematics, Sciences, and more at your own pace.",
    url: "https://www.khanacademy.org",
    subjects: ["Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences"],
    free: true,
  },
  {
    name: "e-classroom",
    description: "South African CAPS-aligned study notes, tests, and exam papers for all Grade 10–12 subjects.",
    url: "https://www.e-classroom.co.za",
    subjects: ["All subjects"],
    free: true,
  },
  {
    name: "Study Opportunities",
    description: "Bursary and scholarship database for SA students — search by province, field, and institution.",
    url: "https://www.studyopportunities.co.za",
    subjects: ["All subjects"],
    free: true,
  },
  {
    name: "NSFAS",
    description: "National Student Financial Aid Scheme — apply for university/TVET funding if your household earns below R350k/year.",
    url: "https://www.nsfas.org.za",
    subjects: ["All subjects"],
    free: true,
  },
];
