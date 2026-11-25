import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/PortalShell";
import { SectionCard } from "@/components/ui";
import PasswordForm from "./PasswordForm";

async function saveProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const allowed = ["student", "researcher", "professional", "organisation"];
  const ut = String(formData.get("user_type"));
  await supabase.from("profiles").update({
    full_name: String(formData.get("full_name")).trim().slice(0, 120),
    phone: String(formData.get("phone")).trim().slice(0, 40),
    user_type: allowed.includes(ut) ? ut : "student",
  }).eq("id", user.id);
  revalidatePath("/portal", "layout");
  redirect("/portal/profile?saved=1");
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { user, profile } = await requireUser();
  return (
    <>
      <PageTitle title="Profile" sub={user.email ?? ""} />
      <div className="flex flex-wrap items-start gap-6">
        <SectionCard title="Your details" className="flex-[1_1_420px]">
          {saved && <p role="status" className="rounded-xl bg-[#dff5ea] p-3 text-sm text-[#14724d]">Saved.</p>}
          <form action={saveProfile} className="flex flex-col gap-4">
            <label className="label">Full name<input name="full_name" defaultValue={profile?.full_name ?? ""} required className="input" /></label>
            <label className="label">WhatsApp number<input name="phone" defaultValue={profile?.phone ?? ""} className="input" /></label>
            <label className="label">I am a
              <select name="user_type" defaultValue={profile?.user_type ?? "student"} className="input">
                <option value="student">Student</option><option value="researcher">Researcher</option><option value="professional">Working professional</option><option value="organisation">School / Organisation</option>
              </select>
            </label>
            <button className="btn-primary self-start">Save changes</button>
          </form>
        </SectionCard>
        <SectionCard title="Change password" className="flex-[1_1_360px]"><PasswordForm /></SectionCard>
      </div>
    </>
  );
}
