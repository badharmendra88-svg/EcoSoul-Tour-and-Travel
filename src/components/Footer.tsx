import Link from "next/link";
import { footerNav, officialLinks, site, telLink } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-forest-900 pb-24 text-forest-100 sm:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-forest-200">
            Tour packages, custom trips and car + driver bookings across Uttarakhand — planned by people who know the hills.
          </p>
          <address className="space-y-1 text-sm not-italic">
            <a href={telLink()} className="block hover:text-white">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block hover:text-white">{site.email}</a>
            <span className="block text-forest-200">{site.address}</span>
            <span className="block text-forest-200">{site.hours}</span>
          </address>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-3 text-sm font-semibold text-white">{group.title}</h2>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-forest-200 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-forest-300 md:flex-row md:items-center md:justify-between">
          <p>© {year} {site.name}. Not an official government website.</p>
          <p>
            Official info:{" "}
            <a href={officialLinks.tourism} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              Uttarakhand Tourism
            </a>{" "}
            ·{" "}
            <a href={officialLinks.yatraRegistration} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              Yatra registration
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
