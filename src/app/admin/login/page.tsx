import Link from "next/link";
import { redirect } from "next/navigation";
import { FullLogo, Logo } from "@/components/Logo";
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
    <main className="grid min-h-screen bg-[#f6f7f2] lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side */}
      <section className="relative hidden overflow-hidden bg-forest-900 lg:block">
        <SceneArt scene="snow" className="absolute inset-0 h-full w-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/70 to-forest-900/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <Logo light />
            <span className="mt-2 block text-xs font-semibold tracking-[0.18em] text-accent uppercase">Admin console</span>
          </div>
          <div className="max-w-md">
            <p className="tagline text-2xl">Devbhoomi · Uttarakhand</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight font-bold">Leads, quotes and trips — all in one calm place.</h1>
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
            <FullLogo width={190} className="mx-auto mb-2" priority />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-forest-600 uppercase">First-time setup</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-forest-900">Create the Super Admin</h2>
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
            <FullLogo width={220} className="mx-auto mb-8" priority />
            <h2 className="font-serif text-2xl font-bold text-forest-900">Welcome back</h2>
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
