import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { fulfilPayment } from "@/lib/paystack";

// Paystack calls this in the background, even if the student closes the browser after paying.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(raw).digest("hex");
  const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ ok: false }, { status: 401 });

  const event = JSON.parse(raw);
  if (event?.event === "charge.success" && event?.data?.reference) {
    await fulfilPayment(event.data.reference);
  }
  return NextResponse.json({ ok: true });
}
