import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getStudentData, pct, averageGrade } from "@/lib/student";
import { PageTitle, Empty } from "@/components/PortalShell";
import { Stat, Bar, SectionCard, StatusPill } from "@/components/ui";
import { fmtDate, letterGrade } from "@/lib/format";

export default async function Dashboard() {
  const { supabase, user, profile } = await requireUser();
  const { courses, assignments, submissions, progress } = await getStudentData(supabase, user.id);
  const first = (profile?.full_name || "").split(" ")[0] || "there";
  const now = Date.now();
  const submittedIds = new Set(submissions.map((s) => s.assignment_id));
  const due = assignments.filter((a) => !submittedIds.has(a.id) && a.due_at && new Date(a.due_at).getTime() > now);
  const avg = averageGrade(assignments, submissions);
  const graded = submissions.filter((s) => s.score != null).sort((a, b) => (b.graded_at ?? "").localeCompare(a.graded_at ?? "")).slice(0, 4);
  const ids = courses.map((c) => c.id);
  const { data: news } = ids.length ? await supabase.from("announcements").select("*").in("course_id", ids).order("created_at", { ascending: false }).limit(3) : { data: [] };
  const { data: lastMsg } = await supabase.from("messages").select("*").eq("student_id", user.id).neq("sender_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const main = courses[0];
  const mainProg = main ? progress[main.id] ?? { done: 0, total: 0 } : null;

  return (
    <>
      <PageTitle title={`Welcome back, ${first}`} sub="Here's where you are in your learning." />
      {profile?.role === "admin" && <Link href="/admin" className="rounded-xl bg-ice p-4 text-sm font-semibold text-royal">You&apos;re an instructor. Open the admin dashboard →</Link>}

      {courses.length === 0 ? (
        <Empty>
          <p className="mb-4 text-lg font-semibold text-navy">You&apos;re not enrolled in a training yet.</p>
          <Link href="/courses" className="btn-primary">Browse trainings</Link>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon="book" label="Courses enrolled" value={courses.length} sub={main?.title} color="bg-royal" />
            <Stat icon="clock" label="Course progress" value={`${pct(mainProg!.done, mainProg!.total)}%`} sub={`${mainProg!.done} of ${mainProg!.total} lessons`} color="bg-cyan" />
            <Stat icon="clip" label="Assignments due" value={due.length} sub={due[0] ? `Next: ${fmtDate(due[0].due_at)}` : "You're all caught up"} color="bg-[#e07a1f]" />
            <Stat icon="award" label="Average grade" value={avg.percent == null ? "—" : `${avg.percent}%`} sub={avg.graded ? `Across ${avg.graded} graded task${avg.graded > 1 ? "s" : ""}` : "No grades yet"} color="bg-[#1f9d6b]" />
          </div>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
              {courses.map((c) => {
                const p = progress[c.id] ?? { done: 0, total: 0 };
                return (
                  <div key={c.id} className="flex flex-wrap overflow-hidden rounded-2xl bg-navy text-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover_url || "/images/powerbi.jpg"} alt="" className="h-56 min-w-0 flex-[1_1_240px] object-cover" />
                    <div className="flex flex-[2_1_320px] flex-col gap-3.5 p-6">
                      <span className="text-[13px] font-bold tracking-[2px] text-cyan">CONTINUE LEARNING</span>
                      <span className="font-display text-xl font-extrabold">{c.title}</span>
                      <div className="flex flex-col gap-1.5"><Bar value={pct(p.done, p.total)} /><span className="text-[13px] text-soft">{pct(p.done, p.total)}% complete · {p.done} of {p.total} lessons</span></div>
                      <Link href={`/portal/courses/${c.slug}`} className="btn-primary self-start">Resume →</Link>
                    </div>
                  </div>
                );
              })}
              <SectionCard title="Recent grades" action={<Link href="/portal/grades" className="text-sm font-semibold text-royal">See all results</Link>}>
                {graded.length === 0 ? <p className="text-muted">Your grades will appear here once your work is marked.</p> : (
                  <ul className="flex flex-col">
                    {graded.map((s) => {
                      const a = assignments.find((x) => x.id === s.assignment_id);
                      const p = a ? Math.round((Number(s.score) / Number(a.max_score)) * 100) : 0;
                      return <li key={s.id} className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-0"><span className="text-[15px]">{a?.title}</span><span className="flex items-center gap-3 font-semibold">{s.score} / {a?.max_score}<StatusPill status="new" label={letterGrade(p)} /></span></li>;
                    })}
                  </ul>
                )}
              </SectionCard>
            </div>

            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <SectionCard title="Upcoming deadlines" action={<Link href="/portal/assignments" className="text-sm font-semibold text-royal">All</Link>}>
                {due.length === 0 ? <p className="text-muted">Nothing due right now.</p> : due.slice(0, 4).map((a) => (
                  <Link key={a.id} href={`/portal/assignments/${a.id}`} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
                    <span className="flex min-w-0 flex-1 flex-col"><span className="font-semibold">{a.title}</span><span className="text-[13px] text-muted">Due {fmtDate(a.due_at, true)}</span></span>
                    <StatusPill status="pending" label="To do" />
                  </Link>
                ))}
              </SectionCard>
              <SectionCard title="Announcements">
                {(news ?? []).length === 0 ? <p className="text-muted">No announcements yet.</p> : (news ?? []).map((n) => (
                  <div key={n.id} className="flex flex-col gap-1 border-t border-line pt-3 first:border-0 first:pt-0"><p className="whitespace-pre-line text-[15px] leading-relaxed">{n.body}</p><span className="text-xs text-muted">{fmtDate(n.created_at, true)}</span></div>
                ))}
              </SectionCard>
              <SectionCard title="Messages" action={<Link href="/portal/messages" className="text-sm font-semibold text-royal">Open chat</Link>}>
                {lastMsg ? <p className="line-clamp-3 text-[15px] text-muted"><span className="font-semibold text-navy">Instructor:</span> {lastMsg.body}</p> : <p className="text-muted">Have a question? Send your instructor a message.</p>}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </>
  );
}
