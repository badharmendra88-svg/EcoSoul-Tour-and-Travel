"use client";

// Shown instead of the generic Next.js crash screen when a page or a form save
// fails (server unreachable, network dropped, unexpected server error).
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div role="alert" className="panel w-full max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          {offline ? "You're offline" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {offline
            ? "Check your internet connection, then try again. Changes that weren't saved need to be entered again."
            : "The page couldn't be loaded or your changes couldn't be saved. Please try again."}
        </p>
        {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-admin-primary">Try again</button>
          <button type="button" onClick={() => window.location.reload()} className="btn-admin-ghost">Reload page</button>
        </div>
      </div>
    </div>
  );
}
