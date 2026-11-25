import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Icon } from "@/components/icons";
import { getSession } from "@/lib/auth";
import { naira, priceFor, CONTACT } from "@/lib/format";
import { enrol } from "./actions";

type Mod = { id: string; title: string; position: number; lessons: { id: string; title: string; position: number }[] };

export default async function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const { supabase, user, profile } = await getSession();
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single();
  if (!course) notFound();
  const { data: mods } = await supabase.from("modules").select("id,title,position").eq("course_id", course.id).order("position");
  const modIds = (mods ?? []).map((m) => m.id);
  const { data: outline } = modIds.length ? await supabase.from("lesson_outline").select("id,module_id,title,position").in("module_id", modIds) : { data: [] };
  const modules: Mod[] = (mods ?? []).map((m) => ({
    ...m,
    lessons: (outline ?? []).filter((l) => l.module_id === m.id).sort((a, b) => a.position - b.position),
  }));

  let enrolled = false;
  if (user) {
    const { data } = await supabase.from("enrollments").select("status").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
    enrolled = data?.status === "active";
  }
  const price = course.price_kobo as number | null;
  const yourPrice = price ? priceFor(price, course.discount_percent, profile?.user_type) : price;

  return (
    <>
      <SiteHeader />
      <main className="bg-page">
        <section className="relative overflow-hidden bg-royal text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.cover_url || "/images/powerbi.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
          <div className="relative mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-16">
            <p className="font-display text-sm font-bold tracking-[3px] text-ice">PSALMTECH ACADEMY</p>
            <h1 className="font-display text-4xl font-extrabold md:text-5xl">{course.title}</h1>
            <p className="max-w-2xl text-lg text-ice">{course.summary}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ice">
              <span>{modules.length} modules</span>
              <span>{modules.reduce((n, m) => n + m.lessons.length, 0)} lessons</span>
              {course.duration && <span>Duration: {course.duration}</span>}
              {course.mode && <span>Mode: {course.mode}</span>}
              {course.next_cohort && <span>Next cohort: {course.next_cohort}</span>}
            </div>
          </div>
        </section>

        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-8 px-6 py-12">
          <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-6">
            {course.description && <div className="card"><h2 className="mb-3 font-display text-xl font-bold">About this training</h2><p className="whitespace-pre-line leading-relaxed text-muted">{course.description}</p></div>}
            <div className="card flex flex-col gap-3">
              <h2 className="font-display text-xl font-bold">Course outline</h2>
              {modules.map((m, i) => (
                <details key={m.id} className="rounded-xl border border-line p-4" open={i === 0}>
                  <summary className="cursor-pointer font-display font-bold"><span className="mr-3 text-cyan">{String(i + 1).padStart(2, "0")}</span>{m.title}</summary>
                  <ul className="mt-3 flex flex-col gap-2 pl-9 text-[15px] text-muted">
                    {m.lessons.map((l) => <li key={l.id} className="flex items-center gap-2"><Icon name="lock" size={14} />{l.title}</li>)}
                  </ul>
                </details>
              ))}
            </div>
          </div>

          <aside className="card sticky top-6 flex flex-[1_1_320px] flex-col gap-4">
            {sp.closed && <p role="alert" className="rounded-xl bg-ice p-3 text-sm text-royal">Registration isn&apos;t open yet. Message us on WhatsApp to reserve a seat.</p>}
            {sp.payerror && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">We couldn&apos;t start the payment. Please try again or contact us.</p>}
            <span className="text-sm font-semibold text-muted">Course fee</span>
            {price == null ? (
              <span className="font-display text-2xl font-extrabold">Announced soon</span>
            ) : price === 0 ? (
              <span className="font-display text-3xl font-extrabold">Free</span>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="font-display text-3xl font-extrabold">{naira(yourPrice)}</span>
                {yourPrice !== price ? <span className="text-sm text-muted"><s>{naira(price)}</s> · {course.discount_percent}% student/researcher discount applied</span>
                  : <span className="text-sm text-muted">Students &amp; researchers get {course.discount_percent}% off</span>}
              </div>
            )}
            {enrolled ? (
              <Link href={`/portal/courses/${course.slug}`} className="btn-primary py-4">Go to course</Link>
            ) : price == null ? (
              <a href={CONTACT.whatsappLink} className="btn-primary py-4">Reserve a seat on WhatsApp</a>
            ) : (
              <form action={enrol}><input type="hidden" name="slug" value={course.slug} />
                <button className="btn-primary w-full py-4">{user ? (price === 0 ? "Enrol for free" : "Pay & enrol") : "Create account to enrol"}</button>
              </form>
            )}
            <ul className="flex flex-col gap-2 text-sm text-muted">
              {["Secure payment with Paystack", "Lessons, materials & assignments", "Grades & personal feedback", "Chat with your instructor"].map((t) => <li key={t} className="flex items-center gap-2"><Icon name="tick" size={16} className="text-royal" />{t}</li>)}
            </ul>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
