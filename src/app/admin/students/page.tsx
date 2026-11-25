import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageTitle } from "@/components/PortalShell";
import { SectionCard, StatusPill } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { enrolStudent, setEnrolmentStatus } from "../actions";

type P = { id: string; full_name: string | null; phone: string | null; user_type: string | null; created_at: string; enrollments: { id: string; status: string; courses: { title: string } | null }[] };

export default async function Students({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase.from("profiles").select("id, full_name, phone, user_type, created_at, enrollments(id, status, courses(title))").eq("role", "student").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.ilike("full_name", `%${q}%`);
  const { data } = await query;
  const students = (data as unknown as P[]) ?? [];
  const { data: courses } = await supabase.from("courses").select("id, title").order("title");

  return (
    <>
      <PageTitle title="Students" sub={`${students.length} shown`} action={
        <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search students" className="input w-56" /><button className="btn-outline">Search</button></form>} />

      <SectionCard title="Enrol a student manually (e.g. paid by bank transfer)">
        <form action={enrolStudent} className="grid gap-3 md:grid-cols-[2fr_2fr_1fr_auto] md:items-end">
          <label className="label">Student<select name="user_id" required className="input">{students.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.id.slice(0, 8)}</option>)}</select></label>
          <label className="label">Course<select name="course_id" required className="input">{(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label className="label">Amount paid (₦)<input name="amount_naira" type="number" min="0" className="input" /></label>
          <button className="btn-primary">Enrol</button>
        </form>
      </SectionCard>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead><tr className="text-xs tracking-[1px] text-muted">{["NAME", "WHATSAPP", "TYPE", "JOINED", "ENROLMENTS"].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}</tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line align-top text-[15px]">
                <td className="px-5 py-3.5 font-semibold"><Link href={`/admin/messages/${s.id}`} className="text-royal hover:underline">{s.full_name || "—"}</Link></td>
                <td className="px-5 py-3.5">{s.phone ? <a className="text-royal" href={`https://wa.me/${s.phone.replace(/\D/g, "").replace(/^0/, "234")}`}>{s.phone}</a> : "—"}</td>
                <td className="px-5 py-3.5 capitalize text-muted">{s.user_type}</td>
                <td className="px-5 py-3.5 text-muted">{fmtDate(s.created_at)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-2">
                    {s.enrollments.length === 0 && <span className="text-muted">None</span>}
                    {s.enrollments.map((e) => (
                      <form key={e.id} action={setEnrolmentStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={e.id} />
                        <span className="text-sm">{e.courses?.title}</span><StatusPill status={e.status} />
                        <input type="hidden" name="status" value={e.status === "active" ? "cancelled" : "active"} />
                        <button className="text-xs font-semibold text-royal hover:underline">{e.status === "active" ? "Remove access" : "Restore"}</button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
