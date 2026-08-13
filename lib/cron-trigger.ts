/**
 * Helper for cron orchestrators.
 *
 * The Vercel Hobby plan allows only TWO cron jobs, and they may run at most
 * once per day. We have more scheduled work than that, so two daily
 * orchestrators fan out to the individual cron routes instead.
 *
 * Each target runs as its OWN serverless invocation with its own timeout, so
 * the orchestrator must not wait for it — a slow job would otherwise blow the
 * orchestrator's own time limit. We therefore start the request and abandon it:
 * once the invocation has begun it completes independently, so an AbortError
 * here means "successfully started", not "failed".
 */

const START_TIMEOUT_MS = 5_000;

export type TriggerResult = "started" | "failed";

export async function triggerCronRoute(baseUrl: string, path: string): Promise<TriggerResult> {
  const secret = process.env.CRON_SECRET;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), START_TIMEOUT_MS);

  try {
    await fetch(`${baseUrl}${path}`, {
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
      signal:  controller.signal,
      cache:   "no-store",
    });
    return "started";
  } catch (err) {
    // Expected: we deliberately abandon the connection once the job is running.
    if ((err as Error)?.name === "AbortError") return "started";
    console.error(`[cron-trigger] failed to start ${path}:`, err);
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}

/** Authorise an incoming cron request (Vercel sends Bearer CRON_SECRET). */
export function isAuthorisedCron(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;              // unset = open (dev convenience)
  return authHeader === `Bearer ${secret}`;
}

/** Today's date parts in SAST (UTC+2, no DST) — schedules follow SA time. */
export function sastToday(): { dayOfWeek: number; dayOfMonth: number; month: number } {
  const sa = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return {
    dayOfWeek:  sa.getUTCDay(),          // 0 = Sunday, 1 = Monday
    dayOfMonth: sa.getUTCDate(),
    month:      sa.getUTCMonth() + 1,    // 1-indexed
  };
}
