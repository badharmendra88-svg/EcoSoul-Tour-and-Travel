import { HindiTaxiPage, findRoute, hindiTime } from "@/components/HindiTaxiPage";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

const PATH = "/hi/nainital-taxi/";
const EN = "/taxi/delhi-to-nainital/";
const delhi = findRoute("delhi", "nainital");
const kgm = findRoute("kathgodam", "nainital");

const meta = pageMeta({
  title: "दिल्ली से नैनीताल टैक्सी — काठगोदाम से भी",
  description: `दिल्ली से नैनीताल टैक्सी (${delhi?.km} किमी) और काठगोदाम स्टेशन से नैनीताल (${kgm?.km} किमी): सेडान, SUV या टेम्पो ट्रैवलर, अनुभवी पहाड़ी ड्राइवर और WhatsApp पर लिखित किराया।`,
  path: PATH,
});
export const metadata = {
  ...meta,
  openGraph: { ...meta.openGraph, locale: "hi_IN" },
  alternates: { ...meta.alternates, languages: { "en-IN": `${site.url}${EN}`, "hi-IN": `${site.url}${PATH}` } },
};

export default function NainitalTaxiHindiPage() {
  return (
    <HindiTaxiPage
      title="दिल्ली से नैनीताल टैक्सी"
      intro="दिल्ली NCR, काठगोदाम रेलवे स्टेशन या पंतनगर एयरपोर्ट से नैनीताल — एक तरफ़ या आना-जाना, अनुभवी पहाड़ी ड्राइवर के साथ।"
      path={PATH}
      englishPath={EN}
      dropName="Nainital"
      routes={[
        { from: "delhi", to: "nainital", fromHi: "दिल्ली", toHi: "नैनीताल" },
        { from: "kathgodam", to: "nainital", fromHi: "काठगोदाम स्टेशन", toHi: "नैनीताल" },
        { from: "pantnagar", to: "nainital", fromHi: "पंतनगर एयरपोर्ट", toHi: "नैनीताल" },
        { from: "delhi", to: "bhimtal", fromHi: "दिल्ली", toHi: "भीमताल" },
      ]}
      answer={
        <p>
          दिल्ली से नैनीताल सड़क से लगभग <strong>{delhi?.km} किमी</strong> है और {delhi ? hindiTime(delhi.time) : ""} लगते हैं। काठगोदाम रेलवे
          स्टेशन से नैनीताल सिर्फ़ <strong>{kgm?.km} किमी</strong> ({kgm ? hindiTime(kgm.time) : ""}) है। परिवार के लिए SUV (Ertiga / Innova)
          सबसे आरामदायक रहती है। तारीख़ और यात्री बताइए — हम WhatsApp पर लिखित किराया भेजते हैं, जिसमें फ़्यूल, ड्राइवर भत्ता और GST शामिल होता है।
        </p>
      }
      points={[
        "पहाड़ी रास्तों का अनुभव रखने वाले ड्राइवर — लाइसेंस और अनुभव की जाँच के बाद ही।",
        "घर, होटल, एयरपोर्ट या स्टेशन से पिकअप — दिल्ली, नोएडा, गुरुग्राम, गाज़ियाबाद और फ़रीदाबाद में कहीं से भी।",
        "पहले लिखित किराया, फिर बुकिंग — टोल, पार्किंग और स्टेट टैक्स अलग से साफ़ लिखे होते हैं।",
        "आना-जाना (राउंड ट्रिप) लेने पर वही गाड़ी और ड्राइवर नैनीताल, भीमताल और मुक्तेश्वर घुमाने में भी साथ रहते हैं।",
      ]}
      faqs={[
        { q: "दिल्ली से नैनीताल कितनी दूर है?", a: `सड़क से लगभग ${delhi?.km} किमी। ट्रैफ़िक और रुकने के हिसाब से आमतौर पर ${delhi ? hindiTime(delhi.time) : ""} लगते हैं।` },
        { q: "काठगोदाम से नैनीताल टैक्सी कितनी देर में पहुँचाती है?", a: `काठगोदाम स्टेशन से नैनीताल लगभग ${kgm?.km} किमी है, यानी ${kgm ? hindiTime(kgm.time) : ""}। ट्रेन नंबर बताइए, ड्राइवर स्टेशन पर मिलेगा।` },
        { q: "दिल्ली से नैनीताल टैक्सी का किराया कितना है?", a: "किराया गाड़ी, तारीख़ और एक तरफ़ या आना-जाना पर निर्भर करता है। अपनी तारीख़ और यात्री भेजिए — हम पूरा लिखित किराया भेजेंगे। बुकिंग पक्की होने से पहले कोई पैसा नहीं लगता।" },
        { q: "कौन-सी गाड़ी लें?", a: "4 लोग और कम सामान हो तो सेडान ठीक है। परिवार और ज़्यादा सामान के लिए SUV लें। 7 से 12 लोगों के लिए टेम्पो ट्रैवलर।" },
        { q: "क्या रात में सफ़र करना ठीक है?", a: "पहाड़ी रास्ते पर दिन में चलना ज़्यादा सुरक्षित है। हम दिल्ली से सुबह जल्दी निकलने का प्लान बनाते हैं ताकि अंधेरा होने से पहले नैनीताल पहुँच जाएँ।" },
      ]}
      related={[
        { href: "/uttarakhand/nainital-tour-package/", label: "नैनीताल टूर पैकेज (English)" },
        { href: "/uttarakhand/kumaon-tour-packages/", label: "कुमाऊँ टूर पैकेज (English)" },
        { href: "/hi/haridwar-rishikesh-taxi/", label: "दिल्ली से हरिद्वार / ऋषिकेश टैक्सी" },
        { href: "/hi/kedarnath-yatra/", label: "केदारनाथ यात्रा पैकेज" },
      ]}
    />
  );
}
