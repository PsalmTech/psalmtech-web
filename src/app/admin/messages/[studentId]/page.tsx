import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { PageTitle } from "@/components/PortalShell";
import Chat, { type Msg } from "@/components/Chat";

export default async function Thread({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const { supabase, user } = await requireAdmin();
  const { data: student } = await supabase.from("profiles").select("full_name, phone").eq("id", studentId).single();
  if (!student) notFound();
  const { data } = await supabase.from("messages").select("*").eq("student_id", studentId).order("created_at").limit(300);
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("student_id", studentId).neq("sender_id", user.id).is("read_at", null);
  return (
    <>
      <div className="text-sm text-muted"><Link href="/admin/messages" className="text-royal">Messages</Link> / {student.full_name}</div>
      <PageTitle title={student.full_name ?? "Student"} sub={student.phone ?? undefined} />
      <Chat studentId={studentId} meId={user.id} initial={(data as Msg[]) ?? []} otherName={student.full_name?.split(" ")[0] ?? "the student"} />
    </>
  );
}
