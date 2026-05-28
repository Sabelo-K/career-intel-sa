/**
 * One-time script to backfill planKey for existing PREMIUM users who paid
 * before the planKey column was added.
 *
 * Run with: npx dotenv -e .env.local -- npx tsx scripts/backfill-plankey.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Find PREMIUM users with no planKey set
  const users = await db.user.findMany({
    where: { plan: "PREMIUM", planKey: null },
    select: { id: true, email: true, plan: true },
  });

  console.log(`Found ${users.length} PREMIUM user(s) with no planKey:`);
  users.forEach((u) => console.log(` - ${u.email} (${u.id})`));

  if (users.length === 0) {
    console.log("Nothing to update.");
    return;
  }

  // Since both Graduate and Professional map to PREMIUM and we only have
  // Graduate (R49) as the sandbox test plan, default to "graduate".
  // Change to "professional" if needed.
  const result = await db.user.updateMany({
    where: { plan: "PREMIUM", planKey: null },
    data: { planKey: "graduate" },
  });

  console.log(`✅ Updated ${result.count} user(s) with planKey = "graduate"`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
