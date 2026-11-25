import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getCourseContent, canAccessCourse, embedUrl } from "@/lib/coursecontent";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/icons";

async function toggleDone(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const lessonId = String(formData.get("lesson_id"));
  const next = String(formData.get("next") || "");
  if (formData.get("done") === "1") await supabase.from("lesson_progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
  else await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId });
  revalidatePath(`/portal/lessons/${lessonId}`);
  if (next) redirect(next);
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await requireUser();
  const { data: lesson } = await supabase.from("lessons").select("*, modules(course_id, title, courses(slug, title))").eq("id", id).single();
  if (!lesson) notFound();
  const mod = lesson.modules as unknown as { course_id: string; title: string; courses: { slug: string; title: string } };
  if (!(await canAccessCourse(supabase, user.id, mod.course_id, profile?.role === "admin"))) redirect(`/courses/${mod.courses.slug}`);

  const modules = await getCourseContent(supabase, mod.course_id);
  const all = modules.flatMap((m) => m.lessons);
  const i = all.findIndex((l) => l.id === id);
  const prev = all[i - 1], next = all[i + 1];
  const { data: p } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("lesson_id", id).maybeSingle();
  const done = !!p;

  let fileUrl: string | null = null;
  if (lesson.file_path) {
    const { data } = await supabase.storage.from("materials").createSignedUrl(lesson.file_path, 60 * 60);
    fileUrl = data?.signedUrl ?? null;
  }
  const embed = lesson.kind === "video" ? embedUrl(lesson.video_url) : null;

  return (
    <>
      <div className="text-sm text-muted"><Link href={`/portal/courses/${mod.courses.slug}`} className="text-royal">{mod.courses.title}</Link> / {mod.title}</div>
      <div className="flex flex-wrap items-start gap-6">
        <article className="flex min-w-0 flex-[3_1_560px] flex-col gap-5">
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">{lesson.title}</h1>
          {embed && (
            <div className="aspect-video overflow-hidden rounded-2xl bg-navy">
              <iframe src={embed} title={lesson.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          )}
          {lesson.content && <div className="card whitespace-pre-line text-[16px] leading-[1.75]">{lesson.content}</div>}
          {fileUrl && (
            <a href={fileUrl} className="card flex items-center gap-4 hover:border-cyan">
              <Icon name="file" size={28} className="text-royal" /><span className="flex-1 font-semibold">Download lesson file</span><Icon name="down" />
            </a>
          )}
          {!embed && !lesson.content && !fileUrl && <div className="card text-muted">This lesson&apos;s material will be added soon.</div>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            {prev ? <Link href={`/portal/lessons/${prev.id}`} className="btn-outline">← Previous</Link> : <span />}
            <form action={toggleDone} className="flex gap-3">
              <input type="hidden" name="lesson_id" value={id} />
              <input type="hidden" name="done" value={done ? "1" : "0"} />
              {!done && next && <input type="hidden" name="next" value={`/portal/lessons/${next.id}`} />}
              <button className={done ? "btn-outline" : "btn-primary"}>{done ? "✓ Completed (undo)" : next ? "Mark complete & next →" : "Mark complete"}</button>
            </form>
          </div>
        </article>

        <aside className="card flex flex-[1_1_280px] flex-col gap-1 p-4">
          <span className="px-2 pb-2 font-display font-bold">Lessons</span>
          {all.map((l, n) => (
            <Link key={l.id} href={`/portal/lessons/${l.id}`} className={`rounded-lg px-3 py-2 text-sm ${l.id === id ? "bg-royal font-semibold text-white" : "hover:bg-page"}`}>{n + 1}. {l.title}</Link>
          ))}
        </aside>
      </div>
    </>
  );
}
