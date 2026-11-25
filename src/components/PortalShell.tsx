import Link from "next/link";
import { Logo } from "./icons";
import NavLinks, { type NavItem } from "./NavLinks";
import { initials } from "@/lib/format";

export default function PortalShell({
  nav, name, role, children, switchLink,
}: { nav: NavItem[]; name: string; role: string; children: React.ReactNode; switchLink?: { href: string; label: string } }) {
  return (
    <div className="flex min-h-screen flex-col bg-page lg:flex-row">
      <aside className="flex flex-col gap-5 bg-navy px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-[264px] lg:shrink-0 lg:gap-7 lg:py-6">
        <Link href="/" className="px-2" aria-label="PsalmTech home"><Logo dark sub="ACADEMY" /></Link>
        <NavLinks items={nav} />
        <div className="mt-auto hidden flex-col gap-3.5 border-t border-[#2a3350] px-2 pt-4 lg:flex">
          {switchLink && <Link href={switchLink.href} className="text-sm font-semibold text-cyan hover:text-white">{switchLink.label} →</Link>}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan text-sm font-bold text-navy">{initials(name)}</span>
            <span className="flex min-w-0 flex-col"><span className="truncate text-sm font-semibold text-white">{name}</span><span className="text-xs text-[#9fb0d8]">{role}</span></span>
          </div>
          <form action="/auth/signout" method="post"><button className="text-sm text-[#9fb0d8] hover:text-white">Log out</button></form>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-5 md:p-8">
        <div className="flex items-center justify-end gap-3 lg:hidden">
          {switchLink && <Link href={switchLink.href} className="text-sm font-semibold text-royal">{switchLink.label}</Link>}
          <form action="/auth/signout" method="post"><button className="text-sm font-semibold text-muted">Log out</button></form>
        </div>
        {children}
      </main>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1"><h1 className="font-display text-2xl font-extrabold md:text-[28px]">{title}</h1>{sub && <p className="text-[15px] text-muted">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#cfd8ea] bg-white p-8 text-center text-muted">{children}</div>;
}
