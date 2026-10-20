"use client";

import { useActionState } from "react";
import { setFirstPasswordAction } from "../actions";

export function FirstPasswordForm({ name, minLength }: { name: string; minLength: number }) {
  const [error, action, pending] = useActionState(setFirstPasswordAction, null);
  return (
    <form action={action} className="panel w-full max-w-md space-y-4 p-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-forest-600 uppercase">Welcome, {name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Set your own password</h1>
        <p className="mt-1.5 text-sm text-slate-500">You signed in with a temporary password. Choose a new one to continue.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>}
      <label className="block"><span className="admin-label">Temporary password</span><input name="current" type="password" required autoComplete="current-password" className="admin-input py-3" /></label>
      <label className="block">
        <span className="admin-label">New password</span>
        <input name="password" type="password" required minLength={minLength} autoComplete="new-password" className="admin-input py-3" />
        <span className="mt-1.5 block text-xs text-slate-500">At least {minLength} characters, letters and numbers.</span>
      </label>
      <label className="block"><span className="admin-label">Confirm new password</span><input name="confirm" type="password" required minLength={minLength} autoComplete="new-password" className="admin-input py-3" /></label>
      <button className="btn-admin-primary w-full py-3" disabled={pending}>{pending ? "Saving…" : "Save and continue"}</button>
    </form>
  );
}
