import { requireUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { can, roleLabel, type Permission } from "@/lib/permissions";
import { AdminShell } from "./AdminShell";
import { FirstPasswordForm } from "./FirstPasswordForm";
import { Icon } from "./ui";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type NavDef = { href: string; label: string; icon: Parameters<typeof Icon>[0]["name"]; perm: Permission; badge?: number };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();

  // New users / reset passwords must set their own password before anything else
  if (me.mustChangePassword)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f3] px-6 py-16">
        <FirstPasswordForm name={me.name} minLength={MIN_PASSWORD_LENGTH} />
      </main>
    );

  const [newLeads, openQuotes] = await Promise.all([
    db.enquiry.count({ where: { status: "NEW" } }),
    db.quote.count({ where: { status: "DRAFT" } }),
  ]);

  const groups: { group: string; items: NavDef[] }[] = [
    {
      group: "Sales",
      items: [
        { href: "/admin/", label: "Leads", icon: "inbox", perm: "leads.view", badge: newLeads },
        { href: "/admin/quotes/", label: "Quotes", icon: "quote", perm: "quotes.manage", badge: openQuotes },
        { href: "/admin/rates/", label: "Rate card", icon: "calculator", perm: "rates.edit" },
      ],
    },
    {
      group: "Content",
      items: [
        { href: "/admin/packages/", label: "Packages", icon: "package", perm: "content.edit" },
        { href: "/admin/destinations/", label: "Destinations", icon: "map", perm: "content.edit" },
      ],
    },
    {
      group: "Settings",
      items: [
        { href: "/admin/settings/", label: "Integrations", icon: "settings", perm: "settings.manage" },
        { href: "/admin/users/", label: "Users & roles", icon: "users", perm: "users.manage" },
      ],
    },
  ];

  const nav = groups
    .map((g) => ({
      group: g.group,
      items: g.items
        .filter((i) => can(me.role, i.perm))
        .map((i) => ({ href: i.href, label: i.label, badge: i.badge, icon: <Icon name={i.icon} className="h-[18px] w-[18px]" /> })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AdminShell nav={nav} user={{ name: me.name, role: roleLabel(me.role) }}>
      {children}
    </AdminShell>
  );
}
