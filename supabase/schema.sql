-- PsalmTech Solutions — database schema
-- Run this whole file once in Supabase: SQL Editor → New query → paste → Run.

create extension if not exists pgcrypto;

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  user_type text check (user_type in ('student','researcher','professional','organisation')) default 'student',
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- create a profile automatically when someone signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    coalesce(nullif(new.raw_user_meta_data->>'user_type',''), 'student')
  );
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- students can't make themselves admin
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ============ COURSES ============
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  description text,
  price_kobo integer,                 -- null = price not set yet (registration closed)
  discount_percent integer not null default 20,
  cover_url text,
  duration text,
  mode text,
  next_cohort text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  kind text not null default 'video' check (kind in ('video','reading','file')),
  video_url text,
  content text,
  file_path text,                     -- path inside the "materials" storage bucket
  duration text,
  position integer not null default 0
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','pending','cancelled')),
  amount_kobo integer,
  paystack_ref text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create or replace function public.is_enrolled(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.enrollments
    where user_id = auth.uid() and course_id = c and status = 'active');
$$;

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  instructions text,
  kind text not null default 'assignment' check (kind in ('assignment','quiz','project')),
  due_at timestamptz,
  max_score numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_paths text[] not null default '{}',
  note text,
  submitted_at timestamptz not null default now(),
  score numeric,
  feedback text,
  graded_at timestamptz,
  unique (assignment_id, user_id)
);

-- students can't grade themselves
create or replace function public.protect_grades() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.score := null; new.feedback := null; new.graded_at := null;
    else
      new.score := old.score; new.feedback := old.feedback; new.graded_at := old.graded_at;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists submissions_protect on public.submissions;
create trigger submissions_protect before insert or update on public.submissions
  for each row execute function public.protect_grades();

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  client_type text,
  service text,
  message text not null,
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,  -- the conversation
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  reference text unique not null,
  amount_kobo integer not null,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ============ ROW-LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.quotes enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;

-- profiles
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- courses & modules: anyone sees published ones; admin manages
drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses for select using (published or public.is_admin());
drop policy if exists "courses admin" on public.courses;
create policy "courses admin" on public.courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "modules read" on public.modules;
create policy "modules read" on public.modules for select using (
  public.is_admin() or exists (select 1 from public.courses c where c.id = course_id and c.published));
drop policy if exists "modules admin" on public.modules;
create policy "modules admin" on public.modules for all using (public.is_admin()) with check (public.is_admin());

-- lessons: full content only for enrolled students + admin
drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons for select using (
  public.is_admin() or exists (select 1 from public.modules m where m.id = module_id and public.is_enrolled(m.course_id)));

-- public course outline: lesson titles only (no videos/notes/files)
create or replace view public.lesson_outline as
  select l.id, l.module_id, l.title, l.position
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.published;
grant select on public.lesson_outline to anon, authenticated;
drop policy if exists "lessons admin" on public.lessons;
create policy "lessons admin" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

-- enrollments: own + admin; free courses can be self-enrolled; paid ones only via payment (service role)
drop policy if exists "enrollments read" on public.enrollments;
create policy "enrollments read" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "enrollments free self" on public.enrollments;
create policy "enrollments free self" on public.enrollments for insert with check (
  user_id = auth.uid() and status = 'active' and
  exists (select 1 from public.courses c where c.id = course_id and c.published and c.price_kobo = 0));
drop policy if exists "enrollments admin" on public.enrollments;
create policy "enrollments admin" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

-- progress
drop policy if exists "progress own" on public.lesson_progress;
create policy "progress own" on public.lesson_progress for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- assignments
drop policy if exists "assignments read" on public.assignments;
create policy "assignments read" on public.assignments for select using (public.is_admin() or public.is_enrolled(course_id));
drop policy if exists "assignments admin" on public.assignments;
create policy "assignments admin" on public.assignments for all using (public.is_admin()) with check (public.is_admin());

-- submissions
drop policy if exists "submissions read" on public.submissions;
create policy "submissions read" on public.submissions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "submissions insert own" on public.submissions;
create policy "submissions insert own" on public.submissions for insert with check (
  user_id = auth.uid() and exists (select 1 from public.assignments a where a.id = assignment_id and public.is_enrolled(a.course_id)));
drop policy if exists "submissions update" on public.submissions;
create policy "submissions update" on public.submissions for update using (
  public.is_admin() or (user_id = auth.uid() and score is null));

-- announcements
drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select using (public.is_admin() or public.is_enrolled(course_id));
drop policy if exists "announcements admin" on public.announcements;
create policy "announcements admin" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- quotes: anyone can send, only admin reads
drop policy if exists "quotes insert" on public.quotes;
create policy "quotes insert" on public.quotes for insert with check (status = 'new');
drop policy if exists "quotes admin" on public.quotes;
create policy "quotes admin" on public.quotes for all using (public.is_admin()) with check (public.is_admin());

-- messages: a student's thread is visible to that student and the admin
drop policy if exists "messages read" on public.messages;
create policy "messages read" on public.messages for select using (student_id = auth.uid() or public.is_admin());
drop policy if exists "messages send" on public.messages;
create policy "messages send" on public.messages for insert with check (
  sender_id = auth.uid() and (student_id = auth.uid() or public.is_admin()));
drop policy if exists "messages mark read" on public.messages;
create policy "messages mark read" on public.messages for update using (student_id = auth.uid() or public.is_admin());

-- payments: read own; written by the server with the service key
drop policy if exists "payments read" on public.payments;
create policy "payments read" on public.payments for select using (user_id = auth.uid() or public.is_admin());

-- ============ REALTIME (live chat) ============
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

-- ============ FILE STORAGE ============
insert into storage.buckets (id, name, public) values ('materials', 'materials', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('submissions', 'submissions', false) on conflict (id) do nothing;

-- materials/<course_id>/<file>: admin uploads; enrolled students download
drop policy if exists "materials admin" on storage.objects;
create policy "materials admin" on storage.objects for all
  using (bucket_id = 'materials' and public.is_admin()) with check (bucket_id = 'materials' and public.is_admin());
drop policy if exists "materials enrolled read" on storage.objects;
create policy "materials enrolled read" on storage.objects for select
  using (bucket_id = 'materials' and public.is_enrolled(((storage.foldername(name))[1])::uuid));

-- submissions/<user_id>/<assignment_id>/<file>: students upload to their own folder; admin reads all
drop policy if exists "submissions upload own" on storage.objects;
create policy "submissions upload own" on storage.objects for insert
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "submissions read own" on storage.objects;
create policy "submissions read own" on storage.objects for select
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "submissions replace own" on storage.objects;
create policy "submissions replace own" on storage.objects for update
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
