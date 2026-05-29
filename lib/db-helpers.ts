/**
 * Shared database helpers used across API routes.
 * Centralises user upsert so every route that touches the DB
 * gets a guaranteed User row from the first request.
 */
import { db } from "./db";

/**
 * Upsert a Clerk user into the local `users` table.
 * Safe to call on every authenticated request — it is a no-op if the row
 * already exists and only writes on first visit.
 *
 * Handles the case where a user switches from a dev → prod Clerk instance:
 * the email stays the same but the Clerk user ID changes.  If the upsert
 * hits a unique-email conflict (Prisma P2002) we find the existing row by
 * email and update its clerkId so all historical data is preserved.
 */
export async function getOrCreateUser(
  clerkId: string,
  email?: string | null,
  name?: string | null
) {
  try {
    return await db.user.upsert({
      where: { clerkId },
      update: {
        ...(email ? { email } : {}),
        ...(name  ? { name }  : {}),
      },
      create: {
        clerkId,
        email: email ?? `${clerkId}@careerintel-placeholder.sa`,
        name:  name  ?? null,
      },
    });
  } catch (err: unknown) {
    // P2002 = unique constraint violation.  Most likely cause: same email
    // address already exists under a different clerkId (dev → prod migration).
    // Re-link the existing row to the new clerkId so data is preserved.
    const isPrismaUniqueError =
      typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "P2002";

    if (isPrismaUniqueError && email) {
      return await db.user.update({
        where: { email },
        data:  {
          clerkId,
          ...(name ? { name } : {}),
        },
      });
    }

    throw err;
  }
}
