import PortalShell from "@/components/PortalShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview", icon: "grid", exact: true },
  { href: "/admin/courses", label: "Courses", icon: "book" },
  { href: "/admin/students", label: "Students", icon: "users" },
  { href: "/admin/submissions", label: "To Grade", icon: "clip" },
  { href: "/admin/payments", label: "Payments", icon: "card" },
  { href: "/admin/quotes", label: "Quote Requests", icon: "quote" },
  { href: "/admin/messages", label: "Messages", icon: "chat" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireAdmin();
  return (
    <PortalShell nav={NAV} name={profile?.full_name || user.email || "Admin"} role="Instructor · Admin" switchLink={{ href: "/portal", label: "Student view" }}>
      {children}
    </PortalShell>
  );
}
