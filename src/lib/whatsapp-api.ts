import "server-only";
import type { WhatsAppApiConfig } from "./settings";

// Minimal WhatsApp Business Cloud API client (Meta Graph API).
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

type GraphError = { error?: { message?: string; code?: number; error_data?: { details?: string } } };

function graphUrl(cfg: Pick<WhatsAppApiConfig, "version">, path: string) {
  return `https://graph.facebook.com/${cfg.version}/${path}`;
}

function explain(body: GraphError, status: number) {
  const code = body.error?.code;
  const detail = body.error?.error_data?.details || body.error?.message || `HTTP ${status}`;
  if (code === 131047)
    return "The customer hasn't messaged you in the last 24 hours. WhatsApp only allows approved template messages now — set a quote template in Settings → WhatsApp, or send the link manually.";
  if (code === 190) return "Access token is invalid or expired. Generate a new permanent token in Meta Business settings.";
  if (code === 131030) return "This phone number isn't in the allowed test recipients list for your Meta test number.";
  if (code === 132001) return "The template name or language doesn't match an approved template in your WhatsApp account.";
  return detail;
}

async function graph<T>(cfg: WhatsAppApiConfig, path: string, init: RequestInit): Promise<T> {
  const res = await fetch(graphUrl(cfg, path), {
    ...init,
    headers: { Authorization: `Bearer ${cfg.accessToken}`, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(20000),
  });
  const body = (await res.json().catch(() => ({}))) as T & GraphError;
  if (!res.ok || body.error) throw new Error(explain(body, res.status));
  return body;
}

export async function testConnection(cfg: WhatsAppApiConfig) {
  return graph<{ display_phone_number?: string; verified_name?: string; quality_rating?: string }>(
    cfg,
    `${cfg.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`,
    { method: "GET" },
  );
}

/** Indian 10-digit numbers get the 91 country code. */
export function toWaId(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0(\d{10})$/, "$1").replace(/^(\d{10})$/, "91$1");
}

export async function sendPdfDocument(
  cfg: WhatsAppApiConfig,
  opts: { to: string; pdf: Uint8Array; filename: string; caption: string; templateParams: string[] },
) {
  // 1) Upload the PDF as media (works even when the website is not public yet)
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([Buffer.from(opts.pdf)], { type: "application/pdf" }), opts.filename);
  const media = await graph<{ id: string }>(cfg, `${cfg.phoneNumberId}/media`, { method: "POST", body: form });

  // 2) Send it — as an approved template (works anytime) or a plain document
  //    (only inside the 24-hour customer-service window).
  const message = cfg.template
    ? {
        type: "template",
        template: {
          name: cfg.template,
          language: { code: cfg.templateLang },
          components: [
            { type: "header", parameters: [{ type: "document", document: { id: media.id, filename: opts.filename } }] },
            ...(opts.templateParams.length
              ? [{ type: "body", parameters: opts.templateParams.map((text) => ({ type: "text", text })) }]
              : []),
          ],
        },
      }
    : { type: "document", document: { id: media.id, filename: opts.filename, caption: opts.caption } };

  const sent = await graph<{ messages?: { id: string }[] }>(cfg, `${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: toWaId(opts.to), ...message }),
  });
  return sent.messages?.[0]?.id ?? null;
}
