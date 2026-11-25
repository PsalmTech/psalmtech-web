import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPublishedCourses } from "@/lib/courses";
import { naira } from "@/lib/format";

export const metadata = { title: "Trainings — PsalmTech Academy" };

export default async function CoursesPage() {
  const courses = await getPublishedCourses();
  return (
    <>
      <SiteHeader />
      <main className="bg-page">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-16">
          <div className="flex flex-col gap-3"><p className="eyebrow">PSALMTECH ACADEMY</p><h1 className="h2">Trainings</h1>
            <p className="max-w-2xl text-lg text-muted">Practical courses with lessons, assignments, grades and direct support from your instructor.</p></div>
          {courses.length === 0 && <p className="card text-muted">New trainings are coming soon. Message us on WhatsApp to be the first to know.</p>}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} href={`/courses/${c.slug}`} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover_url || "/images/powerbi.jpg"} alt="" className="h-48 w-full object-cover" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h2 className="font-display text-xl font-extrabold">{c.title}</h2>
                  <p className="text-[15px] leading-relaxed text-muted">{c.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                    <span className="font-bold">{c.price_kobo == null ? "Fee announced soon" : c.price_kobo === 0 ? "Free" : naira(c.price_kobo)}</span>
                    <span className="font-bold text-royal">View course →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
