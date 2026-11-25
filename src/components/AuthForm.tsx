"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon, Logo } from "./icons";
import { CONTACT } from "@/lib/format";

const BENEFITS = [
  "Learn at your pace with lessons, videos and downloadable materials",
  "Submit assignments and get personal feedback from your instructor",
  "Track your progress, grades and results in one dashboard",
  "Chat directly with your instructor whenever you're stuck",
];

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? "That sign-in link didn't work. Please try again." : null);
  const [checkEmail, setCheckEmail] = useState(false);
  const supabase = createClient();
  const callback = () => `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    if (mode === "signup") {
      if (password.length < 8) { setError("Password must be at least 8 characters."); setBusy(false); return; }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: callback(),
          data: { full_name: String(f.get("full_name")).trim(), phone: String(f.get("phone")).trim(), user_type: String(f.get("user_type")) },
        },
      });
      if (error) { setError(error.message); setBusy(false); return; }
      if (!data.session) { setCheckEmail(true); setBusy(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Incorrect email or password."); setBusy(false); return; }
    }
    router.replace(next || "/portal");
    router.refresh();
  }

  async function google() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) setError("Google sign-in isn't available yet. Please use email and password.");
  }

  async function forgot() {
    const email = (document.getElementById("email") as HTMLInputElement | null)?.value.trim();
    if (!email) { setError("Type your email address first, then click “Forgot password?”."); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/portal/profile` });
    setError(null); alertBox("If that email has an account, a reset link is on its way.");
  }
  const [notice, setNotice] = useState<string | null>(null);
  function alertBox(m: string) { setNotice(m); }

  return (
    <div className="flex min-h-screen flex-wrap bg-page">
      <div className="relative flex flex-[1_1_520px] flex-col gap-10 overflow-hidden bg-royal p-8 text-white md:p-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/class3.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
        <Link href="/" className="relative" aria-label="Back to home"><Logo dark sub="ACADEMY" /></Link>
        <div className="relative mt-auto flex max-w-[520px] flex-col gap-5">
          <p className="font-display text-sm font-bold tracking-[3px] text-ice">STUDENT PORTAL</p>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">Learn. Build. <span className="text-cyan">Grow.</span></h1>
          <p className="text-[17px] leading-relaxed text-ice">One account for all your PsalmTech trainings, starting with Data Analytics with Power BI.</p>
          <ul className="flex flex-col gap-3.5">
            {BENEFITS.map((b) => <li key={b} className="flex items-start gap-3 leading-relaxed"><Icon name="check" size={22} className="mt-0.5 shrink-0 text-cyan" />{b}</li>)}
          </ul>
        </div>
        <a href={CONTACT.whatsappLink} className="relative text-sm text-ice">Need help? WhatsApp {CONTACT.whatsapp}</a>
      </div>

      <div className="flex flex-[1_1_480px] items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-[460px] flex-col gap-5 rounded-3xl border border-line bg-white p-8 shadow-[0_20px_50px_rgba(19,26,47,0.08)]">
          <div className="grid grid-cols-2 rounded-full bg-ice p-1.5">
            <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={`rounded-full p-3 text-center font-bold ${mode === "signup" ? "bg-white shadow-sm" : ""}`}>Create account</Link>
            <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={`rounded-full p-3 text-center font-bold ${mode === "login" ? "bg-white shadow-sm" : ""}`}>Log in</Link>
          </div>

          {checkEmail ? (
            <div role="status" className="flex flex-col gap-3 py-4">
              <h2 className="font-display text-2xl font-extrabold">Check your email</h2>
              <p className="text-muted">We sent you a confirmation link. Click it to activate your account, then you&apos;ll land in your dashboard.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-extrabold">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
                <p className="text-sm text-muted">{mode === "signup" ? "It takes less than a minute." : "Log in to continue learning."}</p>
              </div>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {notice && <p role="status" className="rounded-xl bg-ice p-3 text-sm text-royal">{notice}</p>}
              {mode === "signup" && (
                <>
                  <label className="label">Full name<input name="full_name" required autoComplete="name" className="input" placeholder="e.g. Ada Okoro" /></label>
                </>
              )}
              <label className="label">Email address<input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" /></label>
              {mode === "signup" && (
                <>
                  <label className="label">WhatsApp number<input name="phone" type="tel" autoComplete="tel" className="input" placeholder="+234 …" /></label>
                  <label className="label">I am a
                    <select name="user_type" className="input" defaultValue="student">
                      <option value="student">Student</option><option value="researcher">Researcher</option>
                      <option value="professional">Working professional</option><option value="organisation">School / Organisation</option>
                    </select>
                  </label>
                </>
              )}
              <label className="label">Password<input name="password" type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} className="input" placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} /></label>
              {mode === "login" && <button type="button" onClick={forgot} className="self-end text-sm font-semibold text-royal">Forgot password?</button>}
              {mode === "signup" && <p className="text-sm text-muted">By creating an account you agree to our terms and privacy policy.</p>}
              <button disabled={busy} className="btn-primary py-4">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}</button>
            </form>
          )}

          <div className="flex items-center gap-3 text-sm text-muted"><div className="h-px flex-1 bg-line" />or<div className="h-px flex-1 bg-line" /></div>
          <button type="button" onClick={google} className="flex items-center justify-center gap-2.5 rounded-full border-[1.5px] border-[#cfd8ea] p-3.5 font-semibold">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" /></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
