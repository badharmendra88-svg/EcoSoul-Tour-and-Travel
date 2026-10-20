import { requireUser } from "@/lib/admin-auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { roleLabel, roles, type Role } from "@/lib/permissions";
import { changeOwnPasswordAction } from "../../actions";
import { Avatar, Icon, PageHeader, Panel } from "../ui";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireUser();
  const { saved, error } = await searchParams;

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Account" title="My account" subtitle="Your profile and password." />

      <div className="space-y-6">
        <Panel>
          <div className="flex items-center gap-4">
            <Avatar name={me.name} size="lg" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{me.name}</p>
              <p className="text-sm text-slate-500">{me.email}</p>
              <p className="mt-1 text-sm text-slate-600">
                <strong>{roleLabel(me.role)}</strong> — {roles[me.role as Role]?.description}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Change password" icon="settings" description="Changing your password signs you out on all other devices.">
          <form action={changeOwnPasswordAction} className="space-y-4">
            {error && (
              <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800 ring-1 ring-rose-100">
                <Icon name="bell" /> {error}
              </p>
            )}
            {saved && (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-100">
                <Icon name="check" /> Password updated.
              </p>
            )}
            <label className="block">
              <span className="admin-label">Current password</span>
              <input name="current" type="password" required autoComplete="current-password" className="admin-input" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="admin-label">New password</span>
                <input name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className="admin-input" />
                <span className="mt-1.5 block text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters, letters and numbers.</span>
              </label>
              <label className="block">
                <span className="admin-label">Confirm new password</span>
                <input name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className="admin-input" />
              </label>
            </div>
            <button className="btn-admin-primary">Update password</button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
