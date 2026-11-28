-- Retire packages that duplicated other pages (their URLs redirect in next.config.ts):
--   char-dham-planning-assistance  -> /packages/char-dham-yatra-10-days/ (full 10-day package)
--   custom-uttarakhand-family-trip -> /customise-my-trip/ (the trip planner form)
UPDATE "Package" SET "status" = 'PAUSED', "featured" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('char-dham-planning-assistance', 'custom-uttarakhand-family-trip') AND "status" = 'PUBLISHED';
