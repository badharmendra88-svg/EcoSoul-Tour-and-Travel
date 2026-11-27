import { HindiTaxiPage, findRoute, hindiTime } from "@/components/HindiTaxiPage";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

const PATH = "/hi/haridwar-rishikesh-taxi/";
const EN = "/taxi/delhi-to-haridwar/";
const hdw = findRoute("delhi", "haridwar");
const rsk = findRoute("delhi", "rishikesh");

const meta = pageMeta({
  title: "दिल्ली से हरिद्वार और ऋषिकेश टैक्सी",
  description: `दिल्ली से हरिद्वार (${hdw?.km} किमी) और ऋषिकेश (${rsk?.km} किमी) टैक्सी: सेडान, SUV या टेम्पो ट्रैवलर, एक तरफ़ या आना-जाना, और WhatsApp पर लिखित किराया।`,
  path: PATH,
});
export const metadata = {
  ...meta,
  openGraph: { ...meta.openGraph, locale: "hi_IN" },
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}${EN}`, "hi-IN": `${site.url}${PATH}` } },
};

export default function HaridwarTaxiHindiPage() {
  return (
    <HindiTaxiPage
      title="दिल्ली से हरिद्वार और ऋषिकेश टैक्सी"
      intro="गंगा स्नान, आरती और चार धाम यात्रा की शुरुआत — दिल्ली NCR से हरिद्वार और ऋषिकेश के लिए भरोसेमंद टैक्सी, अनुभवी ड्राइवर के साथ।"
      path={PATH}
      englishPath={EN}
      dropName="Haridwar"
      routes={[
        { from: "delhi", to: "haridwar", fromHi: "दिल्ली", toHi: "हरिद्वार" },
        { from: "delhi", to: "rishikesh", fromHi: "दिल्ली", toHi: "ऋषिकेश" },
        { from: "haridwar", to: "rishikesh", fromHi: "हरिद्वार", toHi: "ऋषिकेश" },
        { from: "haridwar", to: "sonprayag", fromHi: "हरिद्वार", toHi: "सोनप्रयाग (केदारनाथ)" },
      ]}
      answer={
        <p>
          दिल्ली से हरिद्वार लगभग <strong>{hdw?.km} किमी</strong> ({hdw ? hindiTime(hdw.time) : ""}) और ऋषिकेश लगभग{" "}
          <strong>{rsk?.km} किमी</strong> ({rsk ? hindiTime(rsk.time) : ""}) है। एक ही दिन में दोनों जगह घूमकर लौटना भी हो सकता है, लेकिन आरती
          देखने के लिए एक रात रुकना बेहतर है। तारीख़ और यात्री बताइए — हम WhatsApp पर लिखित किराया भेजते हैं।
        </p>
      }
      points={[
        "दिल्ली, नोएडा, गुरुग्राम, गाज़ियाबाद या फ़रीदाबाद में घर या होटल से पिकअप।",
        "हर की पौड़ी, मनसा देवी, चंडी देवी, लक्ष्मण झूला और त्रिवेणी घाट — घूमने का प्लान भी साथ में।",
        "चार धाम या केदारनाथ यात्रा के लिए वही गाड़ी और ड्राइवर आगे भी जा सकते हैं।",
        "पहले लिखित किराया, फिर बुकिंग — टोल, पार्किंग और स्टेट टैक्स अलग से साफ़ लिखे होते हैं।",
      ]}
      faqs={[
        { q: "दिल्ली से हरिद्वार कितनी दूर है?", a: `सड़क से लगभग ${hdw?.km} किमी, आमतौर पर ${hdw ? hindiTime(hdw.time) : ""}। रास्ता दिल्ली–मेरठ एक्सप्रेसवे और मुज़फ़्फ़रनगर होकर जाता है।` },
        { q: "हरिद्वार से ऋषिकेश कितनी दूर है?", a: "लगभग 25 किमी, यानी करीब 45 मिनट। दोनों जगह एक ही ट्रिप में घूम सकते हैं।" },
        { q: "क्या एक दिन में हरिद्वार–ऋषिकेश घूमकर दिल्ली लौट सकते हैं?", a: "हाँ, अगर सुबह जल्दी निकलें। लेकिन हर की पौड़ी की शाम की गंगा आरती देखनी हो तो एक रात हरिद्वार या ऋषिकेश में रुकना बेहतर है।" },
        { q: "किराया कितना लगेगा?", a: "किराया गाड़ी, तारीख़ और एक तरफ़ या आना-जाना पर निर्भर करता है। अपनी जानकारी भेजिए — हम पूरा लिखित किराया भेजेंगे। मंज़ूर करने से पहले कोई पैसा नहीं लगता।" },
        { q: "क्या आप केदारनाथ या चार धाम भी ले जाते हैं?", a: "हाँ। हरिद्वार या ऋषिकेश से केदारनाथ, दो धाम और चार धाम यात्रा के लिए होटल और गाड़ी समेत पूरा प्लान बनाते हैं।" },
      ]}
      related={[
        { href: "/hi/kedarnath-yatra/", label: "केदारनाथ यात्रा पैकेज" },
        { href: "/hi/char-dham-yatra/", label: "चार धाम यात्रा प्लानिंग" },
        { href: "/hi/nainital-taxi/", label: "दिल्ली से नैनीताल टैक्सी" },
        { href: "/destinations/rishikesh/", label: "ऋषिकेश गाइड (English)" },
      ]}
    />
  );
}
