import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course } from "./courses";

export type Assignment = { id: string; course_id: string; title: string; instructions: string | null; kind: string; due_at: string | null; max_score: number };
export type Submission = { id: string; assignment_id: string; user_id: string; file_paths: string[]; note: string | null; submitted_at: string; score: number | null; feedback: string | null; graded_at: string | null };

/** Everything a student's pages need, in a few queries. */
export async function getStudentData(supabase: SupabaseClient, userId: string) {
  const { data: enr } = await supabase.from("enrollments").select("course_id, status, created_at, courses(*)").eq("user_id", userId).eq("status", "active");
  const courses = ((enr ?? []).map((e) => e.courses).filter(Boolean) as unknown as Course[]);
  const ids = courses.map((c) => c.id);
  if (ids.length === 0) return { courses, assignments: [] as Assignment[], submissions: [] as Submission[], progress: {} as Record<string, { done: number; total: number }> };

  const [{ data: assignments }, { data: submissions }, { data: mods }, { data: prog }] = await Promise.all([
    supabase.from("assignments").select("*").in("course_id", ids).order("due_at", { ascending: true, nullsFirst: false }),
    supabase.from("submissions").select("*").eq("user_id", userId),
    supabase.from("modules").select("course_id, lessons(id)").in("course_id", ids),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId),
  ]);
  const doneSet = new Set((prog ?? []).map((p) => p.lesson_id));
  const progress: Record<string, { done: number; total: number }> = {};
  for (const m of mods ?? []) {
    const p = (progress[m.course_id] ??= { done: 0, total: 0 });
    for (const l of (m.lessons as { id: string }[]) ?? []) { p.total++; if (doneSet.has(l.id)) p.done++; }
  }
  return { courses, assignments: (assignments ?? []) as Assignment[], submissions: (submissions ?? []) as Submission[], progress };
}

export function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

/** Average percentage across graded work (each task weighted by its max score). */
export function averageGrade(assignments: Assignment[], submissions: Submission[]) {
  let got = 0, max = 0, n = 0;
  for (const s of submissions) {
    if (s.score == null) continue;
    const a = assignments.find((x) => x.id === s.assignment_id);
    if (!a) continue;
    got += Number(s.score); max += Number(a.max_score); n++;
  }
  return { percent: max ? Math.round((got / max) * 100) : null, graded: n };
}

export function statusOf(a: { due_at: string | null }, s?: { score: number | null }) {
  if (s?.score != null) return "graded";
  if (s) return "submitted";
  if (a.due_at && new Date(a.due_at).getTime() < Date.now()) return "overdue";
  return "pending";
}

