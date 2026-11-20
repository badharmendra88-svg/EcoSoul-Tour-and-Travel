"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainNav, mobileExtraNav, site } from "@/config/site";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so navigating closes it (no effect needed)
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (fn: (v: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-cream/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-forest-100 text-forest-800" : "text-slate-700 hover:bg-forest-50 hover:text-forest-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/customise-my-trip/" className="btn-primary hidden sm:inline-flex">
            Plan My Trip
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-forest-800 hover:bg-forest-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-200 bg-cream lg:hidden">
          <ul className="container-page grid gap-1 py-3">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-lg px-3 py-3 font-medium text-slate-800 hover:bg-forest-50">
                  {item.label}
                </Link>
              </li>
            ))}
            {mobileExtraNav.map((item, i) => (
              <li key={item.href} className={i === 0 ? "mt-1 border-t border-slate-200 pt-1" : ""}>
                <Link href={item.href} className="block rounded-lg px-3 py-3 text-sm font-medium text-forest-700 hover:bg-forest-50">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/customise-my-trip/" className="btn-primary w-full">
                Plan My Trip
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
