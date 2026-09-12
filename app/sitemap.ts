import type { MetadataRoute } from "next";
import { WEAVE_CAREERS } from "@/lib/data/weave-index.generated";

const BASE = "https://careerintelsa.co.za";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Landing & public pages ─────────────────────────────────────────────
    { url: `${BASE}/`,            lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "monthly", priority: 0.3  },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "monthly", priority: 0.3  },

    { url: BASE + '/start', changeFrequency: 'monthly', priority: 0.9 },
    { url: BASE + '/career-map', changeFrequency: 'monthly', priority: 0.6 },
    // ── Free viral tools ───────────────────────────────────────────────────
    { url: `${BASE}/salary-check`,          lastModified: now, changeFrequency: "weekly",    priority: 0.9  },
    { url: `${BASE}/matric`,                lastModified: now, changeFrequency: "weekly",    priority: 0.9  },
    { url: `${BASE}/degree-roi`,            lastModified: now, changeFrequency: "monthly",   priority: 0.8  },
    { url: `${BASE}/graduate-programmes`,   lastModified: now, changeFrequency: "monthly",   priority: 0.95 },
    { url: `${BASE}/bursaries`,             lastModified: now, changeFrequency: "monthly",   priority: 0.95 },
    { url: `${BASE}/subject-choice`,        lastModified: now, changeFrequency: "monthly",   priority: 0.95 },
    { url: `${BASE}/how-credits-work`,      lastModified: now, changeFrequency: "monthly",   priority: 0.6  },

    // ── Career explorer ────────────────────────────────────────────────────
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // One indexable page per career — the long-tail search surface.
    ...WEAVE_CAREERS.map((c) => ({
      url: `${BASE}/explore/${c.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── Auth ───────────────────────────────────────────────────────────────
    { url: `${BASE}/sign-up`,     lastModified: now, changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE}/sign-in`,     lastModified: now, changeFrequency: "monthly", priority: 0.5  },
  ];
}
