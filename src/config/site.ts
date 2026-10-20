// Central business configuration. Contact values here are fallbacks only —
// the live values are managed in Admin → Settings (see src/lib/settings.ts).

export const site = {
  name: "EcoSoul Uttarakhand Travel",
  shortName: "EcoSoul",
  tagline: "Discover Uttarakhand, Your Way.",
  description:
    "Thoughtfully planned mountain escapes, family holidays, pilgrimage journeys and car + driver bookings across Uttarakhand.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  phone: process.env.NEXT_PUBLIC_PHONE || "+910000000000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "910000000000",
  email: process.env.NEXT_PUBLIC_EMAIL || "hello@example.com",
  address: process.env.NEXT_PUBLIC_ADDRESS || "Service area: Uttarakhand",
  hours: process.env.NEXT_PUBLIC_HOURS || "Mon–Sun, 9:00 am – 8:00 pm IST",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  locale: "en_IN",
};

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export type NavItem = { label: string; href: string };

// Blueprint §25 — updated primary navigation
export const mainNav: NavItem[] = [
  { label: "Destinations", href: "/destinations/" },
  { label: "Tour Packages", href: "/uttarakhand/tour-packages/" },
  { label: "Book a Taxi", href: "/uttarakhand/taxi-booking/" },
  { label: "Book a Driver", href: "/uttarakhand/driver-booking/" },
  { label: "Transfers", href: "/uttarakhand/airport-transfers/" },
  { label: "Char Dham", href: "/uttarakhand/char-dham-yatra/" },
  { label: "Travel Guide", href: "/travel-guides/" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Destinations", href: "/destinations/" },
      { label: "Tour Packages", href: "/uttarakhand/tour-packages/" },
      { label: "Char Dham & Yatra", href: "/uttarakhand/char-dham-yatra/" },
      { label: "Customise My Trip", href: "/customise-my-trip/" },
      { label: "Travel Guide", href: "/travel-guides/" },
    ],
  },
  {
    title: "Transport",
    items: [
      { label: "Book a Taxi", href: "/uttarakhand/taxi-booking/" },
      { label: "Book a Driver", href: "/uttarakhand/driver-booking/" },
      { label: "Airport / Railway Transfers", href: "/uttarakhand/airport-transfers/" },
      { label: "Local Sightseeing Taxi", href: "/uttarakhand/local-sightseeing-taxi/" },
      { label: "Haldwani Taxi Service", href: "/uttarakhand/haldwani-taxi-service/" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about-us/" },
      { label: "Contact", href: "/contact/" },
      { label: "FAQs", href: "/faqs/" },
      { label: "Join as a Driver", href: "/join-as-driver/" },
    ],
  },
  {
    title: "Policies",
    items: [
      { label: "Booking Policy", href: "/booking-policy/" },
      { label: "Cancellation Policy", href: "/cancellation-policy/" },
      { label: "Privacy Policy", href: "/privacy-policy/" },
      { label: "Terms & Conditions", href: "/terms-and-conditions/" },
    ],
  },
];

// Official references (blueprint §22) — re-verify before launch
export const officialLinks = {
  tourism: "https://uttarakhandtourism.gov.in/",
  tourismPolicies: "https://www.uttarakhandtourism.gov.in/page/policy-and-guidelines",
  yatraRegistration: "https://registrationandtouristcare.uk.gov.in/",
};
