import Link from "next/link";
import { CONTACT } from "@/lib/format";
import { Icon } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-soft">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 pb-8 pt-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3.5">
          <span className="font-display text-xl font-extrabold tracking-[3px] text-white">PSALMTECH</span>
          <p className="text-[15px] leading-relaxed">Data analytics, machine learning and research support you can trust.</p>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <span className="font-display font-bold text-white">Services</span>
          <Link href="/quote?service=Research%20%26%20Publication" className="hover:text-white">Research &amp; Publication</Link>
          <Link href="/quote?service=Data%20Analytics%20%26%20Power%20BI" className="hover:text-white">Data Analytics &amp; Power BI</Link>
          <Link href="/quote?service=Machine%20Learning%20%26%20Python" className="hover:text-white">Machine Learning &amp; Python</Link>
          <Link href="/quote?service=Cybersecurity%20Research" className="hover:text-white">Cybersecurity Research</Link>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <span className="font-display font-bold text-white">Academy</span>
          <Link href="/courses" className="hover:text-white">All trainings</Link>
          <Link href="/login" className="hover:text-white">Student login</Link>
          <Link href="/signup" className="hover:text-white">Create account</Link>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <span className="font-display font-bold text-white">Contact</span>
          <a href={CONTACT.whatsappLink} className="hover:text-white">WhatsApp: {CONTACT.whatsapp}</a>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-white">Call: {CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a>
          <a href={CONTACT.github} className="hover:text-white">github.com/PsalmTech</a>
        </div>
      </div>
      <div className="border-t border-[#2a3350]">
        <div className="mx-auto max-w-[1200px] px-6 py-4 text-sm">© {new Date().getFullYear()} PsalmTech Solutions. All rights reserved.</div>
      </div>
      <a href={CONTACT.whatsappLink} aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
        <Icon name="chat" size={28} strokeWidth={2.2} />
      </a>
    </footer>
  );
}
