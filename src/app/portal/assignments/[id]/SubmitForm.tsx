"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

const MAX = 25 * 1024 * 1024;

export default function SubmitForm({ assignmentId, userId, existing, note }: { assignmentId: string; userId: string; existing: string[]; note: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = String(new FormData(e.currentTarget).get("note") || "").trim();
    if (files.length === 0 && existing.length === 0) { setMsg({ ok: false, text: "Please attach at least one file." }); return; }
    if (files.some((f) => f.size > MAX)) { setMsg({ ok: false, text: "Each file must be 25 MB or smaller." }); return; }
    setBusy(true); setMsg(null);
    const supabase = createClient();
    const paths = [...existing];
    for (const f of files) {
      const safe = f.name.replace(/[^\w.\-]+/g, "_");
      const path = `${userId}/${assignmentId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from("submissions").upload(path, f);
      if (error) { setMsg({ ok: false, text: `Upload failed for ${f.name}. Please try again.` }); setBusy(false); return; }
      paths.push(path);
    }
    const { error } = await supabase.from("submissions").upsert(
      { assignment_id: assignmentId, user_id: userId, file_paths: paths, note: text || null, submitted_at: new Date().toISOString() },
      { onConflict: "assignment_id,user_id" }
    );
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Couldn't save your submission. Please try again." }); return; }
    setFiles([]);
    setMsg({ ok: true, text: "Submitted! Your instructor will grade it soon." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-[#dff5ea] text-[#14724d]" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <label className="relative flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-[#b9c7e3] bg-page p-8 text-center">
        <Icon name="upload" size={32} className="text-royal" />
        <span className="font-bold">Choose files to upload</span>
        <span className="text-[13px] text-muted">Any file type · max 25 MB each · you can resubmit until it&apos;s graded</span>
        <input type="file" multiple className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </label>
      {files.length > 0 && <ul className="text-sm text-muted">{files.map((f) => <li key={f.name}>• {f.name}</li>)}</ul>}
      <label className="label">Note to instructor (optional)<textarea name="note" rows={3} defaultValue={note} className="input" placeholder="Anything you'd like your instructor to know" /></label>
      <button disabled={busy} className="btn-primary self-start">{busy ? "Uploading…" : existing.length ? "Update submission" : "Submit assignment"}</button>
    </form>
  );
}
