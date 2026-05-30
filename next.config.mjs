import { withSentryConfig } from "@sentry/nextjs";

// ── Security headers ───────────────────────────────────────────────────────────
// Applied to every response. Tested against securityheaders.com.
const securityHeaders = [
  // Prevent the site from being embedded in iframes (clickjacking protection)
  { key: "X-Frame-Options",         value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",  value: "nosniff" },
  // Only send the origin as the referrer for cross-origin requests
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for 2 years (including subdomains) — only active in production
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // Allows: same-origin scripts + Clerk + Vercel Analytics/Speed Insights
  // Allows: inline styles (needed by Clerk widgets & Tailwind)
  // Allows: fonts from Google
  {
    key:   "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: same-origin + Clerk + Vercel
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.careerintelsa.co.za https://*.clerk.accounts.dev https://va.vercel-scripts.com",
      // Styles: same-origin + inline (Tailwind/Clerk)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: same-origin + data URIs + Clerk avatars + Unsplash
      "img-src 'self' data: blob: https://img.clerk.com https://images.unsplash.com",
      // API connections
      "connect-src 'self' https://*.clerk.accounts.dev https://clerk.careerintelsa.co.za https://api.adzuna.com https://o*.ingest.sentry.io",
      // Frames: Clerk hosted pages only
      "frame-src https://clerk.careerintelsa.co.za https://*.clerk.accounts.dev",
      // Workers: needed for PDF parsing
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry org + project (set these in Vercel env vars)
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in CI/production
  silent:           true,
  disableLogger:    true,
  automaticVercelMonitors: true,

  // Suppresses source map upload warnings in dev (no SENTRY_AUTH_TOKEN set)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
