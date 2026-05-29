/**
 * Shared database helpers used across API routes.
 * Centralises user upsert so every route that touches the DB
 * gets a guaranteed User row from the first request.
 */
import { db } from "./db";

/**
 * Get or create a user row linked to a Clerk user ID.
 *
 * Handles the dev → prod Clerk migration case: when a user first signs in
 * on the Production Clerk instance their clerkId is brand-new, but their
 * email already exists in the DB (from the Dev instance). We proactively
 * check for this before inserting to avoid a P2002 unique-constraint error,
 * and re-link the existing row to the new clerkId so all historical data
 * (plan, profile, CVs, sessions) is preserved.
 */
export async function getOrCreateUser(
  clerkId: string,
  email?: string | null,
  name?: string | null
) {
  // 1. Happy path — row already linked to this clerkId
  const existing = await db.user.findUnique({ where: { clerkId } });
  if (existing) {
    // Keep email / name up to date but don't overwrite with nulls
    if ((email && email !== existing.email) || (name && name !== existing.name)) {
      return db.user.update({
        where: { clerkId },
        data: {
          ...(email ? { email } : {}),
          ...(name  ? { name }  : {}),
        },
      });
    }
    return existing;
  }

  // 2. Same email exists under a different clerkId (dev → prod migration).
  //    Re-link the row instead of creating a duplicate.
  if (email) {
    const byEmail = await db.user.findUnique({ where: { email } });
    if (byEmail) {
      return db.user.update({
        where: { email },
        data: {
          clerkId,
          ...(name ? { name } : {}),
        },
      });
    }
  }

  // 3. Genuinely new user — create a fresh row
  return db.user.create({
    data: {
      clerkId,
      email: email ?? `${clerkId}@careerintel-placeholder.sa`,
      name:  name  ?? null,
    },
  });
}
