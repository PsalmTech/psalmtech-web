import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
  role: "student" | "admin";
  created_at: string;
};

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as Profile | null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { supabase, user, profile: profile as Profile | null };
}

export async function requireUser() {
  const s = await getSession();
  if (!s.user) redirect("/login");
  return s as typeof s & { user: NonNullable<typeof s.user> };
}

export async function requireAdmin() {
  const s = await requireUser();
  if (s.profile?.role !== "admin") redirect("/portal");
  return s;
}
