import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay captures 10% of sessions, 100% of sessions with errors
  integrations: [
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Don't show Sentry dialog in dev
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
