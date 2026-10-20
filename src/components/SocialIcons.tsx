import type { SocialKey } from "@/lib/settings";

// Simple brand-neutral glyphs for social profile links.
const glyphs: Record<SocialKey, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </>
  ),
  facebook: <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V9c0-.6.4-1 1-1Z" />,
  youtube: (
    <>
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8Z" />
      <path d="m10 15 5-3-5-3v6Z" fill="var(--color-forest-900, #0f261b)" />
    </>
  ),
  twitter: <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />,
  linkedin: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z" />,
  googleBusiness: <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22ZM6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.4 14ZM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.7 9.4 5.9 12 5.9Z" />,
  tripadvisor: (
    <>
      <circle cx="7" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="13" r="1.3" />
      <circle cx="17" cy="13" r="1.3" />
      <path d="M2 8h20M12 9l-2 2.5M12 9l2 2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export function SocialIcon({ name, className = "h-4 w-4" }: { name: SocialKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {glyphs[name]}
    </svg>
  );
}

export function SocialLinks({ links, className = "" }: { links: { key: SocialKey; label: string; url: string }[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={`${l.label} (opens in new tab)`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-forest-100 transition-colors hover:bg-accent hover:text-forest-900"
          >
            <SocialIcon name={l.key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
