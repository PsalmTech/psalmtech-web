import PortalShell from "@/components/PortalShell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: "grid", exact: true },
  { href: "/portal/courses", label: "My Courses", icon: "book" },
  { href: "/portal/assignments", label: "Assignments", icon: "clip" },
  { href: "/portal/grades", label: "Grades & Results", icon: "award" },
  { href: "/portal/messages", label: "Messages", icon: "chat" },
  { href: "/portal/payments", label: "Payments", icon: "card" },
  { href: "/portal/profile", label: "Profile", icon: "user" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireUser();
  const isAdmin = profile?.role === "admin";
  return (
    <PortalShell nav={NAV} name={profile?.full_name || user.email || "Student"} role={isAdmin ? "Instructor" : "Student"}
      switchLink={isAdmin ? { href: "/admin", label: "Admin dashboard" } : undefined}>
      {children}
    </PortalShell>
  );
}
