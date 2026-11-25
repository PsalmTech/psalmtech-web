import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCourseContent } from "@/lib/coursecontent";
import { PageTitle } from "@/components/PortalShell";
import { SectionCard } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import LessonForm from "./LessonForm";
import {
  updateCourse, deleteCourse, addModule, renameModule, deleteModule, deleteLesson,
  saveAssignment, deleteAssignment, postAnnouncement, deleteAnnouncement,
} from "../../actions";

const toLagosInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(0, 16) : "");

function Del({ action, fields, label = "Delete" }: { action: (f: FormData) => Promise<void>; fields: Record<string, string>; label?: string }) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className="flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"><Icon name="trash" size={15} />{label}</button>
    </form>
  );
}

function AssignmentForm({ courseId, a }: { courseId: string; a?: { id: string; title: string; instructions: string | null; kind: string; due_at: string | null; max_score: number } }) {
  return (
    <form action={saveAssignment} className="mt-3 grid gap-3 rounded-xl bg-page p-4 md:grid-cols-2">
      <input type="hidden" name="course_id" value={courseId} />
      {a && <input type="hidden" name="id" value={a.id} />}
      <label className="label">Title<input name="title" required defaultValue={a?.title} className="input" /></label>
      <div className="grid grid-cols-3 gap-3">
        <label className="label">Type<select name="kind" defaultValue={a?.kind ?? "assignment"} className="input"><option value="assignment">Assignment</option><option value="quiz">Quiz</option><option value="project">Project</option></select></label>
        <label className="label">Max score<input name="max_score" type="number" min="1" defaultValue={a?.max_score ?? 100} className="input" /></label>
        <label className="label">Due (Lagos time)<input name="due_at" type="datetime-local" defaultValue={toLagosInput(a?.due_at ?? null)} className="input" /></label>
      </div>
      <label className="label md:col-span-2">Instructions<textarea name="instructions" rows={3} defaultValue={a?.instructions ?? ""} className="input" /></label>
      <button className="btn-primary justify-self-start">{a ? "Save" : "Create"}</button>
    </form>
  );
}

export default async function EditCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: c } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!c) notFound();
  const modules = await getCourseContent(supabase, id);
  const { data: assignments } = await supabase.from("assignments").select("*").eq("course_id", id).order("due_at", { nullsFirst: false });
  const { data: news } = await supabase.from("announcements").select("*").eq("course_id", id).order("created_at", { ascending: false });

  return (
    <>
      <div className="text-sm text-muted"><Link href="/admin/courses" className="text-royal">Courses</Link> / {c.title}</div>
      <PageTitle title={c.title} sub={c.published ? "Published: visible on the website" : "Draft: hidden from the website"}
        action={<div className="flex gap-3"><Link href={`/courses/${c.slug}`} className="btn-outline">View public page</Link><Link href={`/portal/courses/${c.slug}`} className="btn-primary">Preview as student</Link></div>} />

      <SectionCard title="Course details">
        {saved && <p role="status" className="rounded-xl bg-[#dff5ea] p-3 text-sm text-[#14724d]">Saved.</p>}
        <form action={updateCourse} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={c.id} />
          <label className="label">Title<input name="title" required defaultValue={c.title} className="input" /></label>
          <label className="label">Web address (slug)<input name="slug" defaultValue={c.slug} className="input" /></label>
          <label className="label md:col-span-2">Short summary<input name="summary" defaultValue={c.summary ?? ""} className="input" /></label>
          <label className="label md:col-span-2">Full description<textarea name="description" rows={4} defaultValue={c.description ?? ""} className="input" /></label>
          <label className="label">Fee in naira (leave empty = registration closed, 0 = free)<input name="price_naira" type="number" min="0" step="100" defaultValue={c.price_kobo == null ? "" : c.price_kobo / 100} className="input" /></label>
          <label className="label">Student/researcher discount (%)<input name="discount_percent" type="number" min="0" max="100" defaultValue={c.discount_percent} className="input" /></label>
          <label className="label">Duration<input name="duration" defaultValue={c.duration ?? ""} className="input" placeholder="e.g. 6 weeks" /></label>
          <label className="label">Mode<input name="mode" defaultValue={c.mode ?? ""} className="input" placeholder="Online / In-person / Hybrid" /></label>
          <label className="label">Next cohort<input name="next_cohort" defaultValue={c.next_cohort ?? ""} className="input" placeholder="e.g. 12 January 2027" /></label>
          <label className="label">Cover image URL<input name="cover_url" defaultValue={c.cover_url ?? ""} className="input" placeholder="/images/powerbi.jpg" /></label>
          <label className="flex items-center gap-3 font-semibold md:col-span-2"><input type="checkbox" name="published" defaultChecked={c.published} className="h-5 w-5" />Published (show on the website)</label>
          <div className="flex items-center justify-between md:col-span-2"><button className="btn-primary">Save details</button></div>
        </form>
      </SectionCard>

      <SectionCard title="Modules & lessons">
        {modules.map((m) => (
          <details key={m.id} className="rounded-2xl border border-line p-4">
            <summary className="cursor-pointer font-display font-bold">{m.position}. {m.title} <span className="font-sans text-sm font-normal text-muted">· {m.lessons.length} lessons</span></summary>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <form action={renameModule} className="flex flex-1 flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={m.id} /><input type="hidden" name="course_id" value={id} />
                  <label className="label flex-1">Module title<input name="title" defaultValue={m.title} className="input" /></label>
                  <label className="label w-24">Order<input name="position" type="number" defaultValue={m.position} className="input" /></label>
                  <button className="btn-outline">Save</button>
                </form>
                <Del action={deleteModule} fields={{ id: m.id, course_id: id }} label="Delete module" />
              </div>
              {m.lessons.map((l) => (
                <details key={l.id} className="rounded-xl border border-line bg-white p-3">
                  <summary className="flex cursor-pointer items-center gap-3 text-[15px]"><Icon name={l.kind === "video" ? "play" : l.kind === "file" ? "file" : "reading"} className="text-royal" /><span className="flex-1 font-medium">{l.position}. {l.title}</span>
                    {!l.video_url && !l.content && !l.file_path && <span className="pill bg-[#fdecd9] text-[#8a4a06]">No content yet</span>}</summary>
                  <div className="mt-3 flex flex-col gap-2"><LessonForm courseId={id} moduleId={m.id} lesson={l} /><Del action={deleteLesson} fields={{ id: l.id, course_id: id }} label="Delete lesson" /></div>
                </details>
              ))}
              <p className="mt-2 text-sm font-bold">Add a lesson to this module</p>
              <LessonForm courseId={id} moduleId={m.id} nextPosition={m.lessons.length + 1} />
            </div>
          </details>
        ))}
        <form action={addModule} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="course_id" value={id} />
          <label className="label flex-1">New module title<input name="title" required className="input" /></label>
          <button className="btn-primary"><Icon name="plus" size={16} />Add module</button>
        </form>
      </SectionCard>

      <SectionCard title="Assignments, quizzes & projects">
        {(assignments ?? []).map((a) => (
          <details key={a.id} className="rounded-xl border border-line p-3">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3"><span className="flex-1 font-semibold">{a.title}</span><span className="text-sm capitalize text-muted">{a.kind} · max {a.max_score} · due {fmtDate(a.due_at, true)}</span></summary>
            <AssignmentForm courseId={id} a={a} />
            <Del action={deleteAssignment} fields={{ id: a.id, course_id: id }} />
          </details>
        ))}
        <p className="text-sm font-bold">New assessment</p>
        <AssignmentForm courseId={id} />
      </SectionCard>

      <SectionCard title="Announcements">
        <form action={postAnnouncement} className="flex flex-col gap-3">
          <input type="hidden" name="course_id" value={id} />
          <textarea name="body" rows={3} required className="input" placeholder="e.g. Live Q&A this Saturday at 10 am on Google Meet: https://meet.google.com/…" />
          <button className="btn-primary self-start">Post to students</button>
        </form>
        {(news ?? []).map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-4 border-t border-line pt-3"><div><p className="whitespace-pre-line">{n.body}</p><span className="text-xs text-muted">{fmtDate(n.created_at, true)}</span></div><Del action={deleteAnnouncement} fields={{ id: n.id, course_id: id }} /></div>
        ))}
      </SectionCard>

      <SectionCard title="Danger zone">
        <p className="text-sm text-muted">Deleting a course also deletes its lessons, assignments, submissions and enrolments. To hide it instead, untick “Published”.</p>
        <Del action={deleteCourse} fields={{ id }} label="Delete this course permanently" />
      </SectionCard>
    </>
  );

}
