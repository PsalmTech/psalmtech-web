import { NextResponse, type NextRequest } from "next/server";
import { fulfilPayment } from "@/lib/paystack";

// Paystack sends the student back here after paying.
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");
  const url = req.nextUrl.clone();
  url.search = "";
  if (!reference) { url.pathname = "/portal/payments"; return NextResponse.redirect(url); }
  const r = await fulfilPayment(reference);
  if (r.ok && r.courseSlug) { url.pathname = `/portal/courses/${r.courseSlug}`; url.searchParams.set("welcome", "1"); }
  else { url.pathname = "/portal/payments"; url.searchParams.set("status", "unconfirmed"); }
  return NextResponse.redirect(url);
}
