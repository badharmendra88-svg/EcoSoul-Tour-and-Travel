import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "../actions";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin/", label: "Leads" },
  { href: "/admin/quotes/", label: "Quotes" },
  { href: "/admin/rates/", label: "Rate card" },
  { href: "/admin/packages/", label: "Packages" },
  { href: "/admin/destinations/", label: "Destinations" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/"><Logo /></Link>
            <nav aria-label="Admin">
              <ul className="flex gap-1">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" className="text-slate-600 hover:underline">View site ↗</Link>
            <form action={logoutAction}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
