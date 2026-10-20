export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill={light ? "#ffffff" : "#1d4630"} />
        <path d="M6 28 L15 15 L20 21 L25 13 L34 28Z" fill={light ? "#1d4630" : "#aed1ba"} />
        <path d="M25 13 L22 17.5 L25 16.5 L28 18Z" fill={light ? "#f0a53c" : "#ffffff"} />
        <circle cx="29" cy="10" r="3" fill="#f0a53c" />
      </svg>
      <span className="leading-tight">
        <span className={`block text-base font-bold ${light ? "text-white" : "text-forest-900"}`}>EcoSoul</span>
        <span className={`block text-[11px] font-medium tracking-wide ${light ? "text-forest-100" : "text-forest-600"}`}>
          UTTARAKHAND TRAVEL
        </span>
      </span>
    </span>
  );
}
