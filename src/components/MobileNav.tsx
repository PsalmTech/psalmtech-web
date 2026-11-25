"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icons";

export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line">
        <Icon name={open ? "x" : "menu"} />
      </button>
      {open && (
        <div className="absolute inset-x-0 z-50 mt-4 border-b border-line bg-white px-6 pb-6 shadow-lg">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-3.5 font-semibold">{l.label}</Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Link href="/login" className="btn-outline flex-1">Log in</Link>
            <Link href="/quote" className="btn-primary flex-1">Get a Quote</Link>
          </div>
        </div>
      )}
    </div>
  );
}
