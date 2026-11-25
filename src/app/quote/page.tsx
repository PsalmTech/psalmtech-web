import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { CONTACT } from "@/lib/format";

export const metadata = { title: "Request a Quote — PsalmTech Solutions" };

const SERVICES = [
  "Research & Publication",
  "Data Analytics & Power BI",
  "Machine Learning & Python",
  "Cybersecurity Research",
  "Training for my team / school",
  "Something else",
];

async function sendQuote(formData: FormData) {
  "use server";
  if (formData.get("website")) redirect("/quote?sent=1"); // spam trap
  const get = (k: string) => String(formData.get(k) ?? "").trim().slice(0, 4000);
  const row = {
    name: get("name"), email: get("email"), phone: get("phone"),
    client_type: get("client_type"), service: get("service"), message: get("message"),
  };
  if (!row.name || !row.email || !row.message) redirect("/quote?error=missing");
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").insert(row);
  if (error) redirect("/quote?error=failed");
  redirect("/quote?sent=1");
}

export default async function QuotePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="bg-page">
        <div className="mx-auto flex max-w-[1100px] flex-wrap gap-10 px-6 py-16">
          <div className="flex flex-[1_1_320px] flex-col gap-4">
            <p className="eyebrow">REQUEST A QUOTE</p>
            <h1 className="h2">Tell us about your project</h1>
            <p className="text-[17px] leading-relaxed text-muted">Share what you need and we&apos;ll reply with a clear plan and quote, usually within 24 hours. Students and researchers get 20% off.</p>
            <div className="mt-2 flex flex-col gap-2 text-[15px]">
              <a href={CONTACT.whatsappLink} className="font-semibold text-royal">Prefer WhatsApp? {CONTACT.whatsapp}</a>
              <span className="text-muted">Email: {CONTACT.email}</span>
            </div>
          </div>
          <div className="card flex-[1_1_480px] p-8">
            {sp.sent ? (
              <div className="flex flex-col gap-3" role="status">
                <h2 className="font-display text-2xl font-extrabold">Thank you! Your request is in.</h2>
                <p className="text-muted">We&apos;ll get back to you shortly. For anything urgent, message us on WhatsApp.</p>
                <a href={CONTACT.whatsappLink} className="btn-primary mt-2 self-start">Chat on WhatsApp</a>
              </div>
            ) : (
              <form action={sendQuote} className="flex flex-col gap-4">
                {sp.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{sp.error === "missing" ? "Please fill in your name, email and message." : "Something went wrong. Please try again or message us on WhatsApp."}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="label">Full name<input name="name" required className="input" autoComplete="name" /></label>
                  <label className="label">Email<input name="email" type="email" required className="input" autoComplete="email" /></label>
                  <label className="label">WhatsApp / phone<input name="phone" type="tel" className="input" autoComplete="tel" /></label>
                  <label className="label">I am a
                    <select name="client_type" className="input"><option>Student</option><option>Researcher</option><option>School</option><option>Business / Organisation</option><option>Other</option></select>
                  </label>
                </div>
                <label className="label">Service
                  <select name="service" defaultValue={sp.service ?? SERVICES[0]} className="input">{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                <label className="label">Project details<textarea name="message" required rows={5} className="input" placeholder="Your topic or goal, the data you have, and your deadline" /></label>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <button className="btn-primary self-start px-8 py-4">Send request</button>
              </form>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
