import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy (blueprint §15). Only the third parties the site really
// uses are allowed: Google Analytics / Ads and the Meta pixel (loaded only after
// cookie consent) and Razorpay checkout on quote pages. 'unsafe-inline' scripts
// are needed for Next.js's inline bootstrap, JSON-LD and the consent-gated tags on
// statically generated pages (nonces would force every page to render per request).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://*.razorpay.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.facebook.com https://connect.facebook.net https://api.razorpay.com https://lumberjack.razorpay.com`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Razorpay checkout may open bank / UPI pages in a popup
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")' },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

// The admin console never needs third parties. A later header rule replaces an
// earlier one with the same key, so this is a complete policy of its own.
const adminCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Pages and APIs that carry personal data must never be cached by browsers, proxies or CDNs
const privateHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  // Matches the URL style in the SEO plan, e.g. /destinations/nainital/
  trailingSlash: true,
  poweredByHeader: false,
  // Hide the dev-only Next.js "N" badge (review §5)
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"] },
  // Admin photo uploads go through server actions
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  async redirects() {
    return [
      { source: "/char-dham-yatra/", destination: "/uttarakhand/char-dham-yatra/", permanent: true },
      // Package pages live at /packages/<slug>/; the listing itself is the tour-packages page
      { source: "/packages/", destination: "/uttarakhand/tour-packages/", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/quote/:path*", headers: privateHeaders },
      { source: "/api/:path*", headers: privateHeaders },
      { source: "/admin/:path*", headers: [...privateHeaders, { key: "Content-Security-Policy", value: adminCsp }] },
    ];
  },
};

export default nextConfig;
