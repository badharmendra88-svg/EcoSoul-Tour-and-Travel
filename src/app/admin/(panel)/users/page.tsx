import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { permissions, roles, type Role } from "@/lib/permissions";
import { Avatar, Badge, PageHeader, Panel, timeAgo, type Tone } from "../ui";
import { CreateUserForm, EditUserForm } from "./UserForms";

const roleTone: Record<string, Tone> = { SUPER_ADMIN: "violet", ADMIN: "indigo", MANAGER: "sky" };

const permissionLabels: Record<keyof typeof permissions, string> = {
  "leads.view": "View leads",
  "leads.edit": "Update leads",
  "leads.export": "Export leads (CSV)",
  "quotes.manage": "Create & send quotes",
  "rates.edit": "Edit rate card",
  "content.edit": "Edit packages & destinations",
  "settings.manage": "Integrations & settings",
  "drivers.view": "View driver partners",
  "drivers.manage": "Verify & manage drivers",
  "users.manage": "Manage users",
};

export default async function UsersPage() {
  const me = await requireUser("users.manage");
  const users = await db.adminUser.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { name: "asc" }] });

  return (
    <>
      <PageHeader eyebrow="Settings" title="Users & roles" subtitle="Only Super Admins can create users, change roles or deactivate accounts." />

      <div className="space-y-8">
        <Panel title="Add a user" icon="plus" description="A temporary password is generated — the user sets their own at first sign-in.">
          <CreateUserForm />
        </Panel>

        <Panel title="Team" icon="users" description={`${users.filter((u) => u.active).length} active of ${users.length}`} bodyClassName="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className={`grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[280px_1fr] ${u.active ? "" : "bg-slate-50/70"}`}>
              <div className="flex items-start gap-3">
                <Avatar name={u.name} />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {u.name} {u.id === me.id && <span className="text-xs text-slate-500">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{u.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={roleTone[u.role] ?? "slate"} dot={false}>{roles[u.role as Role]?.label ?? u.role}</Badge>
                    {!u.active && <Badge tone="rose">Deactivated</Badge>}
                    {u.mustChangePassword && <Badge tone="amber">Temp password</Badge>}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400" title={u.lastLoginAt ? formatDateTime(u.lastLoginAt) : undefined}>
                    {u.lastLoginAt ? `Last sign-in ${timeAgo(u.lastLoginAt)}` : "Never signed in"}
                  </p>
                </div>
              </div>
              <EditUserForm user={{ id: u.id, name: u.name, role: u.role, active: u.active }} isSelf={u.id === me.id} />
            </div>
          ))}
        </Panel>

        <Panel title="What each role can do" icon="settings">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr>
                  <th className="admin-th pl-0">Permission</th>
                  {Object.values(roles).map((r) => (
                    <th key={r.label} className="admin-th text-center">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(permissions) as (keyof typeof permissions)[]).map((p) => (
                  <tr key={p}>
                    <td className="py-3 pr-4 text-slate-700">{permissionLabels[p]}</td>
                    {(Object.keys(roles) as Role[]).map((r) => (
                      <td key={r} className="py-3 text-center">
                        {(permissions[p] as readonly string[]).includes(r) ? (
                          <span className="text-emerald-600" aria-label="Allowed">✓</span>
                        ) : (
                          <span className="text-slate-300" aria-label="Not allowed">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
