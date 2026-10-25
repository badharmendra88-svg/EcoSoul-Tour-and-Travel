import { db } from "@/lib/db";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { clientIp, ipRateLimit } from "@/lib/rate-limit";

// Quote PDF, reachable by its unguessable token (same link the customer gets).
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  // Each request renders a PDF — cap it so the endpoint can't be used to load the server
  if (!ipRateLimit("quote-pdf", clientIp(request.headers), 30, 10 * 60 * 1000).ok) return new Response("Too many requests", { status: 429 });
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return new Response("Not found", { status: 404 });
  const quote = await db.quote.findUnique({ where: { token } });
  if (!quote) return new Response("Not found", { status: 404 });

  const bytes = await renderQuotePdf(quote);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="EcoSoul-${quote.number}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
