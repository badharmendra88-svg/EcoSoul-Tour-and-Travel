import Link from "next/link";
import { SceneArt } from "@/components/SceneArt";
import { loginAction } from "../actions";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen bg-[#f5f6f3] lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side */}
      <section className="relative hidden overflow-hidden bg-forest-900 lg:block">
        <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/70 to-forest-900/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-strong shadow-lg">
              <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
                <path d="M5 30 L15 15 L20 22 L26 12 L35 30Z" fill="#0f261b" />
                <circle cx="30" cy="9" r="3" fill="#0f261b" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-semibold">EcoSoul Uttarakhand Travel</span>
              <span className="block text-xs tracking-[0.16em] text-forest-300 uppercase">Admin console</span>
            </span>
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">Devbhoomi, managed beautifully</p>
            <h1 className="mt-3 text-4xl leading-tight font-semibold">Leads, quotes and trips — all in one calm place.</h1>
            <ul className="mt-8 space-y-3 text-sm text-forest-100">
              {["Every enquiry in one queue", "Estimates from your own rate card", "PDF & WhatsApp quotes in a click"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-accent">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-forest-300">Authorised staff only. Activity is logged.</p>
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center px-6 py-16">
        <form action={loginAction} className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to manage enquiries and quotes.</p>

          <div className="mt-8">
            <label htmlFor="password" className="admin-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              autoFocus
              className="admin-input py-3"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
            />
            {error && (
              <p id="login-error" role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">
                {error === "rate" ? "Too many attempts. Please wait a few minutes." : "Incorrect password. Please try again."}
              </p>
            )}
          </div>
          <button type="submit" className="btn-admin-primary mt-6 w-full py-3">Sign in</button>
          <p className="mt-8 text-center text-xs text-slate-400">
            <Link href="/" className="hover:text-forest-700">← Back to website</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
