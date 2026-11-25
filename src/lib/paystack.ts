import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

const API = "https://api.paystack.co";

function key() {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return k;
}

export async function initializeTransaction(args: {
  email: string; amountKobo: number; reference: string; callbackUrl: string; metadata: Record<string, unknown>;
}) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: args.email, amount: args.amountKobo, currency: "NGN",
      reference: args.reference, callback_url: args.callbackUrl, metadata: args.metadata,
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message || "Paystack initialize failed");
  return json.data as { authorization_url: string; reference: string };
}

/**
 * Confirms a payment with Paystack and, if valid, activates the student's enrolment.
 * Safe to call more than once (callback + webhook).
 */
export async function fulfilPayment(reference: string): Promise<{ ok: boolean; courseSlug?: string }> {
  const db = createAdminClient();
  const { data: payment } = await db.from("payments").select("*, courses(slug)").eq("reference", reference).single();
  if (!payment) return { ok: false };
  const courseSlug = (payment.courses as unknown as { slug: string } | null)?.slug;
  if (payment.status === "success") return { ok: true, courseSlug };

  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key()}` }, cache: "no-store",
  });
  const json = await res.json();
  const d = json?.data;
  const valid = json?.status && d?.status === "success" && d?.currency === "NGN" && Number(d?.amount) >= payment.amount_kobo;
  if (!valid) {
    if (d?.status === "failed" || d?.status === "abandoned") await db.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return { ok: false, courseSlug };
  }
  await db.from("payments").update({ status: "success", paid_at: new Date().toISOString() }).eq("id", payment.id);
  await db.from("enrollments").upsert(
    { user_id: payment.user_id, course_id: payment.course_id, status: "active", amount_kobo: payment.amount_kobo, paystack_ref: reference },
    { onConflict: "user_id,course_id" }
  );
  return { ok: true, courseSlug };
}
