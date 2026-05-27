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
 */
export async function getOrCreateUser(
  clerkId: string,
  email?: string | null,
  name?: string | null
) {
  return db.user.upsert({
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
}
