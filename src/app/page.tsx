import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSlideshow from "@/components/HeroSlideshow";
import { Icon } from "@/components/icons";
import { REVIEWS } from "@/content/reviews";
import { CONTACT, initials, naira } from "@/lib/format";
import { getPublishedCourses } from "@/lib/courses";

export const revalidate = 60;

const SERVICES = [
  { icon: "book", title: "Research & Publication", text: "Methodology, datasets, analysis, manuscript writing and journal formatting.", bg: "bg-navy text-white", sub: "text-soft", link: "text-cyan" },
  { icon: "chart", title: "Data Analytics & Power BI", text: "Dashboards, reports, data cleaning, forecasting and team training.", bg: "bg-cyan text-navy", sub: "text-navy", link: "text-navy" },
  { icon: "cpu", title: "Machine Learning & Python", text: "Feature engineering, model selection, training and evaluation.", bg: "bg-royal text-white", sub: "text-ice", link: "text-ice" },
  { icon: "shield", title: "Cybersecurity Research", text: "Intrusion detection, network & IoT simulation, security datasets.", bg: "bg-navy text-white border-l border-[#2a3350]", sub: "text-soft", link: "text-cyan" },
];

const AUDIENCE = [
  ["Students", "Final-year and postgraduate projects, analysis and Chapter 4 support."],
  ["Researchers", "Sciences, engineering and social sciences, from design to publication."],
  ["Schools", "Results and attendance dashboards, digital records and staff training."],
  ["Organisations", "Leadership-ready Power BI reporting, forecasting and ML solutions."],
];

const GALLERY = [
  ["/images/teach2.jpg", "Instructors guiding a session"],
  ["/images/class3.jpg", "Learners at computers during a presentation"],
  ["/images/help5.jpg", "Instructor helping two learners at a computer"],
  ["/images/cyber1.jpg", "Instructor explaining a network topology in a cybersecurity class"],
  ["/images/cyber2.jpg", "Instructor presenting a network project scenario"],
  ["/images/laptop4.jpg", "Learner coding on a laptop during a session"],
  ["/images/flyer-master.jpg", "PsalmTech flyer: Turn your data into decisions"],
  ["/images/flyer-powerbi.jpg", "PsalmTech flyer: Data Analytics and Power BI"],
];

const STEPS = [
  ["Chat", "Share your goal, data and deadline."],
  ["Plan", "We agree scope, approach and a quote."],
  ["Build", "Analysis, model, dashboard or manuscript work."],
  ["Handover", "Clear files, explanations and follow-up support."],
];

export default async function Home() {
  const courses = await getPublishedCourses();
  const course = courses[0];
  const reviews = REVIEWS.filter((r) => r.approved);

  return (
    <>
      <SiteHeader announcement={course ? `${course.title}: hands-on training` : undefined} />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-royal">
          <HeroSlideshow />
          <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-end gap-8 px-6 pt-16">
            <div className="flex flex-[1_1_480px] flex-col gap-5 pb-24 text-white md:pb-40">
              <p className="font-display text-lg font-semibold text-ice">Data · Machine Learning · Research</p>
              <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight md:text-6xl">
                We turn your data into <span className="text-cyan">decisions</span> and your research into <span className="text-cyan">results.</span>
              </h1>
              <p className="max-w-[540px] text-lg leading-relaxed text-ice">
                Analytics, Power BI, machine learning, cybersecurity research and publication support for students, researchers, schools and organisations.
              </p>
              <div className="mt-1 flex flex-wrap gap-3.5">
                <Link href="#services" className="btn-primary px-7 py-4">Explore Services</Link>
                <Link href={course ? `/courses/${course.slug}` : "/courses"} className="inline-flex items-center rounded-full border-2 border-white px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-white hover:text-royal">
                  Join Power BI Training
                </Link>
              </div>
            </div>
            <div className="relative flex min-h-[460px] flex-[1_1_380px] justify-center md:min-h-[520px]">
              <div className="absolute bottom-14 left-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-cyan md:h-[420px] md:w-[420px]" />
              <div className="absolute bottom-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full border-2 border-dashed border-ice/60 md:h-[500px] md:w-[500px]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/me-cut.webp" alt="Samuel Ojeleke, lead consultant at PsalmTech Solutions" className="relative block h-auto w-[340px] max-w-full self-end md:w-[400px]" />
              <div className="absolute left-0 top-24 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-navy shadow-xl">
                <Icon name="award" size={28} className="text-royal" />
                <span className="flex flex-col"><span className="text-xs font-semibold text-royal">Microsoft Certified</span><span className="font-display text-[15px] font-bold">DP-100 · DP-600</span></span>
              </div>
              <div className="absolute right-0 top-64 hidden flex-col rounded-xl bg-navy px-4 py-3 text-white shadow-xl sm:flex">
                <span className="font-display text-2xl font-extrabold text-cyan">~99%</span>
                <span className="text-[13px] text-ice">detection accuracy in our<br />intrusion detection research</span>
              </div>
            </div>
          </div>
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute -bottom-px left-0 block h-20 w-full"><path d="M0 80 C 360 0, 1080 0, 1440 80 Z" fill="#fff" /></svg>
        </section>

        {/* SERVICES */}
        <section id="services" className="relative mx-auto -mt-16 max-w-[1200px] scroll-mt-24 px-6 md:-mt-28">
          <div className="grid shadow-[0_24px_50px_rgba(19,26,47,0.2)] sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <Link key={s.title} href={`/quote?service=${encodeURIComponent(s.title)}`} className={`flex min-h-[210px] flex-col gap-3.5 p-8 transition hover:-translate-y-1 ${s.bg}`}>
                <Icon name={s.icon} size={44} strokeWidth={1.6} className={s.link} />
                <span className="font-display text-[19px] font-bold">{s.title}</span>
                <span className={`text-sm leading-relaxed ${s.sub}`}>{s.text}</span>
                <span className={`mt-auto text-sm font-bold ${s.link}`}>Get a quote →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 py-16 md:py-20">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <p className="eyebrow">WHO WE WORK WITH</p>
            <h2 className="h2">Support for every stage of your data journey</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map(([t, d]) => (
              <div key={t} className="flex flex-col gap-2 rounded-2xl bg-ice p-6">
                <span className="font-display text-lg font-bold">{t}</span>
                <span className="text-[15px] leading-relaxed text-muted">{d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="scroll-mt-24 bg-ice">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 py-20">
            <div className="relative mx-auto w-full max-w-[460px] flex-[1_1_360px]">
              <div className="absolute -bottom-4 -left-4 h-[70%] w-[70%] rounded-2xl bg-cyan" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/me-full.jpg" alt="Samuel Ojeleke in a dark suit" className="relative block h-[520px] w-full rounded-2xl object-cover object-[60%_20%]" />
            </div>
            <div className="flex flex-[1_1_460px] flex-col gap-4">
              <p className="eyebrow">MEET YOUR CONSULTANT</p>
              <h2 className="h2">Samuel Ojeleke</h2>
              <p className="text-[17px] leading-[1.7] text-muted">
                Data scientist, machine learning researcher and lecturer in computing. For years I have helped researchers, students and organisations collect the right data, analyse it properly and present results people can trust.
              </p>
              <div className="grid gap-x-6 gap-y-3 text-[15px] font-medium sm:grid-cols-2">
                {["Microsoft Certified DP-100 & DP-600", "Expert in Power BI & Python", "Cybersecurity & ML researcher", "Lecturer & hands-on trainer"].map((t) => (
                  <span key={t} className="flex items-start gap-2.5"><Icon name="tick" size={20} strokeWidth={2.4} className="text-royal" />{t}</span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3.5">
                <a href={CONTACT.whatsappLink} className="inline-flex rounded-full bg-royal px-6 py-3.5 font-display text-sm font-bold text-white hover:bg-navy">Chat on WhatsApp</a>
                <a href={CONTACT.github} className="btn-outline">See our work on GitHub</a>
              </div>
            </div>
          </div>
        </section>

        {/* TRAINING */}
        <section id="training" className="scroll-mt-24 bg-navy text-white">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-stretch gap-12 px-6 py-20">
            <div className="flex flex-[1_1_440px] flex-col gap-5">
              <p className="font-display text-sm font-bold tracking-[3px] text-cyan">PSALMTECH ACADEMY</p>
              <h2 className="h2">Learn Power BI with hands-on, guided training</h2>
              <p className="text-[17px] leading-[1.7] text-soft">Register, pay securely and learn from your own dashboard: lessons, materials, assignments, grades and direct chat with your instructor.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Register & pay online", "Your personal dashboard", "Lessons & materials", "Assignments, grades & feedback"].map((t) => (
                  <div key={t} className="rounded-xl border border-[#2a3350] p-4 text-[15px] font-medium">{t}</div>
                ))}
              </div>
            </div>
            <div className="flex flex-[1_1_420px] flex-col overflow-hidden rounded-3xl bg-white text-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/powerbi.jpg" alt="Analyst working on Power BI dashboards across three screens" className="h-60 w-full object-cover object-[60%_40%]" />
              <div className="flex flex-col gap-3.5 p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="pill bg-ice text-royal">Next cohort · {course?.next_cohort || "Dates coming soon"}</span>
                  <span className="text-[13px] font-semibold text-royal">20% off for students &amp; researchers</span>
                </div>
                <h3 className="font-display text-2xl font-extrabold">{course?.title ?? "Data Analytics with Power BI"}</h3>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                  {course?.duration && <span>Duration: {course.duration}</span>}
                  {course?.mode && <span>Mode: {course.mode}</span>}
                  <span>Fee: {course?.price_kobo ? naira(course.price_kobo) : "Announced soon"}</span>
                </div>
                <Link href={course ? `/courses/${course.slug}` : "/courses"} className="btn-primary mt-1 self-start px-7 py-4">Register Now</Link>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2.5"><p className="eyebrow">FROM OUR CLASSROOMS</p><h2 className="h2">Real training, real learners</h2></div>
            <p className="max-w-[420px] leading-relaxed text-muted">Hands-on sessions where every participant builds, codes and asks questions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map(([src, alt]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={alt} loading="lazy" className="h-[260px] w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>

        {/* REVIEWS (only approved ones show) */}
        {reviews.length > 0 && (
          <section className="mx-auto flex max-w-[1200px] flex-col gap-7 px-6 pb-20">
            <div className="flex flex-col items-center gap-2.5 text-center"><p className="eyebrow">WHAT CLIENTS SAY</p><h2 className="h2">Trusted by students, researchers and businesses</h2></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.handle} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 shadow-[0_10px_26px_rgba(19,26,47,0.06)]">
                  <svg aria-hidden="true" width="34" height="26" viewBox="0 0 34 26"><path d="M0 26V15C0 6 5 1 13 0l1 4C9 5 7 8 7 12h6v14zm20 0V15c0-9 5-14 13-15l1 4c-5 1-7 4-7 8h6v14z" fill="#11a2d7" /></svg>
                  <blockquote className="leading-relaxed text-[#26304d]">{r.quote}</blockquote>
                  <figcaption className="mt-auto flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal font-display font-bold text-white">{initials(r.handle.replace(/[@_]/g, " "))}</span>
                    <span className="flex flex-col"><span className="font-display font-bold">{r.handle}</span><span className="text-sm text-muted">{r.role}</span></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* HOW WE WORK */}
        <section className="bg-ice">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-20">
            <h2 className="h2 text-center">How we work with you</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, d], i) => (
                <div key={t} className="flex flex-col gap-2.5 rounded-2xl bg-white p-6">
                  <span className="font-display text-3xl font-extrabold text-cyan">0{i + 1}</span>
                  <span className="font-display text-lg font-bold">{t}</span>
                  <span className="text-[15px] leading-relaxed text-muted">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="flex flex-wrap items-center justify-between gap-7 rounded-3xl bg-royal p-8 text-white md:p-12">
            <div className="flex flex-[1_1_420px] flex-col gap-2.5">
              <h2 className="font-display text-3xl font-extrabold leading-tight">Have data, a research question or a project?</h2>
              <p className="text-lg text-ice">Tell us about it and get a clear quote. Students and researchers save 20%.</p>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/quote" className="btn-primary px-7 py-4">Request a Quote</Link>
              <a href={CONTACT.whatsappLink} className="inline-flex rounded-full bg-white px-7 py-4 font-display text-sm font-bold text-royal">WhatsApp Us</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
