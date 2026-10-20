import { Logo } from "@/components/Logo";
import { loginAction } from "../actions";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-900 px-4">
      <form action={loginAction} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Logo />
        <h1 className="mt-6 text-xl font-semibold text-forest-900">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Authorised staff only.</p>
        <label htmlFor="password" className="label mt-6">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" autoFocus />
        {error && (
          <p role="alert" className="field-error">
            {error === "rate" ? "Too many attempts. Please wait a few minutes." : "Incorrect password."}
          </p>
        )}
        <button type="submit" className="btn-secondary mt-6 w-full">Sign in</button>
      </form>
    </main>
  );
}
