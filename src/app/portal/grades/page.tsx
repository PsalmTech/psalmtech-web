import { requireUser } from "@/lib/auth";
import { getStudentData, averageGrade, pct } from "@/lib/student";
import { PageTitle, Empty } from "@/components/PortalShell";
import { SectionCard, Bar } from "@/components/ui";
import { letterGrade, fmtDate } from "@/lib/format";
import { Icon } from "@/components/icons";

export default async function GradesPage() {
  const { supabase, user } = await requireUser();
  const { courses, assignments, submissions, progress } = await getStudentData(supabase, user.id);
  if (courses.length === 0) return (<><PageTitle title="Grades & Results" /><Empty>Enrol in a training to see your grades here.</Empty></>);

  return (
    <>
      <PageTitle title="Grades & Results" sub="Your scores, feedback and overall result for each course." />
      {courses.map((c) => {
        const as = assignments.filter((a) => a.course_id === c.id);
        const avg = averageGrade(as, submissions);
        const p = progress[c.id] ?? { done: 0, total: 0 };
        const kinds = ["quiz", "assignment", "project"].map((k) => ({ k, ...averageGrade(as.filter((a) => a.kind === k), submissions), n: as.filter((a) => a.kind === k).length })).filter((x) => x.n > 0);
        const latest = submissions.filter((s) => s.feedback && as.some((a) => a.id === s.assignment_id)).sort((a, b) => (b.graded_at ?? "").localeCompare(a.graded_at ?? ""))[0];
        const finished = p.total > 0 && p.done === p.total && avg.percent != null && avg.percent >= 50;
        return (
          <div key={c.id} className="flex flex-wrap items-start gap-6">
            <SectionCard title={c.title} className="min-w-0 flex-[2_1_520px]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead><tr className="text-xs tracking-[1px] text-muted">{["ASSESSMENT", "TYPE", "SCORE", "GRADE"].map((h) => <th key={h} className="pb-2.5 font-bold">{h}</th>)}</tr></thead>
                  <tbody>
                    {as.map((a) => {
                      const s = submissions.find((x) => x.assignment_id === a.id);
                      const g = s?.score != null ? letterGrade((Number(s.score) / Number(a.max_score)) * 100) : null;
                      return (
                        <tr key={a.id} className="border-t border-line text-[15px]">
                          <td className="py-3 font-semibold">{a.title}</td>
                          <td className="py-3 capitalize text-muted">{a.kind}</td>
                          <td className="py-3 font-semibold">{s?.score != null ? `${s.score} / ${a.max_score}` : s ? "Awaiting grade" : "Not submitted"}</td>
                          <td className="py-3">{g ? <span className="pill bg-ice text-royal">{g}</span> : "—"}</td>
                        </tr>
                      );
                    })}
                    {as.length === 0 && <tr><td colSpan={4} className="py-3 text-muted">No assessments yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </SectionCard>
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <SectionCard title="Results summary">
                <div className="flex items-center gap-5">
                  <svg role="img" aria-label={`Overall score ${avg.percent ?? 0} percent`} width="112" height="112" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e5f3fa" strokeWidth="4.5" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#2e4493" strokeWidth="4.5" strokeDasharray={`${avg.percent ?? 0} ${100 - (avg.percent ?? 0)}`} strokeDashoffset="25" strokeLinecap="round" />
                    <text x="21" y="23.5" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="8" fill="#131a2f">{avg.percent == null ? "—" : `${avg.percent}%`}</text>
                  </svg>
                  <div className="flex flex-col gap-1"><span className="text-[13px] font-semibold text-muted">Current grade</span><span className="font-display text-4xl font-extrabold text-royal">{avg.percent == null ? "—" : letterGrade(avg.percent)}</span><span className="text-[13px] text-muted">Pass mark: 50%</span></div>
                </div>
                {kinds.map((x) => (
                  <div key={x.k} className="flex flex-col gap-1.5"><div className="flex justify-between text-sm"><span className="font-semibold capitalize">{x.k}s</span><span className="font-bold">{x.percent == null ? "Not yet" : `${x.percent}%`}</span></div><Bar value={x.percent ?? 0} className="bg-royal" /></div>
                ))}
                <div className="flex flex-col gap-1.5"><div className="flex justify-between text-sm"><span className="font-semibold">Lessons completed</span><span className="font-bold">{pct(p.done, p.total)}%</span></div><Bar value={pct(p.done, p.total)} /></div>
              </SectionCard>
              {latest && <SectionCard title="Latest feedback"><p className="whitespace-pre-line text-[15px] leading-relaxed">{latest.feedback}</p><span className="text-xs text-muted">{as.find((a) => a.id === latest.assignment_id)?.title} · {fmtDate(latest.graded_at)}</span></SectionCard>}
              <SectionCard title="Certificate">
                <div className="flex items-center gap-3"><Icon name="award" size={26} className="text-royal" />
                  <span className="text-sm leading-relaxed">{finished ? "Congratulations, you've completed this course! Your instructor will issue your certificate." : "Finish all lessons and score 50% or more to earn your certificate of completion."}</span></div>
              </SectionCard>
            </div>
          </div>
        );
      })}
    </>
  );
}
