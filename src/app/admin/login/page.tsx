import Link from "next/link";
import { redirect } from "next/navigation";
import { SceneArt } from "@/components/SceneArt";
import { getCurrentUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { loginAction, setupSuperAdminAction } from "../actions";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  "1": "Incorrect email or password.",
  rate: "Too many attempts. Please wait a few minutes.",
  inactive: "This account has been deactivated. Contact your Super Admin.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string; setupError?: string }> }) {
  if (await getCurrentUser()) redirect("/admin/");
  const { error, email, setupError } = await searchParams;
  const needsSetup = (await db.adminUser.count()) === 0;

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
              {["Every enquiry in one queue", "Estimates from your own rate card", "Role-based access for your team"].map((t) => (
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
        {needsSetup ? (
          <form action={setupSuperAdminAction} className="w-full max-w-sm space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-forest-600 uppercase">First-time setup</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Create the Super Admin</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter the setup key (the <code>ADMIN_PASSWORD</code> value from the server&apos;s <code>.env</code>) and your details.
              </p>
            </div>
            {setupError && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{setupError}</p>}
            <label className="block"><span className="admin-label">Setup key</span><input name="setupKey" type="password" required className="admin-input py-3" autoComplete="off" /></label>
            <label className="block"><span className="admin-label">Your name</span><input name="name" required className="admin-input py-3" autoComplete="name" /></label>
            <label className="block"><span className="admin-label">Email (your login)</span><input name="email" type="email" required className="admin-input py-3" autoComplete="email" /></label>
            <label className="block">
              <span className="admin-label">Password</span>
              <input name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} className="admin-input py-3" autoComplete="new-password" />
              <span className="mt-1.5 block text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters, letters and numbers.</span>
            </label>
            <label className="block"><span className="admin-label">Confirm password</span><input name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} className="admin-input py-3" autoComplete="new-password" /></label>
            <button type="submit" className="btn-admin-primary w-full py-3">Create account & sign in</button>
          </form>
        ) : (
          <form action={loginAction} className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">Sign in with your work email.</p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="admin-label">Email</span>
                <input id="email" name="email" type="email" required autoComplete="username" defaultValue={email} autoFocus={!email} className="admin-input py-3" />
              </label>
              <label className="block">
                <span className="admin-label">Password</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  autoFocus={!!email}
                  className="admin-input py-3"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </label>
              {error && (
                <p id="login-error" role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">
                  {errors[error] ?? errors["1"]}
                </p>
              )}
            </div>
            <button type="submit" className="btn-admin-primary mt-6 w-full py-3">Sign in</button>
            <p className="mt-4 text-center text-xs text-slate-500">Forgot your password? Ask your Super Admin to reset it.</p>
            <p className="mt-6 text-center text-xs text-slate-400">
              <Link href="/" className="inline-block py-2 hover:text-forest-700">← Back to website</Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
