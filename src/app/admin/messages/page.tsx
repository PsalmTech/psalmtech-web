import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageTitle, Empty } from "@/components/PortalShell";
import { fmtDate, initials } from "@/lib/format";

export default async function AdminMessages() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("messages").select("student_id, sender_id, body, created_at, read_at, profiles!messages_student_id_fkey(full_name)").order("created_at", { ascending: false }).limit(500);
  const threads = new Map<string, { name: string | null; last: string; at: string; unread: number }>();
  for (const m of data ?? []) {
    const t = threads.get(m.student_id) ?? { name: (m.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null, last: m.body, at: m.created_at, unread: 0 };
    if (m.sender_id !== user.id && !m.read_at) t.unread++;
    threads.set(m.student_id, t);
  }
  return (
    <>
      <PageTitle title="Messages" sub="Conversations with your students. To start a new one, open a student from the Students page." />
      {threads.size === 0 ? <Empty>No messages yet.</Empty> : (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
          {[...threads.entries()].map(([sid, t]) => (
            <Link key={sid} href={`/admin/messages/${sid}`} className="flex items-center gap-3.5 border-t border-line p-4 first:border-0 hover:bg-page">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal font-bold text-white">{initials(t.name)}</span>
              <span className="flex min-w-0 flex-1 flex-col"><span className="font-semibold">{t.name ?? "Student"}</span><span className="truncate text-sm text-muted">{t.last}</span></span>
              <span className="flex flex-col items-end gap-1"><span className="text-xs text-muted">{fmtDate(t.at, true)}</span>{t.unread > 0 && <span className="pill bg-cyan text-navy">{t.unread} new</span>}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
