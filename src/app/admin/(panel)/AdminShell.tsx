"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "../actions";

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number };

export function AdminShell({
  nav,
  user,
  children,
}: {
  nav: { group: string; items: NavItem[] }[];
  user: { name: string; role: string };
  children: ReactNode;
}) {
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/admin/" ? pathname === "/admin/" || pathname.startsWith("/admin/leads") : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin/" className="block px-5 pt-6 pb-7" aria-label="EcoSoul admin console home">
        <Logo light size="sm" />
        <span className="mt-2 block pl-0.5 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">Admin console</span>
      </Link>

      <nav aria-label="Admin" className="flex-1 space-y-7 overflow-y-auto px-3">
        {nav.map((g) => (
          <div key={g.group}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-forest-400 uppercase">{g.group}</p>
            <ul className="space-y-1">
              {g.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active ? "bg-white/[0.08] text-white shadow-inner shadow-white/5" : "text-forest-200 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {active && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-accent" />}
                      <span className={active ? "text-accent" : "text-forest-400 group-hover:text-forest-200"}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-forest-900 tabular-nums">{item.badge}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 space-y-1 rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/5">
        <Link
          href="/admin/account/"
          aria-current={pathname.startsWith("/admin/account") ? "page" : undefined}
          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.05]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-forest-900">{initials}</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block text-[11px] text-forest-300">{user.role} · My account</span>
          </span>
        </Link>
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-forest-200 hover:bg-white/[0.05] hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
          View website
        </a>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-forest-200 hover:bg-white/[0.05] hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f2]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-gradient-to-b from-forest-900 via-forest-900 to-[#021a10] lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin/" className="flex items-center gap-2 py-1" aria-label="EcoSoul admin console home">
          <Logo size="sm" />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open menu" aria-expanded={open}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-forest-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-forest-900 to-[#021a10] shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
