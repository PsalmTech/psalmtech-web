"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") redirect("/portal");
  return supabase;
}
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const nOrNull = (v: string) => (v === "" ? null : Number(v));
const slugify = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
/** Lagos local "YYYY-MM-DDTHH:mm" from <input type=datetime-local> → ISO */
const lagosToIso = (v: string) => (v ? new Date(`${v}:00+01:00`).toISOString() : null);

// ---------- courses ----------
export async function createCourse(f: FormData) {
  const db = await admin();
  const title = s(f, "title");
  if (!title) return;
  const { data } = await db.from("courses").insert({ title, slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 5), summary: s(f, "summary") || null, published: false }).select("id").single();
  revalidatePath("/admin/courses");
  if (data) redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(f: FormData) {
  const db = await admin();
  const id = s(f, "id");
  const naira = s(f, "price_naira");
  await db.from("courses").update({
    title: s(f, "title"), slug: slugify(s(f, "slug") || s(f, "title")), summary: s(f, "summary") || null, description: s(f, "description") || null,
    price_kobo: naira === "" ? null : Math.round(Number(naira) * 100),
    discount_percent: Number(s(f, "discount_percent") || 0),
    duration: s(f, "duration") || null, mode: s(f, "mode") || null, next_cohort: s(f, "next_cohort") || null,
    cover_url: s(f, "cover_url") || null, published: f.get("published") === "on",
  }).eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${id}?saved=1`);
}

export async function deleteCourse(f: FormData) {
  const db = await admin();
  await db.from("courses").delete().eq("id", s(f, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/courses");
}

// ---------- modules & lessons ----------
export async function addModule(f: FormData) {
  const db = await admin();
  const course_id = s(f, "course_id");
  const { count } = await db.from("modules").select("id", { count: "exact", head: true }).eq("course_id", course_id);
  await db.from("modules").insert({ course_id, title: s(f, "title"), position: (count ?? 0) + 1 });
  revalidatePath(`/admin/courses/${course_id}`);
}
export async function renameModule(f: FormData) {
  const db = await admin();
  await db.from("modules").update({ title: s(f, "title"), position: Number(s(f, "position") || 0) }).eq("id", s(f, "id"));
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}
export async function deleteModule(f: FormData) {
  const db = await admin();
  await db.from("modules").delete().eq("id", s(f, "id"));
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}

export async function saveLesson(f: FormData) {
  const db = await admin();
  const row = {
    module_id: s(f, "module_id"), title: s(f, "title"), kind: s(f, "kind") || "reading",
    video_url: s(f, "video_url") || null, content: s(f, "content") || null, duration: s(f, "duration") || null,
    position: Number(s(f, "position") || 0),
    ...(s(f, "file_path") ? { file_path: s(f, "file_path") } : {}),
  };
  const id = s(f, "id");
  if (id) await db.from("lessons").update(row).eq("id", id);
  else await db.from("lessons").insert(row);
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}
export async function deleteLesson(f: FormData) {
  const db = await admin();
  const { data } = await db.from("lessons").select("file_path").eq("id", s(f, "id")).single();
  if (data?.file_path) await db.storage.from("materials").remove([data.file_path]);
  await db.from("lessons").delete().eq("id", s(f, "id"));
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}

// ---------- assignments & announcements ----------
export async function saveAssignment(f: FormData) {
  const db = await admin();
  const row = {
    course_id: s(f, "course_id"), title: s(f, "title"), instructions: s(f, "instructions") || null,
    kind: s(f, "kind") || "assignment", due_at: lagosToIso(s(f, "due_at")), max_score: nOrNull(s(f, "max_score")) ?? 100,
  };
  const id = s(f, "id");
  if (id) await db.from("assignments").update(row).eq("id", id);
  else await db.from("assignments").insert(row);
  revalidatePath(`/admin/courses/${row.course_id}`);
}
export async function deleteAssignment(f: FormData) {
  const db = await admin();
  await db.from("assignments").delete().eq("id", s(f, "id"));
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}
export async function postAnnouncement(f: FormData) {
  const db = await admin();
  if (!s(f, "body")) return;
  await db.from("announcements").insert({ course_id: s(f, "course_id"), body: s(f, "body") });
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}
export async function deleteAnnouncement(f: FormData) {
  const db = await admin();
  await db.from("announcements").delete().eq("id", s(f, "id"));
  revalidatePath(`/admin/courses/${s(f, "course_id")}`);
}

// ---------- grading ----------
export async function gradeSubmission(f: FormData) {
  const db = await admin();
  await db.from("submissions").update({ score: Number(s(f, "score")), feedback: s(f, "feedback") || null, graded_at: new Date().toISOString() }).eq("id", s(f, "id"));
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

// ---------- students ----------
export async function enrolStudent(f: FormData) {
  const db = await admin();
  await db.from("enrollments").upsert({ user_id: s(f, "user_id"), course_id: s(f, "course_id"), status: "active", amount_kobo: nOrNull(s(f, "amount_naira")) == null ? null : Math.round(Number(s(f, "amount_naira")) * 100), paystack_ref: "manual" }, { onConflict: "user_id,course_id" });
  revalidatePath("/admin/students");
}
export async function setEnrolmentStatus(f: FormData) {
  const db = await admin();
  await db.from("enrollments").update({ status: s(f, "status") }).eq("id", s(f, "id"));
  revalidatePath("/admin/students");
}

// ---------- quotes ----------
export async function setQuoteStatus(f: FormData) {
  const db = await admin();
  await db.from("quotes").update({ status: s(f, "status") }).eq("id", s(f, "id"));
  revalidatePath("/admin/quotes");
}
