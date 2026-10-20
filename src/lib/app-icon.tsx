import { ImageResponse } from "next/og";

// App icon drawn in code (no image files): forest green tile, marigold
// mountains and sun — used for favicon, Apple touch icon and PWA icons.
// `maskable` adds the safe-zone padding Android needs for adaptive icons.
export function renderAppIcon(size: number, { maskable = false, badge }: { maskable?: boolean; badge?: string } = {}) {
  const inset = maskable ? size * 0.2 : size * 0.12;
  const art = size - inset * 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #25583a 0%, #0f261b 100%)",
          borderRadius: maskable ? 0 : size * 0.22,
          position: "relative",
        }}
      >
        <svg width={art} height={art} viewBox="0 0 40 40">
          <path d="M3 32 L15 14 L21 22 L27 12 L37 32 Z" fill="#f0a53c" />
          <path d="M27 12 L23.5 17.5 L27 16.2 L30.5 18 Z" fill="#ffffff" />
          <path d="M15 14 L11.5 19.5 L15 18.3 L18 20.5 Z" fill="#ffffff" opacity="0.85" />
          <circle cx="32" cy="7" r="3.2" fill="#f0a53c" />
        </svg>
        {badge && (
          <div
            style={{
              position: "absolute",
              bottom: size * (maskable ? 0.2 : 0.08),
              right: size * (maskable ? 0.2 : 0.08),
              background: "#f0a53c",
              color: "#0f261b",
              fontSize: size * 0.13,
              fontWeight: 800,
              padding: `${size * 0.015}px ${size * 0.04}px`,
              borderRadius: size * 0.04,
              display: "flex",
            }}
          >
            {badge}
          </div>
        )}
      </div>
    ),
    { width: size, height: size },
  );
}
