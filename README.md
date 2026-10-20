# EcoSoul Uttarakhand Travel — Website & Booking System

Mobile-first, enquiry-led travel website for Uttarakhand: tour packages, custom trips, Char Dham planning help and car / taxi / driver bookings, with a protected admin panel for leads and content.

Built from `EcoSoul_Uttarakhand_Travel_Blueprint_with_SEO_Plan.docx` (v1.0, 20 Oct 2026).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 · SQLite (dev) · Zod

---

## Quick start

```bash
npm install
cp .env.example .env          # then edit values (see below)
npx prisma migrate dev        # creates prisma/dev.db and seeds starter content
npm run dev                   # http://localhost:3200
```

Admin panel: <http://localhost:3200/admin/>. **First run:** the login page asks you to create the Super Admin — enter the `ADMIN_PASSWORD` value from `.env` as the setup key, then your name, email and password. After that everyone signs in with their own email + password.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript checks |
| `npm run db:migrate` | Create/apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Add starter destinations/packages (never overwrites admin edits) |
| `npm run db:studio` | Browse the database in Prisma Studio |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Database connection (SQLite file locally) |
| `NEXT_PUBLIC_SITE_URL` | Public URL for canonical tags, sitemap, Open Graph |
| `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_ADDRESS`, `NEXT_PUBLIC_HOURS` | Real business contact details shown site-wide |
| `ADMIN_PASSWORD` | Admin sign-in password (long and random) |
| `SESSION_SECRET` | 64-char random hex used to sign admin sessions |
| `NOTIFY_WEBHOOK_URL` | Optional webhook (Slack / Google Chat / Zapier / Make) for new-lead alerts |
| `NEXT_PUBLIC_GA_ID` | Optional Google Analytics 4 ID |

---

## What's built

### Public site (blueprint §4, §7, §25)
| URL | Page |
| --- | --- |
| `/` | Home: hero, quick enquiry, experiences, featured packages, transport CTA, why us, how it works, destinations, FAQs |
| `/destinations/`, `/destinations/[slug]/` | Destination hub (region/category filters) and guides (best time, how to reach, duration, things to do, tips, FAQs, last-reviewed date) |
| `/uttarakhand/tour-packages/` | Package listing with destination / trip type / duration filters |
| `/packages/[slug]/` | Package detail: day-wise itinerary, inclusions/exclusions, notes, price basis, cancellation summary, quote form |
| `/customise-my-trip/` | 3-step custom trip enquiry |
| `/uttarakhand/taxi-booking/`, `/driver-booking/`, `/airport-transfers/`, `/local-sightseeing-taxi/` | Transport module (§24): booking request form, vehicle categories, fare rules, workflow, FAQs |
| `/char-dham-yatra/` | Yatra planning info with official links and "not a government site" disclaimer |
| `/about-us/`, `/contact/`, `/faqs/` | Company, contact form, FAQs |
| `/booking-policy/`, `/cancellation-policy/`, `/privacy-policy/`, `/terms-and-conditions/` | Policies (marked **draft** — see launch checklist) |
| `/travel-guides/` | Guide hub (noindex until real guides exist) |
| `/sitemap.xml`, `/robots.txt` | Generated from published content |

### Enquiries (§8, §24.4, FR-04/05/08)
- One API (`POST /api/enquiries`) for trip, package, transport and contact forms; one lead queue for the team.
- Zod validation shared by browser and server; past dates rejected; at least one contact method; consent required.
- Spam protection: honeypot, per-IP rate limit, 2-minute duplicate guard.
- Each lead gets a public enquiry ID (e.g. `ES-261020-7KQ4`) and an audit trail.
- Optional webhook notification after the response; failures are recorded and retryable from the admin.

### Admin panel (`/admin/`, §10, FR-06/07, §24.7)
- Password login with signed, HTTP-only session cookie; middleware + server-side checks on every page/action; login rate-limited.
- **Leads:** filter/search, *Create quote*, detail view, status workflows (trip: New → Contacted → Qualified → Quote Sent → Confirmed/Lost/Spam; transport: New Enquiry → Checking Availability → … → Completed/Cancelled/Incident), assignment, internal notes, activity log, call/WhatsApp/email shortcuts, CSV export.
- **Packages:** create/edit, publish / draft / **pause** (hides immediately), price must state a price basis, internal "must clarify before sale" notes, SEO fields.
- **Destinations:** create/edit content, FAQs, SEO fields and "last reviewed" date; stale items (6+ months) flagged.

### Estimate calculator & quotations (`/admin/quotes/`, `/admin/rates/`)
- **Rate card** (editable): per-vehicle outstation ₹/km, minimum km/day, driver allowance, night halt, local 8 hr/80 km package, extra hour/km; hotel ₹/room-night for Budget/Standard/Premium plus dinner (MAP); service charge %, GST %, advance %, peak-season surcharge, validity days and default terms. Defaults are typical Uttarakhand market rates — replace them with partner rates (`src/config/rate-defaults.ts`).
- **Service coverage:** every website transport service has its own calculator mode — Outstation/round trip (also group/tempo), One-way drop (min km + one-way ₹/km), Airport/railway transfer (fare for first N km + extra km + waiting + late-night), Local sightseeing, and Driver only (local/outstation day rate, night allowance, overtime, return fare). The rate card shows a coverage table with each formula.
- **Calculator:** open a lead → *Create quote*. Customer, dates, travellers, vehicle and days are prefilled. Outstation = max(actual km, min km/day × days) × ₹/km + driver allowance + night halts + tolls; local = package/day + extras; hotel = rooms × nights (+ dinner, + peak surcharge). Results become editable line items; totals (service charge → GST → total, advance, per person) update live and are recomputed on the server.
- **Sending:** each saved quote gets a number (`Q-261020-7KQ4`), an A4 **PDF** and a private customer link (`/quote/<token>/`). *Send on WhatsApp* opens the customer's chat with a pre-filled summary + link; email via mail app. Sending marks the quote **Sent** and moves the lead to **Quote Sent** with an activity-log entry; record Accepted/Declined later.
- WhatsApp links can't attach files — download the PDF and attach it manually, or integrate the WhatsApp Business API later. Customer links work only once the site is deployed with a public `NEXT_PUBLIC_SITE_URL`. PDFs use built-in fonts, so `₹` prints as `Rs.` and Hindi text is not supported yet.

### Users & roles (`/admin/users/`)
- Individual accounts (email + password, scrypt-hashed). Roles: **Super Admin** (everything, incl. users), **Admin** (leads, quotes, CSV export, rate card, content, integrations), **Manager** (leads and quotes only). Permissions live in `src/lib/permissions.ts` and are enforced on every page, server action and the CSV export — not just by hiding menu items.
- Only Super Admins create users, change roles, deactivate accounts and reset passwords. New/reset users get a one-time temporary password and must set their own at first sign-in. Deactivation and password changes sign the user out everywhere immediately. At least one active Super Admin is always kept; you can't demote or deactivate yourself.
- Everyone can change their own password under **My account**. Activity-log entries show the staff member's name.

### Integrations & settings (`/admin/settings/`)
- **Business contact:** phone, WhatsApp number, email, address and hours — used site-wide (buttons, footer, contact page, JSON-LD, PDFs). Empty fields fall back to the `NEXT_PUBLIC_*` env values.
- **WhatsApp:** floating "Chat with us" button toggle and default chat message. **WhatsApp Business Cloud API** (Meta): phone number ID, encrypted access token (AES-256-GCM, key derived from `SESSION_SECRET` — re-enter tokens if you rotate it), optional approved quote template, *Test saved connection*, and a built-in setup guide. When enabled, quotes get **Send PDF via WhatsApp API** (uploads the PDF and sends it to the customer; without an approved template this only works within 24 h of the customer's last message).
- **Social media:** Instagram, Facebook, YouTube, X, LinkedIn, Google Business Profile, Tripadvisor → footer icons and `sameAs` structured data.
- **Tracking & alerts:** GA4 ID, Meta Pixel ID, Google Search Console verification (paste the tag or code) and the new-lead webhook (overrides `NOTIFY_WEBHOOK_URL`).

### Mobile & installable apps (PWA)
- Two installable apps: the **website** (`/site-app/manifest/`) and **EcoSoul Admin** (`/admin-app/manifest/`, opens `/admin/`). Android/Chrome: menu → *Install app*; iPhone Safari: Share → *Add to Home Screen*. Icons are generated in code (`src/lib/app-icon.tsx`).
- `public/sw.js` is network-first and never caches pages or admin data; it only shows an offline page when there is no connection. It registers in production builds only.
- Mobile-checked at 360 px (Android), 390 px (iPhone) and 768 px (tablet) for every public and admin page: no horizontal scrolling, 32 px+ tap targets, 16 px form inputs (no iOS zoom-on-focus), safe-area padding for the bottom bar.

### SEO / analytics / accessibility (§12, §16, FR-09/10/12)
- Unique titles, descriptions and canonical URLs; trailing-slash URLs per the SEO plan; breadcrumbs + BreadcrumbList, FAQPage and TravelAgency JSON-LD.
- Analytics events `view_package`, `click_whatsapp`, `click_phone`, `submit_enquiry` — never include personal data.
- Skip link, labelled fields, `aria-invalid` errors, visible focus styles, keyboard-friendly menus and filters, sticky mobile CTA bar.

---

## Project structure

```
prisma/
  schema.prisma        Destination, Package, Enquiry, EnquiryEvent, VehicleRate, HotelRate, QuoteSettings, Quote
  seed.mjs             Starter content (blueprint §5–§6)
src/
  app/(site)/          Public pages
  app/admin/           Login, server actions, (panel)/ admin pages
  app/api/             enquiries (public), admin/export (CSV)
  components/          UI, forms, cards, SceneArt placeholder illustrations
  config/site.ts       Business details, navigation, official links
  config/options.ts    Trip types, services, vehicles, status workflows
  lib/                 db, validation, session/auth, rate limit, notify, SEO helpers
  middleware.ts        Admin route protection
```

---

## Before launch (blueprint §20–§21)

Content in this repo is a **starting point**, not verified operational data.

- [ ] Real phone, WhatsApp, email, address/service area and hours in `.env`.
- [ ] Replace placeholder artwork with real, licensed photos; add logo/favicon.
- [ ] Verify every package (route, suppliers, hotel category, inclusions, costing) before taking bookings; add prices only with a price basis.
- [ ] Re-check destination season/access notes and Char Dham information against official sources; update "last reviewed".
- [ ] Owner + legal/accounting review of all policies, then set `POLICIES_ARE_DRAFT = false` in `src/components/PolicyPage.tsx`.
- [ ] Replace the About page copy with the real company story and verified credentials.
- [ ] Configure `NOTIFY_WEBHOOK_URL`, GA4, Google Search Console (submit `/sitemap.xml`).
- [ ] Mobile, keyboard and broken-link QA; test the enquiry → notification → admin flow end to end.

## Deploying

SQLite is for local development. For production:

1. Use PostgreSQL (e.g. Neon, Supabase, Railway): set `provider = "postgresql"` in `prisma/schema.prisma`, point `DATABASE_URL` at it, and create a fresh migration.
2. Run `npm run db:deploy` (and `npm run db:seed` once) against the production database.
3. Deploy to Vercel or any Node host; set all environment variables there. Serve over HTTPS only.
4. The in-memory rate limiter is per server instance — use a shared store (e.g. Upstash Redis) if you run multiple instances.

## Roadmap (blueprint §24.11)

- Phase 2: partner/driver directory, rate cards and assignment in admin; automated email/WhatsApp notifications.
- Phase 3: secure online advance payments, customer booking history, refunds, partner availability calendar.
- Phase 4: driver/partner portal, ratings, settlements.
- Hindi version (`/hi/` routes), blog/travel-guide CMS, reviews with recorded consent.
