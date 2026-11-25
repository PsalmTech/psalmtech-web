import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getStudentData, pct } from "@/lib/student";
import { PageTitle, Empty } from "@/components/PortalShell";
import { Bar } from "@/components/ui";

export default async function MyCourses() {
  const { supabase, user } = await requireUser();
  const { courses, progress } = await getStudentData(supabase, user.id);
  return (
    <>
      <PageTitle title="My Courses" sub="Trainings you're enrolled in." action={<Link href="/courses" className="btn-outline">Browse trainings</Link>} />
      {courses.length === 0 ? <Empty>You haven&apos;t enrolled in a training yet.</Empty> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const p = progress[c.id] ?? { done: 0, total: 0 };
            return (
              <Link key={c.id} href={`/portal/courses/${c.slug}`} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover_url || "/images/powerbi.jpg"} alt="" className="h-40 w-full object-cover" />
                <div className="flex flex-col gap-3 p-5">
                  <span className="font-display text-lg font-bold">{c.title}</span>
                  <Bar value={pct(p.done, p.total)} />
                  <span className="text-sm text-muted">{pct(p.done, p.total)}% complete</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
