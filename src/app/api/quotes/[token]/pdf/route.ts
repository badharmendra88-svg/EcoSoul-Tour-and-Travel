import { db } from "@/lib/db";
import { renderQuotePdf } from "@/lib/quote-pdf";

// Quote PDF, reachable by its unguessable token (same link the customer gets).
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
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
