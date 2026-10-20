import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { AdminShell } from "./AdminShell";
import { Icon } from "./ui";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [newLeads, openQuotes] = await Promise.all([
    db.enquiry.count({ where: { status: "NEW" } }),
    db.quote.count({ where: { status: "DRAFT" } }),
  ]);

  const nav = [
    {
      group: "Sales",
      items: [
        { href: "/admin/", label: "Leads", icon: <Icon name="inbox" className="h-[18px] w-[18px]" />, badge: newLeads },
        { href: "/admin/quotes/", label: "Quotes", icon: <Icon name="quote" className="h-[18px] w-[18px]" />, badge: openQuotes },
        { href: "/admin/rates/", label: "Rate card", icon: <Icon name="calculator" className="h-[18px] w-[18px]" /> },
      ],
    },
    {
      group: "Content",
      items: [
        { href: "/admin/packages/", label: "Packages", icon: <Icon name="package" className="h-[18px] w-[18px]" /> },
        { href: "/admin/destinations/", label: "Destinations", icon: <Icon name="map" className="h-[18px] w-[18px]" /> },
      ],
    },
    {
      group: "Settings",
      items: [{ href: "/admin/settings/", label: "Integrations", icon: <Icon name="settings" className="h-[18px] w-[18px]" /> }],
    },
  ];

  return <AdminShell nav={nav}>{children}</AdminShell>;
}
