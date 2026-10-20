import type { NextConfig } from "next";

// Security headers (blueprint §15). CSP is intentionally not strict yet because
// GA and inline JSON-LD are used; tighten once third-party scripts are final.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
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
    return [{ source: "/char-dham-yatra/", destination: "/uttarakhand/char-dham-yatra/", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
