import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageTitle } from "@/components/PortalShell";
import { SectionCard, StatusPill } from "@/components/ui";
import { naira } from "@/lib/format";
import { createCourse } from "../actions";

export default async function AdminCourses() {
  const { supabase } = await requireAdmin();
  const { data: courses } = await supabase.from("courses").select("*, enrollments(count)").order("created_at");
  return (
    <>
      <PageTitle title="Courses" sub="Create trainings, add lessons, assignments and announcements." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(courses ?? []).map((c) => (
          <Link key={c.id} href={`/admin/courses/${c.id}`} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 hover:border-cyan">
            <div className="flex items-start justify-between gap-3"><span className="font-display text-lg font-bold">{c.title}</span><StatusPill status={c.published ? "active" : "closed"} label={c.published ? "Published" : "Draft"} /></div>
            <span className="text-sm text-muted">{c.summary}</span>
            <div className="mt-auto flex justify-between text-sm"><span className="font-semibold">{c.price_kobo == null ? "No price set" : naira(c.price_kobo)}</span><span className="text-muted">{(c.enrollments as { count: number }[])[0]?.count ?? 0} enrolled</span></div>
          </Link>
        ))}
      </div>
      <SectionCard title="New course">
        <form action={createCourse} className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <label className="label">Title<input name="title" required className="input" placeholder="e.g. Python for Data Science" /></label>
          <label className="label">Short summary<input name="summary" className="input" placeholder="One line shown on the course card" /></label>
          <button className="btn-primary">Create course</button>
        </form>
      </SectionCard>
    </>
  );
}
