import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/", "/salary-check", "/matric", "/degree-roi", "/subject-choice",
          "/bursaries", "/graduate-programmes", "/how-credits-work",
          "/explore",      // career map + one page per career
          "/api/og/",      // share cards — a longer allow beats the /api/ disallow
          "/privacy", "/terms", "/sign-up", "/sign-in",
        ],
        disallow: [
          "/dashboard",
          "/cv-builder",
          "/career-coach",
          "/career-paths",
          "/skills-gap",
          "/job-alerts",
          "/interview-prep",
          "/courses",
          "/profile",
          "/settings",
          "/upgrade",
          "/buy-credits",
          "/onboarding",
          "/admin",
          "/recruiter",
          "/wrapped",
          "/bbbee",
          "/high-school",
          "/api/",
        ],
      },
    ],
    sitemap: "https://careerintelsa.co.za/sitemap.xml",
  };
}
