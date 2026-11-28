// Decorative 2D/3D depth pieces (pure SVG + CSS, no JS, no extra downloads).
// MountainLayers: layered Himalayan ridges at the bottom of a hero; each layer drifts at its own
// speed while the page scrolls (CSS scroll-driven animation, see globals.css .ridge-*), which gives
// a parallax / 3D feel. The front layer is filled with the colour of the section below so the hero
// "melts" into the page.

export function MountainLayers({ fill = "var(--color-cream)", className = "" }: { fill?: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-40 lg:h-48 ${className}`}>
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="ridge ridge-back absolute inset-0 h-full w-full">
        <path d="M0 120 C60 100 90 70 140 62 C190 70 220 100 260 98 C320 80 350 40 400 34 C460 44 490 92 560 90 C620 70 660 52 720 50 C790 60 820 96 880 94 C950 70 990 40 1050 38 C1110 50 1150 92 1210 90 C1270 72 1320 56 1370 60 C1400 66 1420 76 1440 80 L1440 200 L0 200Z" fill="var(--color-forest-900)" opacity="0.35" />
      </svg>
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="ridge ridge-mid absolute inset-0 h-full w-full">
        <path d="M0 150 C80 130 130 100 200 98 C270 104 300 136 370 134 C450 118 500 90 580 92 C650 100 690 140 760 138 C840 120 890 96 960 98 C1030 108 1070 140 1140 136 C1210 120 1260 100 1330 104 C1390 110 1420 124 1440 128 L1440 200 L0 200Z" fill="var(--color-forest-900)" opacity="0.55" />
      </svg>
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="ridge ridge-front absolute inset-0 h-full w-full">
        <path d="M0 175 C160 140 300 168 460 150 C620 132 760 170 920 152 C1080 134 1240 166 1440 142 L1440 200 L0 200Z" fill={fill} />
      </svg>
    </div>
  );
}

// A soft hill edge between two sections. Place as the first child of a `relative` section;
// `fill` is that section's own background so the hill rises out of the section above.
export function RidgeTop({ fill, className = "" }: { fill: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 -top-[39px] h-10 w-full sm:-top-[47px] sm:h-12 ${className}`}
    >
      <path d="M0 60 L0 38 C120 18 220 30 340 22 C470 12 560 40 700 30 C840 20 930 2 1080 14 C1220 26 1320 18 1440 28 L1440 60Z" fill={fill} />
    </svg>
  );
}

// 3D-looking icon tile: gradient face, top highlight, soft drop shadow.
export function IconTile({ d, className = "" }: { d: string; className?: string }) {
  return (
    <span className={`icon-3d ${className}`}>
      <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    </span>
  );
}
