import type { SupabaseClient } from "@supabase/supabase-js";

export type Lesson = { id: string; module_id: string; title: string; kind: "video" | "reading" | "file"; video_url: string | null; content: string | null; file_path: string | null; duration: string | null; position: number };
export type ModuleWithLessons = { id: string; title: string; position: number; lessons: Lesson[] };

export async function getCourseContent(supabase: SupabaseClient, courseId: string) {
  const { data } = await supabase.from("modules").select("id,title,position,lessons(*)").eq("course_id", courseId).order("position");
  return ((data as ModuleWithLessons[]) ?? []).map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.position - b.position) }));
}

/** Only enrolled students (or the admin) may open course content. */
export async function canAccessCourse(supabase: SupabaseClient, userId: string, courseId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  const { data } = await supabase.from("enrollments").select("status").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  return data?.status === "active";
}

/** Turns a YouTube / Vimeo / Google Drive link into an embeddable URL. */
export function embedUrl(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean).pop()}`;
    if (u.hostname.includes("drive.google.com")) return url.replace(/\/view.*$/, "/preview");
    return url;
  } catch {
    return null;
  }
}
