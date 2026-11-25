import { createClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  price_kobo: number | null;
  discount_percent: number;
  cover_url: string | null;
  duration: string | null;
  mode: string | null;
  next_cohort: string | null;
  published: boolean;
};

/** Published courses for public pages. Never throws (site still renders if the database is unreachable). */
export async function getPublishedCourses(): Promise<Course[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("courses").select("*").eq("published", true).order("created_at");
    return (data as Course[]) ?? [];
  } catch {
    return [];
  }
}
