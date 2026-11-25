"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";
import { priceFor } from "@/lib/format";

export async function enrol(formData: FormData) {
  const slug = String(formData.get("slug"));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/signup?next=/courses/${slug}`);

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single();
  if (!course) redirect("/courses");

  const { data: existing } = await supabase.from("enrollments").select("status").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
  if (existing?.status === "active") redirect(`/portal/courses/${slug}`);

  if (course.price_kobo == null) redirect(`/courses/${slug}?closed=1`);

  if (course.price_kobo === 0) {
    await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id, status: "active", amount_kobo: 0 });
    redirect(`/portal/courses/${slug}`);
  }

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  const amount = priceFor(course.price_kobo, course.discount_percent, profile?.user_type);
  const reference = `PT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const db = createAdminClient();
  await db.from("payments").insert({ user_id: user.id, course_id: course.id, reference, amount_kobo: amount });

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  let url: string;
  try {
    const tx = await initializeTransaction({
      email: user.email!, amountKobo: amount, reference,
      callbackUrl: `${origin}/api/paystack/callback`,
      metadata: { user_id: user.id, course_id: course.id, course: course.title },
    });
    url = tx.authorization_url;
  } catch {
    redirect(`/courses/${slug}?payerror=1`);
  }
  redirect(url);
}
