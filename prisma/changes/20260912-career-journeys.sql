-- Additive release: existing user, profile and payment records are unchanged.
CREATE TABLE IF NOT EXISTS "career_journeys" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "persona" TEXT NOT NULL DEFAULT 'learner', "goal" TEXT NOT NULL DEFAULT '',
  "hoursPerWeek" INTEGER NOT NULL DEFAULT 3, "monthlyBudget" INTEGER NOT NULL DEFAULT 0,
  "targetDate" TEXT, "completedSteps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "shortlist" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "recruiterVisible" BOOLEAN NOT NULL DEFAULT false;
