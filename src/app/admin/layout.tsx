import type { Metadata, Viewport } from "next";

// Admin console installs as its own app ("EcoSoul Admin") on phones.
export const metadata: Metadata = {
  manifest: "/admin-app/manifest/",
  appleWebApp: { capable: true, title: "EcoSoul Admin", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0f261b" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
