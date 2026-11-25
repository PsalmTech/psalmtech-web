import Link from "next/link";
import { Icon, Logo } from "./icons";
import { CONTACT } from "@/lib/format";
import MobileNav from "./MobileNav";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/courses", label: "Training" },
  { href: "/#about", label: "About" },
  { href: "/quote", label: "Contact" },
];

export default function SiteHeader({ announcement }: { announcement?: string }) {
  const msg = announcement ?? "Data Analytics with Power BI: hands-on training";
  return (
    <header>
      <Link href="/courses/data-analytics-power-bi" aria-label={`Now enrolling: ${msg}. 20% off for students and researchers.`}
        className="block overflow-hidden whitespace-nowrap bg-cyan text-navy">
        <div className="marquee inline-flex py-2.5 font-display text-sm font-bold">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} aria-hidden={i > 0} className="inline-flex items-center gap-7 pr-7">
              <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs tracking-[1.5px] text-white">NOW ENROLLING</span>
              <span>{msg}</span><span>✦</span>
              <span>20% off for students &amp; researchers</span><span>✦</span>
              <span>Register now and learn from your own dashboard →</span><span>✦</span>
            </span>
          ))}
        </div>
      </Link>

      <div className="bg-navy text-sm text-soft">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={CONTACT.whatsappLink} className="flex items-center gap-2 hover:text-white"><Icon name="chat" size={16} className="text-cyan" />{CONTACT.whatsapp}</a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-white"><Icon name="mail" size={16} className="text-cyan" />{CONTACT.email}</a>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-semibold text-white">20% off for students &amp; researchers</span>
            <a href={CONTACT.github} className="hover:text-white">GitHub</a>
            <a href={CONTACT.linkedin} className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-white">
        <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="PsalmTech Solutions home"><Logo /></Link>
          <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] font-semibold lg:flex">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-royal">{n.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="px-4 py-3 text-[15px] font-semibold text-royal">Log in</Link>
            <Link href="/quote" className="btn-primary">Request a Quote</Link>
          </div>
          <MobileNav links={NAV} />
        </div>
      </div>
    </header>
  );
}
