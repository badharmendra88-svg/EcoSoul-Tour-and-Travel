"use client";

import Link from "next/link";
import { telLink } from "@/config/site";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

// Friendly fallback for unexpected errors on public pages (header/footer stay in place).
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { phone } = useSiteSettings();
  return (
    <div className="container-page py-20 text-center">
      <h1 className="h1">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        This page couldn&apos;t be loaded right now. Please try again, or reach us directly on {phone}.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
        <a href={telLink(phone)} className="btn-outline">Call us</a>
      </div>
    </div>
  );
}
