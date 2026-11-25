import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getStudentData, statusOf } from "@/lib/student";
import { PageTitle, Empty } from "@/components/PortalShell";
import { StatusPill } from "@/components/ui";
import { fmtDate } from "@/lib/format";

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "all" } = await searchParams;
  const { supabase, user } = await requireUser();
  const { courses, assignments, submissions } = await getStudentData(supabase, user.id);
  const rows = assignments.map((a) => {
    const s = submissions.find((x) => x.assignment_id === a.id);
    return { a, s, status: statusOf(a, s), course: courses.find((c) => c.id === a.course_id)?.title };
  });
  const count = (k: string) => rows.filter((r) => r.status === k).length;
  const shown = tab === "all" ? rows : rows.filter((r) => r.status === tab);
  const TABS = [["all", `All (${rows.length})`], ["pending", `To do (${count("pending")})`], ["submitted", `Submitted (${count("submitted")})`], ["graded", `Graded (${count("graded")})`], ["overdue", `Overdue (${count("overdue")})`]];

  return (
    <>
      <PageTitle title="Assignments" sub="Submit your work and keep track of deadlines." />
      <div className="flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <Link key={k} href={`/portal/assignments?tab=${k}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === k ? "bg-navy text-white" : "border border-line bg-white"}`}>{l}</Link>)}
      </div>
      {shown.length === 0 ? <Empty>Nothing here yet.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead><tr className="text-xs tracking-[1px] text-muted">{["ASSESSMENT", "COURSE", "DUE", "STATUS", "SCORE"].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {shown.map(({ a, s, status, course }) => (
                <tr key={a.id} className="border-t border-line text-[15px]">
                  <td className="px-5 py-3.5"><Link href={`/portal/assignments/${a.id}`} className="font-semibold text-royal hover:underline">{a.title}</Link></td>
                  <td className="px-5 py-3.5 text-muted">{course}</td>
                  <td className="px-5 py-3.5 text-muted">{fmtDate(a.due_at, true)}</td>
                  <td className="px-5 py-3.5"><StatusPill status={status} label={status === "pending" ? "To do" : undefined} /></td>
                  <td className="px-5 py-3.5 font-semibold">{s?.score != null ? `${s.score} / ${a.max_score}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
