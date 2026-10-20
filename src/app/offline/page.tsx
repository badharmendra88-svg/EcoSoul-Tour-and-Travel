import { SceneArt } from "@/components/SceneArt";

// Shown by the service worker when the phone has no connection.
export const metadata = { title: "You're offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <SceneArt scene="mountain" className="h-36 w-64 rounded-2xl" />
      <h1 className="mt-8 text-2xl font-bold text-forest-900">No network in the hills?</h1>
      <p className="mt-2 max-w-sm text-slate-600">
        You&apos;re offline right now. Check your connection and try again — your enquiry hasn&apos;t been lost if it wasn&apos;t sent yet.
      </p>
      {/* Plain anchor so it works without client JS */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="btn-primary mt-6">Try again</a>
    </main>
  );
}
