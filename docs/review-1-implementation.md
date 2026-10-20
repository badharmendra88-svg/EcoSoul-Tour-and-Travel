# 1st website review — implementation status

Source: `docs/Uttarakhand Website Document-1st review.pdf` (review of the homepage design).
Status as of 20 Oct 2026. **Done** = built and tested in the code. **Owner** = needs real business input/content; the code is ready.

## 1–2. Homepage

| Review point | Status | Where / notes |
|---|---|---|
| Headline "Explore Uttarakhand. Your Trip, Your Way." + clear subheading | Done | `src/app/(site)/page.tsx` |
| CTAs: Explore Tour Packages · Book a Taxi · Plan a Custom Trip | Done | Hero |
| Trust line "Local travel partners • Custom itineraries • Booking confirmation before travel" | Done | Matches the enquiry → quote → confirmation process actually used |
| Real hero photo instead of illustration | Done · **Owner** | Upload in Admin → Integrations → *Homepage photo & business identity* |
| Quick enquiry: destination, date, travellers, trip type only | Done | Taxi/driver details are asked on their own forms |
| Package cards: real photo, duration, destination, who it suits, inclusions, price or "Request a customised quote" | Done · **Owner** (photos, verified prices) | `src/components/Cards.tsx`; never shows a fake price |
| "View details" + "Get Package Quote" | Done | Card + package page sidebar |
| Pricing assumptions on package page | Done | "How the price is worked out" section |
| Separate Book a Taxi / Book a Driver cards (Get Taxi Quote / Request a Driver) | Done | Homepage service cards + form button labels |
| Driver form: vehicle type, transmission, trip duration | Done | `TransportForm.tsx`; stored as `vehicleCategory`, `transmission`, `tripDays` |
| Workflow "Request received → Partner availability checked → Fare confirmed → Booking confirmed" | Done | `BookingSteps` on homepage, every transport page and the success message |

## 3. SEO

| Review point | Status | Where / notes |
|---|---|---|
| Dedicated pages at suggested URLs | Done | `/uttarakhand/tour-packages/`, `/destinations/nainital/`, `/destinations/mussoorie/`, `/uttarakhand/taxi-booking/`, `/uttarakhand/driver-booking/` |
| `/uttarakhand/char-dham-yatra/` | Done | Old `/char-dham-yatra/` permanently redirects |
| `/uttarakhand/haldwani-taxi-service/` | Done · **Owner** | Keep published only while Haldwani partner coverage is real; distances are approximate |
| Unique title/meta, one H1, canonical, sitemap | Done | `pageMeta`, `sitemap.ts` |
| Destination photos with alt text | Done · **Owner** | Admin → Destinations → Photo (alt text required) |
| Internal links, FAQs, clear CTA | Done | Destination, package and transport pages |
| Schema: Organization/TravelAgency, BreadcrumbList, Product/Offer | Done | Product/Offer only when a real price is set on the package |
| Destination cards: best-for, link, "Explore Destination" | Done | `bestFor` field (Admin → Destinations) |

## 4. Trust & conversion

| Review point | Status | Where / notes |
|---|---|---|
| How booking works (enquiry, availability, quote, confirmation, payment) | Done | Homepage section 5 |
| Real reviews, with permission — no fake reviews | Done · **Owner** | Admin → Reviews (permission record required; section hidden until one is published) |
| Partner verification described only as actually done | Done | Copy softened; no "verified drivers" claims |
| Policies: cancellation, refund, advance, rescheduling, emergency | Done · **Owner** (legal review) | Rescheduling + emergency sections added to Cancellation Policy |
| Business identity | Done · **Owner** | Registered name, GSTIN, Uttarakhand Tourism reg. no., emergency number in Admin → Integrations; shown in footer/About only when filled |
| Pricing clarity (tolls, parking, driver allowance) | Done | Homepage "Clear fares" box + fare rules on taxi pages |

## 5. Technical & mobile

| Review point | Status | Where / notes |
|---|---|---|
| Compact sticky header, mobile menu, touch-friendly controls | Done | Mobile audit 78/78 (360/390/768 px) |
| WhatsApp button not covering content | Done | Floating button desktop-only; mobile uses the bottom bar |
| Images WebP/AVIF, lazy-load below the fold | Done | Uploads re-encoded to WebP by `sharp`; `next/image` serves AVIF/WebP and lazy-loads |
| Keyboard, focus, labels, contrast | Done | Visible focus styles, labelled fields |
| Search Console, analytics, form events | Done · **Owner** | IDs in Admin → Integrations → Tracking |
| PageSpeed / Core Web Vitals | **Owner** | Measure on the live HTTPS site |
| Black "N" icons in the screenshot | Done | That was the Next.js dev-mode indicator — disabled (`devIndicators: false`); never shown in production |

## 7. Owner checklist (from the review's P0–P2)

- [ ] Upload licensed photos: homepage hero, each destination, each package.
- [ ] Add real business details: phone/WhatsApp/email, registered name, GSTIN, registration no., emergency number.
- [ ] Verify package prices (or keep "Request a customised quote") and partner coverage, incl. Haldwani.
- [ ] Legal review of policies, then set `POLICIES_ARE_DRAFT = false`.
- [ ] Collect real reviews with permission after trips.
- [ ] Deploy on HTTPS, connect Search Console + GA4, run PageSpeed Insights.
- [ ] P2: original destination guides, Google Business Profile, hotel/homestay partnerships.
