import { requireAdmin } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/PortalShell";
import { StatusPill } from "@/components/ui";
import { fmtDate, naira } from "@/lib/format";

export default async function Payments() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("payments").select("*, profiles(full_name), courses(title)").order("created_at", { ascending: false }).limit(300);
  const total = (data ?? []).filter((p) => p.status === "success").reduce((n, p) => n + p.amount_kobo, 0);
  return (
    <>
      <PageTitle title="Payments" sub={`Total received: ${naira(total)} (Paystack). Manual/bank-transfer enrolments are listed under Students.`} />
      {(data ?? []).length === 0 ? <Empty>No payments yet.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left">
            <thead><tr className="text-xs tracking-[1px] text-muted">{["STUDENT", "COURSE", "AMOUNT", "REFERENCE", "DATE", "STATUS"].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-line text-[15px]">
                  <td className="px-5 py-3.5 font-semibold">{(p.profiles as unknown as { full_name: string | null } | null)?.full_name}</td>
                  <td className="px-5 py-3.5">{(p.courses as unknown as { title: string } | null)?.title}</td>
                  <td className="px-5 py-3.5">{naira(p.amount_kobo)}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted">{p.reference}</td>
                  <td className="px-5 py-3.5 text-muted">{fmtDate(p.paid_at ?? p.created_at, true)}</td>
                  <td className="px-5 py-3.5"><StatusPill status={p.status} label={p.status === "success" ? "Paid" : undefined} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
