import Link from "next/link";
import { RidgeTop } from "./Depth";
import { routeBySlug, routePath } from "@/config/journeys";

// Illustrated, tilted "table map" of the main road journeys from Delhi into Uttarakhand.
// Pure SVG: routes draw a moving dashed line and a small car travels along each one (SMIL
// animateMotion, hidden for "reduce motion" users). Positions follow real latitude/longitude
// (x = (lon - 76.8) * 200, y = (31.6 - lat) * 200) but the map is a sketch, not to scale.

type Pin = { id: string; name: string; x: number; y: number; href: string; big?: boolean; label?: "l" | "r" | "t" | "b" };

const pins: Pin[] = [
  { id: "delhi", name: "Delhi NCR", x: 82, y: 598, href: "/uttarakhand/from-delhi/", big: true, label: "r" },
  { id: "dehradun", name: "Dehradun", x: 246, y: 262, href: "/taxi/delhi-to-dehradun/", label: "l" },
  { id: "mussoorie", name: "Mussoorie", x: 238, y: 214, href: "/destinations/mussoorie/", label: "l" },
  { id: "haridwar", name: "Haridwar", x: 272, y: 334, href: "/destinations/haridwar/", label: "l" },
  { id: "rishikesh", name: "Rishikesh", x: 300, y: 300, href: "/destinations/rishikesh/", label: "r" },
  { id: "kedarnath", name: "Kedarnath", x: 454, y: 174, href: "/uttarakhand/kedarnath-yatra-package/", big: true, label: "t" },
  { id: "badrinath", name: "Badrinath", x: 538, y: 160, href: "/uttarakhand/char-dham-yatra/", label: "t" },
  { id: "auli", name: "Auli", x: 560, y: 214, href: "/destinations/auli/", label: "r" },
  { id: "corbett", name: "Jim Corbett", x: 452, y: 446, href: "/destinations/jim-corbett/", label: "b" },
  { id: "nainital", name: "Nainital", x: 534, y: 430, href: "/destinations/nainital/", big: true, label: "r" },
  { id: "almora", name: "Almora", x: 584, y: 386, href: "/destinations/almora/", label: "r" },
  { id: "munsiyari", name: "Munsiyari", x: 660, y: 250, href: "/destinations/munsiyari/", label: "r" },
];

const roads = [
  { id: "r-nainital", d: "M82 598 C220 560 380 520 534 430", colour: "var(--color-accent)", slug: "delhi-to-nainital", dur: 7 },
  { id: "r-rishikesh", d: "M82 598 C150 480 220 400 272 334 S290 310 300 300", colour: "#7cc4ef", slug: "delhi-to-rishikesh", dur: 6 },
  { id: "r-mussoorie", d: "M82 598 C120 470 190 330 246 262 S240 230 238 214", colour: "#a7d2b8", slug: "delhi-to-mussoorie", dur: 6.5 },
  { id: "r-kedarnath", d: "M300 300 C350 280 380 250 400 228 S440 190 454 174", colour: "#f6c177", slug: null, dur: 5 },
  { id: "r-corbett", d: "M82 598 C200 560 330 500 452 446", colour: "#c8e6a0", slug: "delhi-to-jim-corbett", dur: 6.8 },
];

// Rough outline of Uttarakhand (sketch)
const STATE = "M232 196 L262 118 L318 82 L372 92 L420 70 L486 96 L540 112 L600 150 L662 186 L720 228 L716 300 L684 352 L652 410 L618 470 L560 486 L500 470 L440 456 L380 420 L330 380 L276 354 L236 300 L214 250Z";

export function RoadMap() {
  const legend = roads
    .filter((r) => r.slug && routeBySlug(r.slug))
    .map((r) => {
      const route = routeBySlug(r.slug!)!;
      return { colour: r.colour, label: `${route.from.name} → ${route.to.name}`, km: route.km, href: routePath(route) };
    });

  return (
    <section className="relative overflow-x-clip bg-forest-900 py-14 text-white sm:py-20">
      <RidgeTop fill="var(--color-forest-900)" />
      <div className="bg-topo absolute inset-0" aria-hidden="true" />
      <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1fr_1.35fr]">
        <div className="reveal">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">Road map</p>
          <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Where the roads from Delhi take you</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-forest-100">
            Most trips start in Delhi NCR and follow one of a few hill roads — to the lakes of Kumaon, the Ganga towns and the Char Dham, or
            the Mussoorie ridge. Tap a place to see trips and taxi fares.
          </p>
          <ul className="mt-6 space-y-2">
            {legend.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="glass group flex items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-white/10 transition-colors hover:bg-white/15">
                  <span className="h-1.5 w-6 shrink-0 rounded-full" style={{ background: l.colour }} aria-hidden="true" />
                  <span className="flex-1 text-sm font-medium">{l.label}</span>
                  <span className="text-xs text-forest-200">{l.km} km</span>
                  <span className="text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal map-stage">
          <div className="map-plane">
            <svg viewBox="0 0 780 660" className="h-auto w-full" role="img" aria-label="Illustrated map of road routes from Delhi to Uttarakhand destinations">
              <defs>
                <linearGradient id="map-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2f7a52" />
                  <stop offset="1" stopColor="#174d33" />
                </linearGradient>
                <filter id="map-shadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* State "slab": a darker copy underneath gives it thickness */}
              <path d={STATE} fill="#0b2e1f" transform="translate(0 14)" />
              <path d={STATE} fill="url(#map-land)" stroke="#6fb08b" strokeWidth="2" filter="url(#map-shadow)" />
              {/* Snow line along the north */}
              <path d="M262 118 L318 82 L372 92 L420 70 L486 96 L540 112 L600 150 L662 186 L640 206 L580 176 L520 146 L470 130 L420 110 L370 126 L320 118 L280 146Z" fill="#ffffff" opacity="0.14" />
              {/* Little peaks */}
              {[[330, 120], [410, 104], [480, 128], [560, 150], [620, 190], [380, 150]].map(([x, y]) => (
                <path key={`${x}-${y}`} d={`M${x - 16} ${y + 14} L${x} ${y - 8} L${x + 16} ${y + 14}Z`} fill="#e9f3ee" opacity="0.55" />
              ))}
              <text x="600" y="560" fill="#a7d2b8" fontSize="18" fontFamily="var(--font-script)" opacity="0.9">Devbhoomi</text>
              <text x="40" y="640" fill="#6fb08b" fontSize="11" opacity="0.8">Illustration — not to scale</text>

              {/* Roads */}
              {roads.map((r) => (
                <g key={r.id}>
                  <path d={r.d} fill="none" stroke="#03291a" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
                  <path id={r.id} d={r.d} fill="none" stroke={r.colour} strokeWidth="3" strokeLinecap="round" className="map-road" />
                  <g className="map-car">
                    <circle r="7" fill={r.colour} stroke="#03291a" strokeWidth="2" />
                    <circle r="2.5" fill="#03291a" />
                    <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#${r.id}`} />
                    </animateMotion>
                  </g>
                </g>
              ))}

              {/* Pins */}
              {pins.map((p) => {
                const r = p.big ? 9 : 6;
                const tx = p.label === "l" ? p.x - r - 6 : p.label === "r" ? p.x + r + 6 : p.x;
                const ty = p.label === "t" ? p.y - r - 8 : p.label === "b" ? p.y + r + 16 : p.y + 4;
                const anchor = p.label === "l" ? "end" : p.label === "r" ? "start" : "middle";
                return (
                  <Link key={p.id} href={p.href} className="map-pin">
                    {p.big && <circle cx={p.x} cy={p.y} r={r} className="map-pulse" fill="var(--color-accent)" />}
                    <circle cx={p.x} cy={p.y} r={r} fill={p.big ? "var(--color-accent)" : "#ffffff"} stroke="#03291a" strokeWidth="2.5" />
                    <text x={tx} y={ty} textAnchor={anchor} fill="#ffffff" fontSize={p.big ? 17 : 14} fontWeight={p.big ? 700 : 600} className="map-label">
                      {p.name}
                    </text>
                  </Link>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
