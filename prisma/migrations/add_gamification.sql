-- Migration: Add gamification fields to users table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS xp               INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak           INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastActivityDate" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS achievements     TEXT[]    NOT NULL DEFAULT '{}';
