import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageTitle } from "@/components/PortalShell";
import { Stat, SectionCard, StatusPill } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDate, naira, initials } from "@/lib/format";

export default async function AdminHome() {
  const { supabase, profile } = await requireAdmin();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const sixAgo = new Date(monthStart); sixAgo.setMonth(sixAgo.getMonth() - 5);

  const [students, enrolments, toGrade, newQuotes, paid, recentEnr, recentSubs, quotes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("submissions").select("id", { count: "exact", head: true }).is("score", null),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("payments").select("amount_kobo, paid_at").eq("status", "success").gte("paid_at", sixAgo.toISOString()),
    supabase.from("enrollments").select("created_at, status, profiles(full_name), courses(title)").order("created_at", { ascending: false }).limit(5),
    supabase.from("submissions").select("id, submitted_at, profiles(full_name), assignments(title)").is("score", null).order("submitted_at").limit(4),
    supabase.from("quotes").select("id, name, service, client_type, status, created_at").order("created_at", { ascending: false }).limit(4),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(sixAgo); d.setMonth(d.getMonth() + i); return d; });
  const totals = months.map((d) => (paid.data ?? []).filter((p) => { const x = new Date(p.paid_at!); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }).reduce((n, p) => n + p.amount_kobo, 0));
  const max = Math.max(...totals, 1);
  const thisMonth = totals[5]!;

  return (
    <>
      <PageTitle title={`Hello, ${(profile?.full_name || "Samuel").split(" ")[0]}`} sub="Here's what's happening across PsalmTech." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon="users" label="Students" value={students.count ?? 0} color="bg-royal" />
        <Stat icon="book" label="Active enrolments" value={enrolments.count ?? 0} color="bg-cyan" />
        <Stat icon="card" label="Revenue this month" value={naira(thisMonth)} sub="via Paystack" color="bg-[#1f9d6b]" />
        <Stat icon="clip" label="Waiting to grade" value={toGrade.count ?? 0} color="bg-[#e07a1f]" />
        <Stat icon="quote" label="New quote requests" value={newQuotes.count ?? 0} color="bg-navy" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["/admin/courses", "book", "Manage courses & lessons"], ["/admin/submissions", "clip", "Grade submissions"], ["/admin/students", "users", "Enrol a student manually"], ["/admin/messages", "chat", "Reply to messages"]].map(([h, i, t]) => (
          <Link key={h} href={h} className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-4 text-sm font-semibold hover:border-cyan"><Icon name={i} className="text-royal" />{t}</Link>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
          <SectionCard title="Revenue (last 6 months)" action={<Link href="/admin/payments" className="text-sm font-semibold text-royal">View payments</Link>}>
            <div className="flex h-48 items-end gap-4">
              {months.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted">{totals[i] ? naira(totals[i]) : ""}</span>
                  <div className={`w-full max-w-12 rounded-t-md ${i === 5 ? "bg-cyan" : "bg-royal"}`} style={{ height: `${Math.max(4, (totals[i]! / max) * 140)}px` }} />
                  <span className="text-xs text-muted">{d.toLocaleString("en", { month: "short" })}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent enrolments" action={<Link href="/admin/students" className="text-sm font-semibold text-royal">All students</Link>}>
            {(recentEnr.data ?? []).length === 0 ? <p className="text-muted">No enrolments yet.</p> : (recentEnr.data ?? []).map((e, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-2.5 first:border-0">
                <span className="font-semibold">{(e.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "Student"}</span>
                <span className="text-sm text-muted">{(e.courses as unknown as { title: string } | null)?.title}</span>
                <span className="text-sm text-muted">{fmtDate(e.created_at)}</span><StatusPill status={e.status} />
              </div>
            ))}
          </SectionCard>
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          <SectionCard title="Submissions to grade" action={<Link href="/admin/submissions" className="text-sm font-semibold text-royal">See all</Link>}>
            {(recentSubs.data ?? []).length === 0 ? <p className="text-muted">All caught up. 🎉</p> : (recentSubs.data ?? []).map((s) => {
              const n = (s.profiles as unknown as { full_name: string | null } | null)?.full_name;
              return (
                <div key={s.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ice text-xs font-bold text-royal">{initials(n)}</span>
                  <span className="flex min-w-0 flex-1 flex-col"><span className="text-sm font-semibold">{n}</span><span className="text-xs text-muted">{(s.assignments as unknown as { title: string } | null)?.title} · {fmtDate(s.submitted_at)}</span></span>
                  <Link href={`/admin/submissions#s-${s.id}`} className="btn-dark px-4 py-2 text-xs">Grade</Link>
                </div>
              );
            })}
          </SectionCard>
          <SectionCard title="Quote requests" action={<Link href="/admin/quotes" className="text-sm font-semibold text-royal">Open inbox</Link>}>
            {(quotes.data ?? []).length === 0 ? <p className="text-muted">No requests yet.</p> : (quotes.data ?? []).map((q) => (
              <div key={q.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
                <Icon name="quote" className="text-royal" /><span className="flex min-w-0 flex-1 flex-col"><span className="text-sm font-semibold">{q.service}</span><span className="text-xs text-muted">{q.name} · {q.client_type}</span></span><StatusPill status={q.status} />
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
