import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/PortalShell";
import { StatusPill } from "@/components/ui";
import { fmtDate, naira, CONTACT } from "@/lib/format";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("payments").select("*, courses(title, slug)").eq("user_id", user.id).order("created_at", { ascending: false });
  return (
    <>
      <PageTitle title="Payments" sub="Your course payments and receipts." />
      {status === "unconfirmed" && (
        <p role="alert" className="rounded-xl bg-[#fdecd9] p-4 text-[#8a4a06]">We couldn&apos;t confirm your payment yet. If you were charged, it will update automatically within a few minutes, or <a className="font-bold underline" href={CONTACT.whatsappLink}>message us on WhatsApp</a> with your reference.</p>
      )}
      {(data ?? []).length === 0 ? <Empty>No payments yet. <Link href="/courses" className="font-semibold text-royal">Browse trainings</Link></Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[600px] text-left">
            <thead><tr className="text-xs tracking-[1px] text-muted">{["COURSE", "AMOUNT", "REFERENCE", "DATE", "STATUS"].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-line text-[15px]">
                  <td className="px-5 py-3.5 font-semibold">{(p.courses as unknown as { title: string })?.title}</td>
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
