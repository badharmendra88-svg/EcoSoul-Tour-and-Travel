// Illustrated placeholder artwork. Used instead of stock photos until the
// business supplies real, licensed images (blueprint §13 — no misleading imagery).

type Scene = "lake" | "mountain" | "river" | "forest" | "snow" | "temple" | "meadow";

const skies: Record<Scene, [string, string]> = {
  lake: ["#cfe6f2", "#f6efe0"],
  mountain: ["#d9e7ef", "#f7efe1"],
  river: ["#d3ecea", "#f8f1e2"],
  forest: ["#dcebdc", "#f5efe0"],
  snow: ["#c9dcef", "#eef3f7"],
  temple: ["#f6dcc0", "#fbefe0"],
  meadow: ["#d6ecf0", "#f4f1e2"],
};

export function SceneArt({
  scene = "mountain",
  className = "",
  title,
}: {
  scene?: string;
  className?: string;
  title?: string;
}) {
  const s = (scene in skies ? scene : "mountain") as Scene;
  const [skyTop, skyBottom] = skies[s];
  const id = `sky-${s}`;
  const snowy = s === "snow" || s === "mountain";

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id})`} />
      <circle cx={s === "temple" ? 300 : 320} cy="58" r="20" fill={s === "temple" ? "#f4b860" : "#fbe3a6"} opacity="0.9" />

      {/* far range */}
      <path d="M0 150 L60 92 L105 128 L165 70 L222 120 L280 78 L340 125 L400 96 L400 240 L0 240Z" fill="#9db7c4" />
      {snowy && (
        <path d="M165 70 L150 84 L160 86 L168 80 L176 88 L184 82ZM280 78 L268 90 L278 92 L285 86 L292 92Z" fill="#ffffff" />
      )}
      {/* mid range */}
      <path d="M0 170 L70 120 L130 158 L200 112 L265 160 L330 125 L400 155 L400 240 L0 240Z" fill="#5f8f74" />
      {/* near hills */}
      <path d="M0 196 C80 170 140 186 200 176 C270 164 330 184 400 172 L400 240 L0 240Z" fill="#2f6b47" />

      {s === "lake" && <ellipse cx="200" cy="214" rx="150" ry="18" fill="#7fb6d1" opacity="0.95" />}
      {s === "river" && (
        <path d="M140 240 C170 220 230 214 210 196 C196 186 236 182 260 178 L272 180 C248 186 222 190 236 198 C262 214 214 226 196 240Z" fill="#7fb6d1" />
      )}
      {s === "snow" && <path d="M0 200 C90 186 160 196 230 188 C300 180 350 192 400 186 L400 240 L0 240Z" fill="#eef4f8" />}
      {(s === "forest" || s === "mountain" || s === "snow") &&
        [30, 58, 86, 318, 346, 372].map((x, i) => (
          <path key={x} d={`M${x} ${208 - (i % 2) * 6} l12 -30 l12 30Z`} fill="#163626" />
        ))}
      {s === "temple" && (
        <g fill="#7a3e1d">
          <path d="M186 192 L200 150 L214 192Z" />
          <rect x="176" y="190" width="48" height="22" />
          <rect x="196" y="140" width="2" height="12" />
          <path d="M198 140 l10 4 l-10 4Z" fill="#e0602c" />
        </g>
      )}
      {s === "meadow" &&
        [40, 90, 130, 175, 230, 270, 320, 360, 70, 300].map((x, i) => (
          <circle key={x} cx={x} cy={214 + (i % 3) * 8} r="3.5" fill={["#f2c14e", "#e86a92", "#ffffff"][i % 3]} />
        ))}
    </svg>
  );
}
