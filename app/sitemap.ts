import type { MetadataRoute } from "next";

const BASE = "https://careerintelsa.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Landing & public pages ─────────────────────────────────────────────
    { url: `${BASE}/`,            lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "monthly", priority: 0.3  },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "monthly", priority: 0.3  },

    // ── Free viral tools ───────────────────────────────────────────────────
    { url: `${BASE}/salary-check`,          lastModified: now, changeFrequency: "weekly",    priority: 0.9  },
    { url: `${BASE}/matric`,                lastModified: now, changeFrequency: "weekly",    priority: 0.9  },
    { url: `${BASE}/degree-roi`,            lastModified: now, changeFrequency: "monthly",   priority: 0.8  },
    { url: `${BASE}/graduate-programmes`,   lastModified: now, changeFrequency: "monthly",   priority: 0.95 },
    { url: `${BASE}/bursaries`,             lastModified: now, changeFrequency: "monthly",   priority: 0.95 },

    // ── Auth ───────────────────────────────────────────────────────────────
    { url: `${BASE}/sign-up`,     lastModified: now, changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE}/sign-in`,     lastModified: now, changeFrequency: "monthly", priority: 0.5  },
  ];
}
