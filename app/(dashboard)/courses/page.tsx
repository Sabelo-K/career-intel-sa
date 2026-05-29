"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock, Globe, GraduationCap, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SA_COURSES, COURSE_PLATFORMS } from "@/lib/data/sa-courses";

const CATEGORIES = [
  "All",
  "Data & AI",
  "Software Dev",
  "Cloud & DevOps",
  "Cybersecurity",
  "Finance",
  "Engineering",
  "Healthcare",
  "Energy & Solar",
  "Trades",
  "Marketing",
  "Hospitality",
  "Education",
  "Environment",
];

// Map category label → skill keywords for filtering
const CATEGORY_SKILLS: Record<string, string[]> = {
  "Data & AI":      ["Data Science","Machine Learning","Data Analysis","Python","SQL","Tableau","Power BI","Deep Learning","NLP","MLOps","AI","Data Visualization","Business Intelligence"],
  "Software Dev":   ["JavaScript","React","Node.js","TypeScript","Python","Algorithms","Full Stack","Web Development"],
  "Cloud & DevOps": ["AWS","Azure","GCP","Terraform","Docker","Kubernetes","DevOps","CI/CD","Cloud","Infrastructure as Code"],
  "Cybersecurity":  ["Cybersecurity","Network Security","Ethical Hacking","SIEM","Incident Response","Penetration Testing","Security"],
  "Finance":        ["Financial Modeling","IFRS","Accounting","CFA","Valuation","Bloomberg","Tax","Audit","Excel","Financial Analysis"],
  "Engineering":    ["AutoCAD","Project Management","PLC","Structural Analysis","Renewable Energy","Engineering","ECSA","SANS Standards"],
  "Healthcare":     ["Patient Care","Clinical Assessment","ICU","Nursing","Healthcare","EMR","Leadership","Medical"],
  "Energy & Solar": ["Solar PV","Renewable Energy","HOMER","Battery Systems","Grid Integration","SAPVIA","EWSETA","Energy Storage"],
  "Trades":         ["Welding","Plumbing","Electrical","SANS 10142","Fault Finding","Refrigeration","HVAC","Artisan","MERSETA","TVET","CETA"],
  "Marketing":      ["SEO","Social Media","Google Analytics","Content Marketing","Meta Ads","Email Marketing","Digital Marketing"],
  "Hospitality":    ["Hospitality","Food & Beverage","Chef","Culinary","Tourism","Kitchen","CATHSSETA"],
  "Education":      ["Curriculum","Teaching","PGCE","EdTech","Assessment","Classroom"],
  "Environment":    ["Environmental","GIS","Climate","EIA","Water Quality","Sustainability","ESG"],
};

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);

  // Sync search when ?q= param changes (e.g. back/forward navigation)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearch(q);
  }, [searchParams]);

  const filtered = SA_COURSES.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) ||
      c.provider.toLowerCase().includes(q) ||
      c.platform.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q));
    const matchFree = freeOnly ? c.price === "free" || c.price === 0 : true;
    const matchPlatform = selectedPlatform === "all" ? true : c.platform.toLowerCase().includes(selectedPlatform.toLowerCase());
    const matchCategory = selectedCategory === "All" ? true :
      (CATEGORY_SKILLS[selectedCategory] ?? []).some((kw) =>
        c.skills.some((s) => s.toLowerCase().includes(kw.toLowerCase())) ||
        c.title.toLowerCase().includes(kw.toLowerCase())
      );
    return matchSearch && matchFree && matchPlatform && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Curated courses from SA universities, SETAs, Coursera, Udemy and more — matched to SA demand.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Platform chips */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Filter by Platform</div>
        <div className="flex flex-wrap gap-2">
          {COURSE_PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id === selectedPlatform ? "all" : p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                selectedPlatform === p.id
                  ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{p.logo}</span>
              {p.name}
              {p.local && <Badge variant="success" className="text-xs py-0 px-1">SA</Badge>}
              {p.freeOptions && <Badge variant="indigo" className="text-xs py-0 px-1">Free</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap deep-link banner */}
      {searchParams.get("q") && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-sm"
        >
          <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-indigo-200 flex-1">
            Showing courses for <strong className="text-indigo-300">{searchParams.get("q")}</strong> — from your learning roadmap
          </span>
          <button
            onClick={() => setSearch("")}
            className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors font-medium"
          >
            Clear ×
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses or skills..." className="pl-9" />
        </div>
        <button
          onClick={() => setFreeOnly(!freeOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
            freeOnly ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          Free / Subsidised Only
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{filtered.length}</span> course{filtered.length !== 1 ? "s" : ""} found
          {selectedCategory !== "All" && <span className="ml-1">in <span className="text-violet-300">{selectedCategory}</span></span>}
        </p>
        {(search || selectedCategory !== "All" || selectedPlatform !== "all" || freeOnly) && (
          <button
            onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedPlatform("all"); setFreeOnly(false); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all filters ×
          </button>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-indigo-500/30 transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{course.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{course.provider}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ml-3 flex-shrink-0 ${
                course.price === "free" || course.price === 0
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                  : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
              }`}>
                {course.price === "free" || course.price === 0
                  ? "Free"
                  : `R${(course.price as number).toLocaleString()}`}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.durationHours}h
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {course.platform}
              </span>
              {course.nqfLevel && (
                <Badge variant="indigo" className="text-xs">NQF {course.nqfLevel}</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {course.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{skill}</span>
              ))}
              {course.skills.length > 4 && <span className="text-xs text-muted-foreground">+{course.skills.length - 4}</span>}
            </div>

            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-border hover:border-indigo-500/40 hover:bg-indigo-500/8 text-xs font-medium text-muted-foreground hover:text-indigo-300 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View Course
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        ))}
      </div>

      {/* SA-specific note */}
      <div className="bg-card border border-amber-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">SA Funding Options</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              South African learners can access funding through: <strong className="text-foreground">NSFAS</strong> (university students),
              <strong className="text-foreground"> SETA Learnerships</strong> (sector-specific skills), <strong className="text-foreground">B-BBEE Skills Development</strong> (employer-funded),
              and <strong className="text-foreground">Harambee Youth Employment Accelerator</strong>. Many skills programmes are fully subsidised for South African citizens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
