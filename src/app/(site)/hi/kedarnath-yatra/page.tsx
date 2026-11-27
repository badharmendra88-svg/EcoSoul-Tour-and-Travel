import Link from "next/link";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PackageRow } from "@/components/PackageRow";
import { PageHero } from "@/components/PageHero";
import { QuickAnswer } from "@/components/QuickAnswer";
import { hindiTime } from "@/components/HindiTaxiPage";
import { routeBetween } from "@/config/journeys";
import { officialLinks, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

// Hindi version of /uttarakhand/kedarnath-yatra-package/ — keep facts in sync with the English page.

const PATH = "/hi/kedarnath-yatra/";
const EN = "/uttarakhand/kedarnath-yatra-package/";
const REVIEWED = "27 Nov 2026";
const drive = routeBetween("haridwar", "sonprayag");

const meta = pageMeta({
  title: "केदारनाथ यात्रा पैकेज — हरिद्वार से 5 दिन",
  description:
    "हरिद्वार, ऋषिकेश या दिल्ली से केदारनाथ यात्रा पैकेज: गुप्तकाशी / सीतापुर में होटल, अनुभवी पहाड़ी ड्राइवर के साथ गाड़ी, पैदल यात्रा या हेलीकॉप्टर की सही जानकारी।",
  path: PATH,
});
export const metadata = {
  ...meta,
  openGraph: { ...meta.openGraph, locale: "hi_IN" },
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}${EN}`, "hi-IN": `${site.url}${PATH}` } },
};

const plan: [string, string][] = [
  ["दिन 1", `हरिद्वार / ऋषिकेश → देवप्रयाग, रुद्रप्रयाग होते हुए गुप्तकाशी या सीतापुर${drive ? ` (लगभग ${hindiTime(drive.time)})` : ""}`],
  ["दिन 2", "सुबह सोनप्रयाग, शटल से गौरीकुंड, फिर केदारनाथ पैदल यात्रा (या हेलीकॉप्टर), शाम की आरती, रात केदारनाथ में"],
  ["दिन 3", "सुबह दर्शन, गौरीकुंड तक वापसी, गुप्तकाशी या सीतापुर"],
  ["दिन 4", "गुप्तकाशी → ऋषिकेश / हरिद्वार, रास्ते में धारी देवी मंदिर"],
  ["दिन 5", "मौसम के लिए अतिरिक्त दिन, या दिल्ली / देहरादून एयरपोर्ट के लिए रवाना"],
];

const includes = [
  { title: "पहाड़ी ड्राइवर के साथ गाड़ी", text: "हरिद्वार, ऋषिकेश, देहरादून या दिल्ली से सोनप्रयाग और वापसी — सेडान, SUV या टेम्पो ट्रैवलर।" },
  { title: "ट्रेक के पास होटल", text: "गुप्तकाशी, फाटा या सीतापुर में बजट, स्टैंडर्ड या प्रीमियम होटल, ताकि सुबह जल्दी और आराम से चढ़ाई शुरू हो।" },
  { title: "पैदल यात्रा या हेलीकॉप्टर", text: "घोड़ा, पालकी और पिट्ठू की जानकारी, या आपके आधिकारिक हेलीकॉप्टर स्लॉट के हिसाब से सड़क का प्लान।" },
  { title: "रजिस्ट्रेशन और मौसम की जानकारी", text: "आधिकारिक रजिस्ट्रेशन में मदद, मौसम और सड़क की ताज़ा जानकारी, और पूरी यात्रा में सहायता नंबर।" },
];

const faqs = [
  { q: "केदारनाथ यात्रा में कितने दिन लगते हैं?", a: "हरिद्वार या ऋषिकेश से 4–5 दिन। दिल्ली से आने-जाने के लिए 1–1 दिन और जोड़ें। केदारनाथ और बद्रीनाथ (दो धाम) के लिए लगभग 6–7 दिन।" },
  { q: "केदारनाथ की पैदल यात्रा कितनी है?", a: "गौरीकुंड से मंदिर तक एक तरफ़ लगभग 16–18 किमी। ज़्यादातर लोग 6–9 घंटे में चढ़ते हैं। घोड़ा, पालकी और पिट्ठू आधिकारिक काउंटर पर मिलते हैं।" },
  { q: "केदारनाथ हेलीकॉप्टर टिकट कहाँ से बुक करें?", a: "सिर्फ़ आधिकारिक IRCTC HeliYatra पोर्टल से, यात्री के अपने नाम पर। हम टिकट नहीं बेचते — नकली वेबसाइटों से सावधान रहें। हम आपके स्लॉट के हिसाब से रूट और होटल का प्लान बनाते हैं।" },
  { q: "केदारनाथ मंदिर कब खुलता है?", a: "आमतौर पर मई में (अक्षय तृतीया के आसपास) खुलता है और अक्टूबर के अंत या नवंबर की शुरुआत में भाई दूज पर बंद होता है। सही तारीख़ हर साल मंदिर समिति घोषित करती है।" },
  { q: "क्या बुज़ुर्ग केदारनाथ यात्रा कर सकते हैं?", a: "हाँ, बहुत से बुज़ुर्ग घोड़ा, पालकी या हेलीकॉप्टर से यात्रा करते हैं। यात्रा से पहले डॉक्टर से जाँच ज़रूर करवाएँ; हम आराम के दिन जोड़कर धीमा प्लान बनाते हैं।" },
  { q: "पैकेज का दाम कितना है?", a: "दाम यात्रियों की संख्या, होटल की श्रेणी (बजट, स्टैंडर्ड, प्रीमियम) और गाड़ी पर निर्भर करता है। अपनी तारीख़ और यात्री बताइए — हम पूरा लिखित कोटेशन भेजेंगे।" },
];

export default function KedarnathHindiPage() {
  return (
    <div lang="hi">
      <PageHero
        title="केदारनाथ यात्रा पैकेज"
        intro="हरिद्वार, ऋषिकेश, देहरादून या दिल्ली से पूरी केदारनाथ यात्रा — ट्रेक के पास होटल, अनुभवी पहाड़ी ड्राइवर के साथ गाड़ी, और रजिस्ट्रेशन व हेलीकॉप्टर की सही जानकारी।"
        crumbs={[{ label: "केदारनाथ यात्रा", href: PATH }]}
        scene="temple"
        eyebrow="तीर्थ यात्रा"
      >
        <Link href={EN} lang="en" hrefLang="en" className="chip bg-white/90">Read in English →</Link>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <QuickAnswer label="सीधा जवाब" updatedLabel="अपडेट:" updated={REVIEWED}>
            <p>
              हरिद्वार से केदारनाथ यात्रा में आमतौर पर <strong>4–5 दिन</strong> लगते हैं। सड़क से
              {drive ? <> लगभग <strong>{drive.km} किमी ({hindiTime(drive.time)})</strong></> : ""} सोनप्रयाग तक, फिर गौरीकुंड से{" "}
              <strong>16–18 किमी</strong> की पैदल यात्रा (मंदिर लगभग 3,580 मीटर पर), या हेलीकॉप्टर — जिसके टिकट सिर्फ़ IRCTC HeliYatra पर मिलते हैं।
              मंदिर आमतौर पर <strong>मई से अक्टूबर / नवंबर की शुरुआत</strong> तक खुला रहता है, और हर यात्री का आधिकारिक रजिस्ट्रेशन ज़रूरी है।
            </p>
          </QuickAnswer>

          <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">रजिस्ट्रेशन और हेलीकॉप्टर टिकट सिर्फ़ आधिकारिक पोर्टल पर</p>
            <p className="mt-1 text-sm">
              रजिस्ट्रेशन{" "}
              <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Registration & Tourist Care पोर्टल</a>{" "}
              पर और हेलीकॉप्टर टिकट{" "}
              <a href={officialLinks.heliYatra} target="_blank" rel="noopener noreferrer" className="font-semibold underline">IRCTC HeliYatra</a>{" "}
              पर। हम हेलीकॉप्टर टिकट नहीं बेचते। यह सरकारी वेबसाइट नहीं है।
            </p>
          </div>

          <h2>पैकेज में क्या शामिल है</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {includes.map((c) => (
              <div key={c.title} className="card p-5">
                <h3 className="font-semibold text-forest-900">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>

          <PackageRow
            title="तैयार यात्रा पैकेज"
            slugs={["kedarnath-yatra-5-days", "do-dham-kedarnath-badrinath-6-days", "char-dham-yatra-10-days"]}
            className="mt-10"
          />

          <h2>हरिद्वार से 5 दिन का प्लान</h2>
          <ol className="not-prose relative space-y-3 border-l-2 border-forest-100 pl-5">
            {plan.map(([day, text]) => (
              <li key={day} className="relative">
                <span className="absolute top-1 -left-[1.6rem] h-3 w-3 rounded-full bg-forest-600 ring-4 ring-cream" aria-hidden="true" />
                <p className="text-sm"><strong className="text-forest-900">{day}:</strong> <span className="text-slate-700">{text}</span></p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">दिल्ली से आने पर दोनों तरफ़ एक-एक दिन और जोड़ें।</p>

          <h2>यात्रा से पहले — चेकलिस्ट</h2>
          <ul>
            <li>आधिकारिक रजिस्ट्रेशन पूरा करें और उसका प्रमाण व फ़ोटो पहचान पत्र साथ रखें।</li>
            <li>चढ़ाई से पहले मेडिकल जाँच करवाएँ; अपनी दवाइयाँ साथ रखें।</li>
            <li>गर्मियों में भी गर्म कपड़े, रेनकोट, टॉर्च और अच्छे जूते रखें।</li>
            <li>बारिश या भूस्खलन के लिए एक अतिरिक्त दिन रखें।</li>
          </ul>

          <h2>अक्सर पूछे जाने वाले सवाल</h2>
          <FaqList faqs={faqs} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">केदारनाथ यात्रा का कोटेशन</h2>
            <p className="mt-2 text-sm text-slate-600">
              तारीख़, यात्रियों की संख्या और होटल की श्रेणी बताइए — हम {site.replyTime.replace("minutes", "मिनट")} में WhatsApp पर दिन-वार प्लान और लिखित कोटेशन भेजते हैं।
            </p>
            <div className="mt-4 grid gap-3">
              <Link href="/customise-my-trip/?destination=Char+Dham+Yatra&interest=Pilgrimage" className="btn-primary w-full">कोटेशन माँगें</Link>
              <WhatsAppButton className="btn-secondary w-full" label="WhatsApp पर बात करें" message="नमस्ते EcoSoul, मुझे केदारनाथ यात्रा पैकेज चाहिए। तारीख़: ___ यात्री: ___" />
            </div>
          </div>
          <nav aria-label="और जानकारी" className="card p-6 text-sm">
            <h2 className="font-semibold text-forest-900">और जानकारी</h2>
            <ul className="mt-3 space-y-1">
              <li><Link href="/hi/char-dham-yatra/" className="inline-block py-1.5 text-forest-700 hover:underline">चार धाम यात्रा प्लानिंग →</Link></li>
              <li><Link href="/hi/haridwar-rishikesh-taxi/" className="inline-block py-1.5 text-forest-700 hover:underline">दिल्ली से हरिद्वार / ऋषिकेश टैक्सी →</Link></li>
              <li><Link href="/travel-guides/kedarnath-trip-guide/" className="inline-block py-1.5 text-forest-700 hover:underline">केदारनाथ ट्रेक गाइड (English) →</Link></li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
