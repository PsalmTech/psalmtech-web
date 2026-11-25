"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Msg = { id: string; student_id: string; sender_id: string; body: string; created_at: string };

export default function Chat({ studentId, meId, initial, otherName }: { studentId: string; meId: string; initial: Msg[]; otherName: string }) {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    const ch = supabase
      .channel(`chat-${studentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `student_id=eq.${studentId}` },
        (p) => setMsgs((m) => (m.some((x) => x.id === (p.new as Msg).id) ? m : [...m, p.new as Msg])))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [studentId, supabase]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText(""); setErr(null);
    const { data, error } = await supabase.from("messages").insert({ student_id: studentId, sender_id: meId, body }).select().single();
    if (error) { setErr("Message not sent. Please try again."); setText(body); return; }
    setMsgs((m) => (m.some((x) => x.id === data.id) ? m : [...m, data as Msg]));
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
        {msgs.length === 0 && <p className="py-10 text-center text-muted">No messages yet. Say hello to {otherName}!</p>}
        {msgs.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${mine ? "rounded-br-md bg-royal text-white" : "rounded-bl-md bg-page"}`}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? "text-ice" : "text-muted"}`}>{new Date(m.created_at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex gap-3 border-t border-line p-3">
        <label className="sr-only" htmlFor="chat-input">Message</label>
        <textarea id="chat-input" value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder={`Message ${otherName}…`}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement).requestSubmit(); } }}
          className="input flex-1 resize-none" />
        <button className="btn-primary">Send</button>
      </form>
      {err && <p role="alert" className="px-4 pb-3 text-sm text-red-700">{err}</p>}
    </div>
  );
}
