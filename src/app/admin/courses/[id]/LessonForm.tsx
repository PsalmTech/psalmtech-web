"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveLesson } from "../../actions";

type L = { id: string; title: string; kind: string; video_url: string | null; content: string | null; duration: string | null; position: number; file_path: string | null };

export default function LessonForm({ courseId, moduleId, lesson, nextPosition }: { courseId: string; moduleId: string; lesson?: L; nextPosition?: number }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [kind, setKind] = useState(lesson?.kind ?? "video");
  const ref = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    fd.delete("file");
    if (file && file.size > 0) {
      const path = `${courseId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error } = await createClient().storage.from("materials").upload(path, file);
      if (error) { setErr("File upload failed: " + error.message); setBusy(false); return; }
      fd.set("file_path", path);
    }
    await saveLesson(fd);
    setBusy(false);
    if (!lesson) { ref.current?.reset(); setKind("video"); }
  }

  return (
    <form ref={ref} onSubmit={submit} className="grid gap-3 rounded-xl bg-page p-4 md:grid-cols-2">
      {err && <p role="alert" className="text-sm text-red-700 md:col-span-2">{err}</p>}
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="module_id" value={moduleId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <label className="label">Lesson title<input name="title" required defaultValue={lesson?.title} className="input" /></label>
      <div className="grid grid-cols-3 gap-3">
        <label className="label col-span-1">Type
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="input"><option value="video">Video</option><option value="reading">Reading</option><option value="file">File</option></select>
        </label>
        <label className="label">Length<input name="duration" defaultValue={lesson?.duration ?? ""} className="input" placeholder="12 min" /></label>
        <label className="label">Order<input name="position" type="number" defaultValue={lesson?.position ?? nextPosition ?? 1} className="input" /></label>
      </div>
      {kind === "video" && <label className="label md:col-span-2">Video link (YouTube unlisted, Vimeo or Google Drive)<input name="video_url" defaultValue={lesson?.video_url ?? ""} className="input" placeholder="https://youtu.be/…" /></label>}
      <label className="label md:col-span-2">Notes / reading (optional)<textarea name="content" rows={kind === "reading" ? 6 : 3} defaultValue={lesson?.content ?? ""} className="input" /></label>
      <label className="label md:col-span-2">Attach a file (slides, dataset, PDF){lesson?.file_path && <span className="font-normal text-muted">Current: {lesson.file_path.split("/").pop()} (choose a new file to replace)</span>}
        <input name="file" type="file" className="text-sm" />
      </label>
      <button disabled={busy} className="btn-primary justify-self-start">{busy ? "Saving…" : lesson ? "Save lesson" : "Add lesson"}</button>
    </form>
  );
}
