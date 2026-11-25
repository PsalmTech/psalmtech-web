import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/PortalShell";
import Chat, { type Msg } from "@/components/Chat";
import { CONTACT } from "@/lib/format";

export default async function MessagesPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("messages").select("*").eq("student_id", user.id).order("created_at").limit(300);
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("student_id", user.id).neq("sender_id", user.id).is("read_at", null);
  return (
    <>
      <PageTitle title="Messages" sub="Chat directly with your instructor, Samuel Ojeleke." action={<a href={CONTACT.whatsappLink} className="btn-outline">Urgent? WhatsApp</a>} />
      <Chat studentId={user.id} meId={user.id} initial={(data as Msg[]) ?? []} otherName="your instructor" />
    </>
  );
}
