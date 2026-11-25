import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/PortalShell";
import { StatusPill } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { gradeSubmission } from "../actions";

type Row = { id: string; file_paths: string[]; note: string | null; submitted_at: string; score: number | null; feedback: string | null; graded_at: string | null;
  profiles: { full_name: string | null } | null; assignments: { title: string; max_score: number; due_at: string | null; courses: { title: string } | null } | null };

export default async function Submissions({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "ungraded" } = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase.from("submissions").select("*, profiles(full_name), assignments(title, max_score, due_at, courses(title))").order("submitted_at", { ascending: show === "ungraded" }).limit(100);
  q = show === "ungraded" ? q.is("score", null) : q.not("score", "is", null);
  const { data } = await q;
  const rows = (data as unknown as Row[]) ?? [];
  const withUrls = await Promise.all(rows.map(async (r) => ({
    ...r,
    files: await Promise.all((r.file_paths ?? []).map(async (p) => ({ name: p.split("/").pop()!.replace(/^\d+-/, ""), url: (await supabase.storage.from("submissions").createSignedUrl(p, 3600)).data?.signedUrl }))),
  })));

  return (
    <>
      <PageTitle title="Grade submissions" sub="Download each student's work, enter a score and write feedback." />
      <div className="flex gap-2">
        {[["ungraded", "Waiting to grade"], ["graded", "Already graded"]].map(([k, l]) => <Link key={k} href={`/admin/submissions?show=${k}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${show === k ? "bg-navy text-white" : "border border-line bg-white"}`}>{l}</Link>)}
      </div>
      {withUrls.length === 0 ? <Empty>{show === "ungraded" ? "All caught up. Nothing to grade." : "No graded work yet."}</Empty> : withUrls.map((r) => {
        const late = r.assignments?.due_at && new Date(r.submitted_at) > new Date(r.assignments.due_at);
        return (
          <section key={r.id} id={`s-${r.id}`} className="flex scroll-mt-6 flex-wrap gap-6 rounded-2xl border border-line bg-white p-6">
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
              <span className="font-display text-lg font-bold">{r.profiles?.full_name ?? "Student"}</span>
              <span className="text-sm text-muted">{r.assignments?.courses?.title} · <span className="font-semibold text-navy">{r.assignments?.title}</span></span>
              <span className="flex items-center gap-2 text-sm text-muted">Submitted {fmtDate(r.submitted_at, true)} {late && <StatusPill status="overdue" label="Late" />}</span>
              {r.note && <p className="rounded-xl bg-page p-3 text-sm"><span className="font-semibold">Student note:</span> {r.note}</p>}
              <div className="flex flex-col gap-1">{r.files.map((f) => <a key={f.name} href={f.url} className="flex items-center gap-2 text-sm font-semibold text-royal hover:underline"><Icon name="down" size={16} />{f.name}</a>)}</div>
            </div>
            <form action={gradeSubmission} className="flex flex-[1_1_360px] flex-col gap-3">
              <input type="hidden" name="id" value={r.id} />
              <label className="label">Score (out of {r.assignments?.max_score})<input name="score" type="number" step="0.5" min="0" max={r.assignments?.max_score} required defaultValue={r.score ?? ""} className="input w-40" /></label>
              <label className="label">Feedback for the student<textarea name="feedback" rows={4} defaultValue={r.feedback ?? ""} className="input" placeholder="What they did well, and what to improve" /></label>
              <button className="btn-primary self-start">{r.score == null ? "Save grade" : "Update grade"}</button>
            </form>
          </section>
        );
      })}
    </>
  );
}
