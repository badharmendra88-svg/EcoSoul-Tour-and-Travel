import { renderAppIcon } from "@/lib/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS adds its own rounded mask, so use the full-bleed (maskable) layout
export default function AppleIcon() {
  return renderAppIcon(180, { maskable: true });
}
