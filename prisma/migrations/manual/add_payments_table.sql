-- ─────────────────────────────────────────────────────────────────────────────
-- Payment attempt tracking  —  run once in Supabase → SQL Editor → New query
--
-- Records every payment ATTEMPT so a lost PayFast notification is detectable
-- (previously we recorded nothing until the ITN arrived, so a lost ITN was
-- invisible — which is how a real purchase went uncredited).
--
-- Safe to run more than once: every statement uses IF NOT EXISTS.
-- Choose "Run without RLS" — access is server-side via Prisma, not the anon key.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT         NOT NULL PRIMARY KEY,
  "userId"        TEXT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "mPaymentId"    TEXT         NOT NULL,
  "pfPaymentId"   TEXT,
  type            TEXT         NOT NULL,               -- 'credits' | 'plan'
  "packId"        TEXT,
  "planKey"       TEXT,
  "amountCents"   INTEGER      NOT NULL,               -- ZAR in cents (exact)
  status          TEXT         NOT NULL DEFAULT 'INITIATED',
  fulfilled       BOOLEAN      NOT NULL DEFAULT false,
  "failureReason" TEXT,
  "alertedAt"     TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"   TIMESTAMP(3)
);

-- One row per payment reference (also makes ITN updates safe/idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS payments_mPaymentId_key
  ON payments ("mPaymentId");

CREATE INDEX IF NOT EXISTS payments_userId_idx    ON payments ("userId");
CREATE INDEX IF NOT EXISTS payments_status_idx    ON payments (status);
CREATE INDEX IF NOT EXISTS payments_createdAt_idx ON payments ("createdAt");
