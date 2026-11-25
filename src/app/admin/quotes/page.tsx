import { requireAdmin } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/PortalShell";
import { StatusPill } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { setQuoteStatus } from "../actions";

export default async function Quotes() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageTitle title="Quote requests" sub="Requests sent from the website's quote form." />
      {(data ?? []).length === 0 ? <Empty>No quote requests yet.</Empty> : (data ?? []).map((q) => {
        const wa = q.phone ? `https://wa.me/${q.phone.replace(/\D/g, "").replace(/^0/, "234")}?text=${encodeURIComponent(`Hello ${q.name}, this is Samuel from PsalmTech Solutions about your ${q.service} request.`)}` : null;
        return (
          <section key={q.id} className="flex flex-wrap gap-6 rounded-2xl border border-line bg-white p-6">
            <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3"><span className="font-display text-lg font-bold">{q.service}</span><StatusPill status={q.status} /></div>
              <span className="text-sm text-muted">{q.name} · {q.client_type} · {fmtDate(q.created_at, true)}</span>
              <p className="whitespace-pre-line leading-relaxed">{q.message}</p>
            </div>
            <div className="flex flex-[1_1_220px] flex-col gap-2.5">
              {wa && <a href={wa} className="btn-primary">Reply on WhatsApp</a>}
              <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Your ${q.service} request — PsalmTech Solutions`)}`} className="btn-outline">Reply by email</a>
              <form action={setQuoteStatus} className="flex gap-2">
                <input type="hidden" name="id" value={q.id} />
                <select name="status" defaultValue={q.status} aria-label="Status" className="input py-2"><option value="new">New</option><option value="replied">Replied</option><option value="closed">Closed</option></select>
                <button className="btn-dark">Update</button>
              </form>
            </div>
          </section>
        );
      })}
    </>
  );
}
