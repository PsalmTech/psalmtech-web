"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p1 = String(f.get("p1")), p2 = String(f.get("p2"));
    if (p1.length < 8) return setMsg({ ok: false, t: "Use at least 8 characters." });
    if (p1 !== p2) return setMsg({ ok: false, t: "Passwords don't match." });
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setMsg(error ? { ok: false, t: error.message } : { ok: true, t: "Password updated." });
    if (!error) e.currentTarget.reset();
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-[#dff5ea] text-[#14724d]" : "bg-red-50 text-red-700"}`}>{msg.t}</p>}
      <label className="label">New password<input name="p1" type="password" autoComplete="new-password" className="input" /></label>
      <label className="label">Confirm new password<input name="p2" type="password" autoComplete="new-password" className="input" /></label>
      <button className="btn-outline self-start">Update password</button>
    </form>
  );
}
