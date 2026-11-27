import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const PRIVATE = ["/admin/", "/api/", "/quote/"];

// AI search and assistant crawlers, named so it is explicit they may read the public site
// (ChatGPT, Claude, Perplexity, Gemini / AI Overviews, Apple Intelligence, Bing Copilot, Meta AI).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "meta-externalagent",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
