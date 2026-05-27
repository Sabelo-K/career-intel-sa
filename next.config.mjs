import { withSentryConfig } from "@sentry/nextjs";

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
