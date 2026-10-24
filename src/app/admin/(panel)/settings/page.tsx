import { site } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";
import { decryptSecret, maskSecret } from "@/lib/secret-box";
import { getSettingsRow, socialNetworks } from "@/lib/settings";
import { razorpayConfigured, razorpayMode } from "@/lib/razorpay";
import { SocialIcon } from "@/components/SocialIcons";
import { removeWhatsAppTokenAction, saveSettingsAction, testWhatsAppAction } from "../../settings-actions";
import { Badge, Icon, PageHeader, StatCard, type IconName } from "../ui";

const sections: { id: string; label: string; icon: IconName }[] = [
  { id: "contact", label: "Business contact", icon: "phone" },
  { id: "business", label: "Homepage & identity", icon: "hotel" },
  { id: "payments", label: "Payments", icon: "rupee" },
  { id: "whatsapp", label: "WhatsApp", icon: "message" },
  { id: "social", label: "Social media", icon: "users" },
  { id: "tracking", label: "Tracking & alerts", icon: "trend" },
];

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  type = "text",
  prefix,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: React.ReactNode;
  type?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">{prefix}</span>}
        <input name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={`admin-input ${prefix ? "pl-10" : ""}`} autoComplete="off" />
      </span>
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Toggle({ name, label, description, defaultChecked }: { name: string; label: string; description: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-900/5">
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-forest-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

function SectionCard({ id, icon, title, description, children }: { id: string; icon: IconName; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="panel scroll-mt-6 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-forest-100">
            <Icon name={icon} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <button name="_section" value={id} className="btn-admin-primary py-2"><Icon name="check" /> Save</button>
      </header>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; tested?: string }> }) {
  await requireAdmin("settings.manage");
  const { saved, error, tested } = await searchParams;
  const s = await getSettingsRow();
  const token = decryptSecret(s.waAccessTokenEnc);
  const socialCount = socialNetworks.filter((n) => s[n.key]).length;
  const contactCustom = [s.phone, s.whatsapp, s.email, s.address, s.hours].filter(Boolean).length;
  const trackingCount = [s.gaId || site.gaId, s.metaPixelId, s.googleVerification, s.notifyWebhookUrl || process.env.NOTIFY_WEBHOOK_URL].filter(Boolean).length;

  const waStatus: { label: string; tone: "emerald" | "rose" | "amber" | "slate" } = !s.waApiEnabled
    ? { label: "Off", tone: "slate" }
    : !token || !s.waPhoneNumberId
      ? { label: "Incomplete", tone: "amber" }
      : s.waLastTestOk === true
        ? { label: "Connected", tone: "emerald" }
        : s.waLastTestOk === false
          ? { label: "Error", tone: "rose" }
          : { label: "Not tested", tone: "amber" };

  return (
    <form action={saveSettingsAction}>
      <PageHeader
        eyebrow="Settings"
        title="Integrations & settings"
        subtitle="Manage business contact details, WhatsApp, social profiles and tracking — changes go live on the website immediately."
      />

      {error && (
        <p role="alert" className="-mt-2 mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
          <Icon name="bell" /> {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="-mt-2 mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <Icon name="check" /> Settings saved and the website has been refreshed.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Business contact" value={contactCustom ? `${contactCustom}/5` : "Defaults"} hint={contactCustom ? "Custom values set" : "Using .env values"} icon="phone" tone="forest" href="#contact" />
        <StatCard label="WhatsApp API" value={waStatus.label} hint={s.waBusinessAccountId ? `WABA ${s.waBusinessAccountId}` : "Meta Cloud API"} icon="message" tone={waStatus.tone === "slate" ? "slate" : waStatus.tone} href="#whatsapp" />
        <StatCard label="Social profiles" value={`${socialCount}/${socialNetworks.length}`} hint="Shown in footer & SEO" icon="users" tone="indigo" href="#social" />
        <StatCard label="Tracking & alerts" value={`${trackingCount}/4`} hint="GA4 · Pixel · Search Console · Webhook" icon="trend" tone="amber" href="#tracking" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-8 space-y-1">
            {sections.map((sec) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm">
                  <Icon name={sec.icon} /> {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-8">
          {/* ---------------- Contact ---------------- */}
          <SectionCard id="contact" icon="phone" title="Business contact" description="Shown in the header buttons, footer, contact page, PDFs and quotes. Leave empty to use the .env default.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="phone" label="Phone number" defaultValue={s.phone} placeholder={site.phone} prefix={<Icon name="phone" />} hint="Used for click-to-call buttons." />
              <Field name="whatsapp" label="WhatsApp number" defaultValue={s.whatsapp} placeholder={site.whatsapp} prefix={<Icon name="message" />} hint="Country code + number, no + or spaces — e.g. 919876543210." />
              <Field name="email" label="Email" type="email" defaultValue={s.email} placeholder={site.email} prefix={<Icon name="mail" />} />
              <Field name="hours" label="Working hours" defaultValue={s.hours} placeholder={site.hours} prefix={<Icon name="clock" />} />
              <div className="sm:col-span-2">
                <Field name="address" label="Address / service area" defaultValue={s.address} placeholder={site.address} prefix={<Icon name="map" />} />
              </div>
            </div>
          </SectionCard>

          {/* ---------------- Business identity ---------------- */}
          <SectionCard id="business" icon="hotel" title="Business identity" description="Business details shown in the footer and About page to build trust. The homepage photo is managed on the Photos page (Super Admin).">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="legalName" label="Registered business name" defaultValue={s.legalName} placeholder="e.g. EcoSoul Travels Pvt. Ltd." hint="Shown in the footer and About page." />
              <Field name="gstin" label="GSTIN (optional)" defaultValue={s.gstin} placeholder="15-character GSTIN" />
              <Field name="tourismRegNo" label="Uttarakhand Tourism registration no. (optional)" defaultValue={s.tourismRegNo} placeholder="Only if registered" />
              <Field name="emergencyPhone" label="Emergency / on-trip support number" defaultValue={s.emergencyPhone} placeholder="+91 …" prefix={<Icon name="phone" />} hint="Shown to travellers in policies and the footer." />
            </div>
          </SectionCard>

          {/* ---------------- Payments ---------------- */}
          <SectionCard id="payments" icon="rupee" title="Payments" description="How customers pay the advance from their quote link.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="upiId" label="UPI ID" defaultValue={s.upiId} placeholder="e.g. ecosoul@okhdfcbank" hint="Shown on quote pages with a “Pay with any UPI app” button on phones. Use a business/current-account UPI ID." />
              <Field name="upiPayeeName" label="UPI payee name" defaultValue={s.upiPayeeName} placeholder={s.legalName || "Registered business name"} hint="Must match the bank account name so customers trust the payment screen." />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-900/5">
              <div>
                <p className="font-medium text-slate-900">Online payments (Razorpay)</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  UPI, cards, net banking and wallets with automatic confirmation. Set <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code> and{" "}
                  <code>RAZORPAY_WEBHOOK_SECRET</code> in the server&apos;s <code>.env</code>, and point the Razorpay webhook to <code>{site.url}/api/payments/razorpay-webhook/</code>.
                </p>
              </div>
              <Badge tone={razorpayConfigured() ? "emerald" : "slate"}>{razorpayConfigured() ? `Connected (${razorpayMode()} mode)` : "Not connected"}</Badge>
            </div>
          </SectionCard>

          {/* ---------------- WhatsApp ---------------- */}
          <SectionCard id="whatsapp" icon="message" title="WhatsApp" description="Website chat button, and the official WhatsApp Business Cloud API for sending quote PDFs directly.">
            <div className="grid gap-4 md:grid-cols-2">
              <Toggle name="whatsappButton" label="Floating chat button" description="Green “Chat with us” button on every website page (desktop)." defaultChecked={s.whatsappButton} />
              <Field name="whatsappGreeting" label="Default chat message" defaultValue={s.whatsappGreeting} placeholder={`Hi ${site.shortName}, I'd like help planning an Uttarakhand trip.`} hint="Pre-filled when visitors tap a WhatsApp button." />
            </div>

            <div className="rounded-2xl ring-1 ring-slate-900/10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#1fa855]/10 to-transparent px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1fa855] text-white"><Icon name="message" /></span>
                  <div>
                    <p className="font-semibold text-slate-900">WhatsApp Business Cloud API</p>
                    <p className="text-xs text-slate-500">Send quote PDFs from the admin straight to the customer&apos;s WhatsApp.</p>
                  </div>
                </div>
                <Badge tone={waStatus.tone}>{waStatus.label}</Badge>
              </div>
              <div className="space-y-5 p-5">
                <Toggle name="waApiEnabled" label="Enable WhatsApp Cloud API" description="When on, quotes show a “Send PDF via WhatsApp API” button." defaultChecked={s.waApiEnabled} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="waPhoneNumberId" label="Phone number ID" defaultValue={s.waPhoneNumberId} placeholder="e.g. 123456789012345" hint="Meta → WhatsApp → API setup → Phone number ID" />
                  <Field name="waBusinessAccountId" label="WhatsApp Business Account ID" defaultValue={s.waBusinessAccountId} placeholder="e.g. 102938475610293" hint="Optional — for your reference" />
                  <div className="sm:col-span-2">
                    <Field
                      name="waAccessToken"
                      label="Permanent access token"
                      type="password"
                      placeholder={token ? `${maskSecret(token)} (saved — leave empty to keep)` : "Paste the system-user access token"}
                      hint="Stored encrypted. Create a System User in Meta Business Settings with whatsapp_business_messaging permission and generate a non-expiring token."
                    />
                  </div>
                  <Field name="waQuoteTemplate" label="Quote template name (recommended)" defaultValue={s.waQuoteTemplate} placeholder="e.g. quotation_pdf" hint="Approved template with a DOCUMENT header and body {{1}} name, {{2}} quote no., {{3}} total. Without it, PDFs only send within 24 h of the customer's last message." />
                  <div className="grid grid-cols-2 gap-3">
                    <Field name="waTemplateLang" label="Template language" defaultValue={s.waTemplateLang} placeholder="en" hint="e.g. en, en_US, hi" />
                    <Field name="waApiVersion" label="Graph API version" defaultValue={s.waApiVersion} placeholder="v21.0" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
                  <button formAction={testWhatsAppAction} className="btn-admin-ghost"><Icon name="check" /> Test saved connection</button>
                  {token && (
                    <button formAction={removeWhatsAppTokenAction} className="btn-admin-ghost text-rose-700"><Icon name="close" /> Remove token</button>
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    {s.waLastTestAt ? (
                      <p className={s.waLastTestOk ? "text-emerald-700" : "text-rose-700"}>
                        {s.waLastTestResult}
                        <span className="block text-xs text-slate-500">Tested {formatDateTime(s.waLastTestAt)}{tested ? " · just now" : ""}</span>
                      </p>
                    ) : (
                      <p className="text-slate-500">Save your details, then test the connection.</p>
                    )}
                  </div>
                </div>

                <details className="group rounded-xl ring-1 ring-slate-900/10">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700">
                    Setup guide — connect WhatsApp Cloud API (about 15 minutes)
                    <Icon name="chevron" className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <ol className="list-decimal space-y-2 border-t border-slate-100 px-9 py-4 text-sm text-slate-600">
                    <li>Go to <a className="font-medium text-forest-700 underline" href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">developers.facebook.com/apps</a> → Create app → type <strong>Business</strong> → add the <strong>WhatsApp</strong> product.</li>
                    <li>In <strong>WhatsApp → API setup</strong>, add and verify your business phone number (it can&apos;t be active on the normal WhatsApp app at the same time).</li>
                    <li>Copy the <strong>Phone number ID</strong> and <strong>WhatsApp Business Account ID</strong> into the fields above.</li>
                    <li>In <a className="font-medium text-forest-700 underline" href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer">Business Settings → System users</a>, create an admin system user, assign the app and WhatsApp account, and generate a token with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>. Paste it above.</li>
                    <li>In <strong>WhatsApp Manager → Message templates</strong>, create a <em>Utility</em> template (e.g. <code>quotation_pdf</code>) with a <strong>Document</strong> header and body like: “Hello {"{{1}}"}, your quotation {"{{2}}"} for {"{{3}}"} is attached.” Wait for approval and enter its name here.</li>
                    <li>Turn on <strong>Enable WhatsApp Cloud API</strong>, save, and click <strong>Test saved connection</strong>.</li>
                  </ol>
                  <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Meta charges per business-initiated conversation; check current WhatsApp pricing for India in your Meta account.</p>
                </details>
              </div>
            </div>
          </SectionCard>

          {/* ---------------- Social ---------------- */}
          <SectionCard id="social" icon="users" title="Social media" description="Profiles appear as icons in the website footer and in search-engine structured data.">
            <div className="grid gap-5 sm:grid-cols-2">
              {socialNetworks.map((n) => (
                <Field
                  key={n.key}
                  name={n.key}
                  label={n.label}
                  type="url"
                  defaultValue={s[n.key]}
                  placeholder="https://"
                  prefix={<SocialIcon name={n.key} />}
                />
              ))}
            </div>
          </SectionCard>

          {/* ---------------- Tracking ---------------- */}
          <SectionCard id="tracking" icon="trend" title="Tracking & alerts" description="Analytics, ad pixels, Search Console verification and new-lead notifications.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="gaId" label="Google Analytics 4 ID" defaultValue={s.gaId} placeholder={site.gaId || "G-XXXXXXXXXX"} hint="Admin → Data streams → Measurement ID" />
              <Field name="metaPixelId" label="Meta (Facebook) Pixel ID" defaultValue={s.metaPixelId} placeholder="e.g. 1234567890123456" hint="Events Manager → Data sources → Pixel ID" />
              <Field name="googleVerification" label="Google Search Console verification" defaultValue={s.googleVerification} placeholder="Paste the HTML-tag code or the whole <meta> tag" hint="Search Console → Add property → HTML tag method" />
              <Field name="notifyWebhookUrl" label="New-lead notification webhook" type="url" defaultValue={s.notifyWebhookUrl} placeholder={process.env.NOTIFY_WEBHOOK_URL ? "Using .env webhook" : "https://hooks.slack.com/… or Zapier/Make URL"} hint="Receives a short JSON message for every new enquiry (Slack, Google Chat, Zapier, Make)." />
            </div>
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-100">
              Analytics and pixels collect visitor data. Make sure your Privacy Policy mentions them and, where required, ask for cookie consent.
            </p>
          </SectionCard>
        </div>
      </div>
    </form>
  );
}
