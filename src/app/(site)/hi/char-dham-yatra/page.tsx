import Link from "next/link";
import { WhatsAppButton } from "@/components/ContactButtons";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { officialLinks, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

// Hindi version of the Char Dham planning page — the most-searched Hindi query
// for Uttarakhand travel. Keep facts in sync with /uttarakhand/char-dham-yatra/.

const meta = pageMeta({
  title: "चार धाम यात्रा प्लानिंग — रूट, रजिस्ट्रेशन और टैक्सी",
  description:
    "यमुनोत्री, गंगोत्री, केदारनाथ और बद्रीनाथ यात्रा की पूरी प्लानिंग: 10 दिन का रूट, आधिकारिक रजिस्ट्रेशन और हेलीकॉप्टर जानकारी, होटल और अनुभवी ड्राइवर के साथ गाड़ी।",
  path: "/hi/char-dham-yatra/",
});
export const metadata = {
  ...meta,
  openGraph: { ...meta.openGraph, locale: "hi_IN" },
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}/uttarakhand/char-dham-yatra/`, "hi-IN": `${site.url}/hi/char-dham-yatra/` } },
};

const dhams = [
  { name: "यमुनोत्री", text: "आमतौर पर पहला पड़ाव। जानकी चट्टी से पैदल चढ़ाई; घोड़े और पालकी स्थानीय रूप से मिलते हैं।" },
  { name: "गंगोत्री", text: "सड़क से पहुँचा जा सकता है। उत्तरकाशी या हर्षिल में रुकना सुविधाजनक रहता है।" },
  { name: "केदारनाथ", text: "गौरीकुंड से लंबी पैदल यात्रा (सीज़न में आधिकारिक हेलीकॉप्टर सेवा भी)। सबसे कठिन पड़ाव।" },
  { name: "बद्रीनाथ", text: "जोशीमठ होते हुए सड़क से। पास का माणा गाँव ज़रूर देखें।" },
];

const route: [string, string][] = [
  ["दिन 1", "हरिद्वार → बड़कोट (यमुनोत्री रूट), लगभग 6–7 घंटे"],
  ["दिन 2", "जानकी चट्टी → यमुनोत्री दर्शन → वापस बड़कोट"],
  ["दिन 3", "बड़कोट → उत्तरकाशी, विश्वनाथ मंदिर"],
  ["दिन 4", "उत्तरकाशी → गंगोत्री दर्शन → वापस उत्तरकाशी"],
  ["दिन 5", "उत्तरकाशी → गुप्तकाशी / सीतापुर"],
  ["दिन 6", "सोनप्रयाग → गौरीकुंड → केदारनाथ (पैदल या हेलीकॉप्टर)"],
  ["दिन 7", "केदारनाथ सुबह दर्शन → वापसी → गुप्तकाशी"],
  ["दिन 8", "गुप्तकाशी → जोशीमठ होते हुए बद्रीनाथ"],
  ["दिन 9", "बद्रीनाथ दर्शन, माणा गाँव → जोशीमठ / पीपलकोटी"],
  ["दिन 10", "ऋषिकेश / हरिद्वार वापसी"],
];

const help = [
  { title: "रजिस्ट्रेशन में मदद", text: "आधिकारिक रजिस्ट्रेशन पोर्टल पर फ़ॉर्म भरने में मार्गदर्शन। रजिस्ट्रेशन यात्री के अपने नाम से ही होता है।" },
  { title: "हेलीकॉप्टर की सही जानकारी", text: "केदारनाथ हेलीकॉप्टर टिकट केवल IRCTC HeliYatra पोर्टल पर मिलते हैं। हम बुकिंग खुलने का समय बताते हैं और नकली वेबसाइटों से सावधान करते हैं।" },
  { title: "होटल और गाड़ी", text: "हर पड़ाव पर आपकी पसंद की श्रेणी के होटल, और पूरे रूट के लिए अनुभवी पहाड़ी ड्राइवर के साथ SUV या टेम्पो ट्रैवलर।" },
  { title: "बुज़ुर्गों और ग्रुप के लिए", text: "आराम के दिन जोड़कर धीमा प्लान, घोड़ा / पालकी की जानकारी, और पूरी यात्रा में सहायता नंबर।" },
];

const faqs = [
  { q: "क्या चार धाम यात्रा के लिए रजिस्ट्रेशन ज़रूरी है?", a: "हाँ। सभी यात्रियों को उत्तराखंड सरकार के आधिकारिक Registration & Tourist Care पोर्टल पर रजिस्ट्रेशन करना होता है। नियम हर सीज़न में बदल सकते हैं, इसलिए यात्रा से पहले पोर्टल पर जाँच लें।" },
  { q: "यात्रा कब शुरू होती है?", a: "मंदिर आमतौर पर अप्रैल के अंत या मई में खुलते हैं और अक्टूबर–नवंबर में बंद होते हैं। सही तारीखें हर साल मंदिर समिति घोषित करती है।" },
  { q: "पूरी चार धाम यात्रा में कितने दिन लगते हैं?", a: "हरिद्वार या ऋषिकेश से सड़क मार्ग से लगभग 10–12 दिन। दो धाम (केदारनाथ + बद्रीनाथ) के लिए लगभग 6–7 दिन।" },
  { q: "क्या आप हेलीकॉप्टर टिकट बुक करते हैं?", a: "नहीं। केदारनाथ हेलीकॉप्टर टिकट केवल आधिकारिक IRCTC HeliYatra पोर्टल पर यात्री के नाम से बुक होते हैं। हम समय और रूट की प्लानिंग में मदद करते हैं।" },
  { q: "एडवांस कैसे देना होगा?", a: "हम पहले लिखित, पूरा विवरण वाला कोटेशन भेजते हैं। आप उसे स्वीकार करने के बाद कोटेशन लिंक से UPI या कार्ड से एडवांस दे सकते हैं।" },
];

export default function CharDhamHindiPage() {
  return (
    <div lang="hi">
      <PageHero
        title="चार धाम यात्रा प्लानिंग"
        intro="यमुनोत्री, गंगोत्री, केदारनाथ और बद्रीनाथ — सही रूट, होटल और अनुभवी ड्राइवर के साथ गाड़ी, और आधिकारिक रजिस्ट्रेशन की पूरी जानकारी।"
        crumbs={[{ label: "चार धाम यात्रा", href: "/hi/char-dham-yatra/" }]}
        scene="temple"
        eyebrow="तीर्थ यात्रा"
      >
        <Link href="/uttarakhand/char-dham-yatra/" lang="en" hrefLang="en" className="chip bg-white/90">Read in English →</Link>
      </PageHero>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="prose-body min-w-0">
          <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">ज़रूरी सूचना — यह सरकारी वेबसाइट नहीं है</p>
            <p className="mt-1 text-sm">
              यात्रा रजिस्ट्रेशन, स्वास्थ्य संबंधी नियम और मौसम की चेतावनी सरकार जारी करती है। यात्रा से पहले{" "}
              <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer" className="font-semibold underline">आधिकारिक रजिस्ट्रेशन पोर्टल</a>{" "}
              पर रजिस्ट्रेशन करें और ताज़ा नियम जाँच लें।
            </p>
          </div>

          <h2>चार धाम</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {dhams.map((d) => (
              <div key={d.name} className="card p-5">
                <h3 className="font-semibold text-forest-900">{d.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.text}</p>
              </div>
            ))}
          </div>

          <h2>हम कैसे मदद करते हैं</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {help.map((h) => (
              <div key={h.title} className="rounded-2xl border border-forest-100 bg-forest-50/50 p-5">
                <h3 className="font-semibold text-forest-900">{h.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{h.text}</p>
              </div>
            ))}
          </div>

          <h2>हरिद्वार से 10 दिन का सामान्य रूट</h2>
          <ol className="not-prose relative space-y-3 border-l-2 border-forest-100 pl-5">
            {route.map(([day, text]) => (
              <li key={day} className="relative">
                <span className="absolute top-1 -left-[1.6rem] h-3 w-3 rounded-full bg-forest-600 ring-4 ring-cream" aria-hidden="true" />
                <p className="text-sm"><strong className="text-forest-900">{day}:</strong> <span className="text-slate-700">{text}</span></p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">मौसम के लिए 1–2 अतिरिक्त दिन रखें।</p>

          <h2>यात्रा से पहले — चेकलिस्ट</h2>
          <ul>
            <li>आधिकारिक रजिस्ट्रेशन पूरा करें और उसका प्रमाण व सरकारी फ़ोटो पहचान पत्र साथ रखें।</li>
            <li>केदारनाथ और यमुनोत्री की चढ़ाई से पहले मेडिकल जाँच करवाएँ; अपनी दवाइयाँ साथ रखें।</li>
            <li>गर्मियों में भी गर्म कपड़े, रेनकोट और अच्छे जूते रखें।</li>
            <li>भूस्खलन और मौसम की वजह से सड़क बंद हो सकती है — अतिरिक्त दिन रखें।</li>
          </ul>

          <h2>अक्सर पूछे जाने वाले सवाल</h2>
          <FaqList faqs={faqs} />

          <p className="text-sm text-slate-500">
            आधिकारिक स्रोत: <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer">Registration & Tourist Care</a>,{" "}
            <a href={officialLinks.heliYatra} target="_blank" rel="noopener noreferrer">IRCTC HeliYatra</a>,{" "}
            <a href={officialLinks.tourism} target="_blank" rel="noopener noreferrer">Uttarakhand Tourism</a>।
          </p>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-forest-900">अपनी यात्रा प्लान करें</h2>
            <p className="mt-2 text-sm text-slate-600">तारीख़, यात्रियों की संख्या और कौन-से धाम — हमें बताइए, हम पूरा कोटेशन भेजेंगे।</p>
            <div className="mt-4 grid gap-3">
              <Link href="/customise-my-trip/?destination=Char+Dham+Yatra&interest=Pilgrimage" className="btn-primary w-full">यात्रा प्लान माँगें</Link>
              <WhatsAppButton className="btn-secondary w-full" label="WhatsApp पर बात करें" message="नमस्ते EcoSoul, मुझे चार धाम यात्रा की प्लानिंग में मदद चाहिए। तारीख़: ___ यात्री: ___" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
