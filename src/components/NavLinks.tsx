"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

export type NavItem = { href: string; label: string; icon: string; exact?: boolean };

export default function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Portal" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map((it) => {
        const active = it.exact ? path === it.href : path === it.href || path.startsWith(it.href + "/");
        return (
          <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition ${active ? "bg-royal text-white" : "text-soft hover:bg-[#1d2645] hover:text-white"}`}>
            <Icon name={it.icon} size={19} className={active ? "text-white" : "text-[#9fb0d8]"} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
