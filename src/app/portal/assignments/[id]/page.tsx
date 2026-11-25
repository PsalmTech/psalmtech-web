import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SectionCard, StatusPill } from "@/components/ui";
import { Icon } from "@/components/icons";
import { fmtDate, letterGrade } from "@/lib/format";
import SubmitForm from "./SubmitForm";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: a } = await supabase.from("assignments").select("*, courses(title, slug)").eq("id", id).single();
  if (!a) notFound();
  const { data: s } = await supabase.from("submissions").select("*").eq("assignment_id", id).eq("user_id", user.id).maybeSingle();
  const files = await Promise.all(((s?.file_paths as string[]) ?? []).map(async (p) => {
    const { data } = await supabase.storage.from("submissions").createSignedUrl(p, 3600);
    return { name: p.split("/").pop()!.replace(/^\d+-/, ""), url: data?.signedUrl };
  }));
  const closed = a.due_at && new Date(a.due_at).getTime() < Date.now();
  const graded = s?.score != null;
  const course = a.courses as unknown as { title: string; slug: string };

  return (
    <>
      <div className="text-sm text-muted"><Link href="/portal/assignments" className="text-royal">Assignments</Link> / {course.title}</div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
          <SectionCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-extrabold">{a.title}</h1>
              <StatusPill status={graded ? "graded" : s ? "submitted" : closed ? "overdue" : "pending"} label={!s && !closed ? "To do" : undefined} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Icon name="clock" size={16} />Due {fmtDate(a.due_at, true)}</span>
              <span>Max score: {a.max_score}</span><span className="capitalize">Type: {a.kind}</span>
            </div>
            {a.instructions && <p className="whitespace-pre-line leading-relaxed text-[#26304d]">{a.instructions}</p>}
          </SectionCard>

          {graded ? (
            <SectionCard title="Your result">
              <div className="flex items-baseline gap-4"><span className="font-display text-4xl font-extrabold text-royal">{s!.score} / {a.max_score}</span>
                <span className="pill bg-ice text-royal">Grade {letterGrade((Number(s!.score) / Number(a.max_score)) * 100)}</span></div>
              {s!.feedback && <div className="rounded-xl bg-page p-4"><p className="mb-1 text-sm font-bold">Instructor feedback</p><p className="whitespace-pre-line leading-relaxed">{s!.feedback}</p></div>}
              <span className="text-xs text-muted">Graded {fmtDate(s!.graded_at, true)}</span>
            </SectionCard>
          ) : closed && !s ? (
            <SectionCard><p className="text-muted">The deadline has passed. Message your instructor if you need an extension.</p></SectionCard>
          ) : (
            <SectionCard title={s ? "Update your submission" : "Submit your work"}>
              <SubmitForm assignmentId={a.id} userId={user.id} existing={(s?.file_paths as string[]) ?? []} note={s?.note ?? ""} />
            </SectionCard>
          )}
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <SectionCard title="Your files">
            {files.length === 0 ? <p className="text-muted">Nothing submitted yet.</p> : files.map((f) => (
              <a key={f.name} href={f.url} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0"><Icon name="file" className="text-royal" /><span className="flex-1 truncate text-sm font-medium">{f.name}</span><Icon name="down" size={18} /></a>
            ))}
            {s && <span className="text-xs text-muted">Submitted {fmtDate(s.submitted_at, true)}</span>}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
