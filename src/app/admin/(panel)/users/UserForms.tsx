"use client";

import { useActionState, useState } from "react";
import { roles } from "@/lib/permissions";
import { createUserAction, resetPasswordAction, updateUserAction, type UserFormState } from "../../users-actions";
import { Icon } from "../ui";

function TempPasswordNotice({ state }: { state: UserFormState }) {
  const [copied, setCopied] = useState(false);
  if (!state?.tempPassword) return null;
  return (
    <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
      <p className="font-medium">Temporary password for {state.email}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="rounded-lg bg-white px-3 py-2 font-mono text-base tracking-wide ring-1 ring-emerald-200">{state.tempPassword}</code>
        <button
          type="button"
          className="btn-admin-ghost px-3 py-2"
          onClick={() => navigator.clipboard?.writeText(state.tempPassword!).then(() => setCopied(true))}
        >
          {copied ? <Icon name="check" /> : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-emerald-800">
        Shown only once. Share it privately — the user must set a new password at first sign-in.
      </p>
    </div>
  );
}

function RoleSelect({ name = "role", defaultValue, disabled }: { name?: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <select name={name} defaultValue={defaultValue ?? "MANAGER"} className="admin-input" disabled={disabled} aria-label="Role">
      {Object.entries(roles).map(([id, r]) => (
        <option key={id} value={id}>{r.label}</option>
      ))}
    </select>
  );
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_200px_auto] lg:items-end">
        <label className="block"><span className="admin-label">Full name</span><input name="name" required className="admin-input" autoComplete="off" /></label>
        <label className="block"><span className="admin-label">Email (login)</span><input name="email" type="email" required className="admin-input" autoComplete="off" /></label>
        <label className="block"><span className="admin-label">Role</span><RoleSelect /></label>
        <button className="btn-admin-primary" disabled={pending}><Icon name="plus" /> {pending ? "Creating…" : "Create user"}</button>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800 ring-1 ring-rose-100">{state.error}</p>}
      <TempPasswordNotice state={state} />
    </form>
  );
}

export function EditUserForm({
  user,
  isSelf,
}: {
  user: { id: string; name: string; role: string; active: boolean };
  isSelf: boolean;
}) {
  const [state, action, pending] = useActionState(updateUserAction, null);
  const [resetState, resetAction, resetting] = useActionState(resetPasswordAction, null);
  return (
    <div className="space-y-3">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_180px_auto_auto] sm:items-center">
        <input type="hidden" name="id" value={user.id} />
        <input name="name" defaultValue={user.name} className="admin-input" aria-label="Name" />
        <RoleSelect defaultValue={user.role} disabled={isSelf} />
        {isSelf && <input type="hidden" name="role" value={user.role} />}
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={user.active} disabled={isSelf} className="h-4 w-4" /> Active
          {isSelf && <input type="hidden" name="active" value="on" />}
        </label>
        <button className="btn-admin-ghost" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </form>
      {!isSelf && (
        <form action={resetAction}>
          <input type="hidden" name="id" value={user.id} />
          <button className="text-sm font-medium text-forest-700 hover:underline" disabled={resetting}>
            {resetting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
      {(state?.error || resetState?.error) && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800 ring-1 ring-rose-100">{state?.error || resetState?.error}</p>
      )}
      {state?.ok && <p role="status" className="text-sm text-emerald-700">Saved.</p>}
      <TempPasswordNotice state={resetState} />
    </div>
  );
}
