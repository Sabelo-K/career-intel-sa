/**
 * Career/sector counts used in marketing copy, metadata and AI prompts.
 *
 * Kept as plain literals in their own tiny module so a landing page can import
 * the number WITHOUT pulling the entire SA_CAREERS dataset into the client
 * bundle. `sa-careers.ts` asserts these match at import time in development, so
 * if the dataset changes and these aren't updated, it fails loudly instead of
 * silently overstating the platform.
 *
 * Overstating counts is a credibility problem, not a rounding error — the
 * site previously advertised "249+ careers" while holding 227, and the AI
 * support agent claimed 128.
 */
export const SA_CAREER_COUNT = 267;
export const SA_SECTOR_COUNT = 30;
