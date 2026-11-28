-- Starting prices for the published packages (market-checked, Nov 2026). Only fills packages that
-- still have no price, so anything already set in Admin → Packages is kept. Edit any time in admin.

UPDATE "Package"
SET "startingPrice" = 7499, "currency" = 'INR', "priceBasis" = 'per person, 2 adults sharing a room (budget hotel, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹7,499 · Standard from ₹8,999 · Premium from ₹12,999.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'nainital-bhimtal-3-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 7999, "currency" = 'INR', "priceBasis" = 'per person, 2 adults sharing a room (budget hotel, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹7,999 · Standard from ₹9,499 · Premium from ₹13,499.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'mussoorie-dhanaulti-3-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 7199, "currency" = 'INR', "priceBasis" = 'per person, 2 adults sharing a room (budget hotel, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹7,199 · Standard from ₹8,999 · Premium from ₹12,999.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'rishikesh-haridwar-3-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 17499, "currency" = 'INR', "priceBasis" = 'per person, 2 adults sharing a room (budget hotel, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹17,499 · Standard from ₹21,999 · Premium from ₹31,999.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kumaon-scenic-circuit-6-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 3499, "currency" = 'INR', "priceBasis" = 'per person, 2 adults sharing (budget resort, off-season); jeep safari extra',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹3,499 · Standard from ₹4,499 · Premium from ₹6,999.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'jim-corbett-weekend-2-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 13499, "currency" = 'INR', "priceBasis" = 'per person, 4 adults in an SUV (budget hotels, breakfast & dinner, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹13,499 · Standard from ₹17,999 · Premium from ₹28,999.","For 2 travellers the per-person price is higher, as the car is shared by fewer people.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kedarnath-yatra-5-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 16499, "currency" = 'INR', "priceBasis" = 'per person, 4 adults in an SUV (budget hotels, breakfast & dinner, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹16,499 · Standard from ₹21,999 · Premium from ₹35,999.","For 2 travellers the per-person price is higher, as the car is shared by fewer people.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'do-dham-kedarnath-badrinath-6-days' AND "startingPrice" IS NULL;

UPDATE "Package"
SET "startingPrice" = 28499, "currency" = 'INR', "priceBasis" = 'per person, 4 adults in an SUV (budget hotels, breakfast & dinner, off-season)',
    "notes" = (COALESCE(NULLIF("notes", ''), '[]')::jsonb || '["Hotel categories (per person, off-season): Budget from ₹28,499 · Standard from ₹38,499 · Premium from ₹62,999.","For 2 travellers the per-person price is higher, as the car is shared by fewer people.","Peak dates (May–June, Diwali, Christmas–New Year) cost more; your written quote shows the exact price."]'::jsonb)::text,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'char-dham-yatra-10-days' AND "startingPrice" IS NULL;
