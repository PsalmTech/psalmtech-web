import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCourseContent, canAccessCourse } from "@/lib/coursecontent";
import { Icon } from "@/components/icons";
import { Bar, SectionCard } from "@/components/ui";
import { fmtDate } from "@/lib/format";

const KIND_ICON = { video: "play", reading: "reading", file: "file" } as const;

export default async function CourseHome({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const { slug } = await params;
  const { welcome } = await searchParams;
  const { supabase, user, profile } = await requireUser();
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single();
  if (!course) notFound();
  if (!(await canAccessCourse(supabase, user.id, course.id, profile?.role === "admin"))) redirect(`/courses/${slug}`);

  const modules = await getCourseContent(supabase, course.id);
  const { data: prog } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
  const done = new Set((prog ?? []).map((p) => p.lesson_id));
  const all = modules.flatMap((m) => m.lessons);
  const percent = all.length ? Math.round((all.filter((l) => done.has(l.id)).length / all.length) * 100) : 0;
  const nextLesson = all.find((l) => !done.has(l.id));
  const files = all.filter((l) => l.kind === "file");
  const { data: news } = await supabase.from("announcements").select("*").eq("course_id", course.id).order("created_at", { ascending: false }).limit(3);

  return (
    <>
      <div className="text-sm text-muted"><Link href="/portal" className="text-royal">Dashboard</Link> / <Link href="/portal/courses" className="text-royal">My Courses</Link> / {course.title}</div>
      {welcome && <p role="status" className="rounded-xl bg-[#dff5ea] p-4 font-semibold text-[#14724d]">Payment confirmed. Welcome to {course.title}! 🎉</p>}
      <div className="relative overflow-hidden rounded-3xl bg-royal text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.cover_url || "/images/powerbi.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-8">
          <div className="flex max-w-[620px] flex-col gap-2.5"><span className="text-[13px] font-bold tracking-[2px] text-ice">COURSE</span><h1 className="font-display text-3xl font-extrabold">{course.title}</h1>
            <span className="text-[15px] text-ice">{modules.length} modules · {all.length} lessons · Instructor: Samuel Ojeleke</span></div>
          <div className="flex w-full max-w-[300px] flex-col gap-2"><div className="flex justify-between text-sm font-semibold"><span>Your progress</span><span>{percent}%</span></div><Bar value={percent} h="h-2.5" />
            {nextLesson && <Link href={`/portal/lessons/${nextLesson.id}`} className="btn-primary mt-2">{percent === 0 ? "Start course" : "Continue"} →</Link>}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-3.5">
          <h2 className="font-display text-lg font-bold">Course content</h2>
          {modules.map((m, i) => {
            const md = m.lessons.filter((l) => done.has(l.id)).length;
            const complete = m.lessons.length > 0 && md === m.lessons.length;
            return (
              <details key={m.id} open={!complete && m.lessons.some((l) => l.id === nextLesson?.id)} className={`rounded-2xl bg-white p-4 ${m.lessons.some((l) => l.id === nextLesson?.id) ? "border-2 border-cyan" : "border border-line"}`}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3.5">
                  <span className="w-7 font-display font-extrabold text-cyan">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-[200px] flex-1 font-display font-bold">{m.title}</span>
                  <span className={`pill ${complete ? "bg-[#dff5ea] text-[#14724d]" : "bg-ice text-royal"}`}>{complete ? "Completed" : `${md}/${m.lessons.length}`}</span>
                </summary>
                <ul className="mt-3 flex flex-col gap-1">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link href={`/portal/lessons/${l.id}`} className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 hover:bg-page ${l.id === nextLesson?.id ? "bg-ice" : ""}`}>
                        <Icon name={KIND_ICON[l.kind]} className="text-royal" />
                        <span className="min-w-0 flex-1 text-[15px] font-medium">{l.title}</span>
                        {l.duration && <span className="text-[13px] text-muted">{l.duration}</span>}
                        {done.has(l.id) ? <Icon name="check" className="text-[#1f9d6b]" /> : l.id === nextLesson?.id ? <span className="pill bg-cyan text-navy">Up next</span> : <span className="h-[18px] w-[18px] rounded-full border-2 border-[#cfd8ea]" />}
                      </Link>
                    </li>
                  ))}
                  {m.lessons.length === 0 && <li className="px-3.5 py-2 text-sm text-muted">Lessons coming soon.</li>}
                </ul>
              </details>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <SectionCard>
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/me-cut.webp" alt="Samuel Ojeleke" className="h-16 w-16 rounded-full bg-ice object-cover object-top" />
              <div className="flex flex-col"><span className="font-display text-[17px] font-bold">Samuel Ojeleke</span><span className="text-[13px] text-muted">Instructor · Microsoft Certified DP-100 &amp; DP-600</span></div>
            </div>
            <Link href="/portal/messages" className="btn-primary"><Icon name="chat" size={18} />Message instructor</Link>
          </SectionCard>
          <SectionCard title="Announcements">
            {(news ?? []).length === 0 ? <p className="text-muted">No announcements yet.</p> : (news ?? []).map((n) => <div key={n.id} className="flex flex-col gap-1"><p className="whitespace-pre-line text-[15px]">{n.body}</p><span className="text-xs text-muted">{fmtDate(n.created_at, true)}</span></div>)}
          </SectionCard>
          <SectionCard title="Resources">
            {files.length === 0 ? <p className="text-muted">Downloadable files will appear here.</p> : files.map((f) => (
              <Link key={f.id} href={`/portal/lessons/${f.id}`} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0"><Icon name="file" className="text-royal" /><span className="flex-1 text-sm font-medium">{f.title}</span><Icon name="down" size={18} className="text-muted" /></Link>
            ))}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
