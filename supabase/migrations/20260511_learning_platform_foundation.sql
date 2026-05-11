-- Arabic Enthusiast learning platform foundation
-- Apply in Supabase SQL editor after creating the project and enabling Auth.
-- Runtime code still uses the existing KV APIs until Supabase credentials are configured.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'tutor', 'admin')),
  arabic_name text,
  latin_name text,
  full_name text,
  email text,
  whatsapp_number text,
  timezone text not null default 'Asia/Beirut',
  preferred_ui_language text not null default 'en' check (preferred_ui_language in ('en', 'ar')),
  preferred_dialect_track text not null default 'msa' check (preferred_dialect_track in ('msa', 'levantine', 'both')),
  current_level text not null default 'A1',
  goals text,
  target_completion_date date,
  native_language text,
  languages_spoken text[] not null default '{}',
  lessons_completed integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_study_minutes integer not null default 0,
  last_active_at timestamptz,
  notification_settings jsonb not null default '{"email": true, "whatsapp": false, "push": true}'::jsonb,
  study_reminders jsonb not null default '{}'::jsonb,
  theme text not null default 'dark' check (theme in ('light', 'dark', 'system')),
  font_size text not null default 'normal' check (font_size in ('compact', 'normal', 'large')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.student_teacher_links (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tutor_id, student_id)
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  exercise_type text not null check (exercise_type in ('multiple_choice', 'fill_blank', 'listening', 'speaking', 'sentence_build', 'tracing', 'game', 'reading')),
  arabic_track text not null default 'msa' check (arabic_track in ('msa', 'levantine', 'both')),
  level text not null default 'A1',
  content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_slug text,
  exercise_type text not null,
  score numeric(5,2) check (score >= 0 and score <= 100),
  time_taken_seconds integer check (time_taken_seconds >= 0),
  mistakes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  term_ar text not null,
  term_en text,
  transliteration text,
  arabic_track text not null default 'msa' check (arabic_track in ('msa', 'levantine', 'both')),
  category text,
  source_id text,
  source_type text,
  interval_days integer not null default 0,
  ease_factor numeric(4,2) not null default 2.50,
  due_at timestamptz not null default now(),
  review_count integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vocabulary_cards_set_updated_at
before update on public.vocabulary_cards
for each row execute function public.set_updated_at();

create table if not exists public.mistake_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_type text not null,
  prompt text,
  expected_answer text,
  student_answer text,
  mistake_tags text[] not null default '{}',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'requested' check (status in ('requested', 'approved', 'scheduled', 'completed', 'cancelled', 'no_show')),
  attendance text check (attendance in ('present', 'late', 'absent', 'excused')),
  teacher_notes text,
  student_visible_summary text,
  calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lesson_sessions_set_updated_at
before update on public.lesson_sessions
for each row execute function public.set_updated_at();

create table if not exists public.payments_credits (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  entry_type text not null check (entry_type in ('payment', 'lesson_credit', 'lesson_deduction', 'free_credit', 'adjustment')),
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  lessons_delta integer not null default 0,
  free_lessons_delta integer not null default 0,
  reason text,
  external_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_notes (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'student')),
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger teacher_notes_set_updated_at
before update on public.teacher_notes
for each row execute function public.set_updated_at();

create table if not exists public.custom_assignments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  title text not null,
  instructions text,
  due_at timestamptz,
  status text not null default 'assigned' check (status in ('assigned', 'submitted', 'reviewed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger custom_assignments_set_updated_at
before update on public.custom_assignments
for each row execute function public.set_updated_at();

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  feature text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached boolean not null default false,
  estimated_cost_usd numeric(10,5),
  created_at timestamptz not null default now()
);

create table if not exists public.data_exports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'processing', 'ready', 'expired', 'failed')),
  storage_path text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_links_student on public.student_teacher_links(student_id);
create index if not exists idx_progress_student_created on public.progress_events(student_id, created_at desc);
create index if not exists idx_vocab_due on public.vocabulary_cards(student_id, due_at);
create index if not exists idx_mistakes_student_created on public.mistake_logs(student_id, created_at desc);
create index if not exists idx_sessions_student_start on public.lesson_sessions(student_id, starts_at desc);
create index if not exists idx_sessions_tutor_start on public.lesson_sessions(tutor_id, starts_at desc);
create index if not exists idx_ai_usage_student_created on public.ai_usage_logs(student_id, created_at desc);

create or replace function public.is_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('tutor', 'admin')
  );
$$;

create or replace function public.is_linked_tutor(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_teacher_links
    where tutor_id = auth.uid()
      and student_id = target_student
      and status = 'approved'
  );
$$;

alter table public.profiles enable row level security;
alter table public.student_teacher_links enable row level security;
alter table public.exercises enable row level security;
alter table public.progress_events enable row level security;
alter table public.vocabulary_cards enable row level security;
alter table public.mistake_logs enable row level security;
alter table public.lesson_sessions enable row level security;
alter table public.payments_credits enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.custom_assignments enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.data_exports enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select using (auth.uid() = id or public.is_tutor());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists links_tutor_manage on public.student_teacher_links;
create policy links_tutor_manage on public.student_teacher_links
for all using (auth.uid() = tutor_id or public.is_tutor())
with check (auth.uid() = tutor_id or public.is_tutor());

drop policy if exists links_student_read on public.student_teacher_links;
create policy links_student_read on public.student_teacher_links
for select using (auth.uid() = student_id or auth.uid() = tutor_id);

drop policy if exists exercises_read_active on public.exercises;
create policy exercises_read_active on public.exercises
for select using (is_active or public.is_tutor());

drop policy if exists exercises_tutor_manage on public.exercises;
create policy exercises_tutor_manage on public.exercises
for all using (public.is_tutor()) with check (public.is_tutor());

drop policy if exists progress_student_insert on public.progress_events;
create policy progress_student_insert on public.progress_events
for insert with check (auth.uid() = student_id);

drop policy if exists progress_student_and_tutor_read on public.progress_events;
create policy progress_student_and_tutor_read on public.progress_events
for select using (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor());

drop policy if exists vocab_student_manage on public.vocabulary_cards;
create policy vocab_student_manage on public.vocabulary_cards
for all using (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor())
with check (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor());

drop policy if exists mistakes_student_and_tutor on public.mistake_logs;
create policy mistakes_student_and_tutor on public.mistake_logs
for all using (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor())
with check (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor());

drop policy if exists sessions_student_and_tutor on public.lesson_sessions;
create policy sessions_student_and_tutor on public.lesson_sessions
for all using (auth.uid() = student_id or auth.uid() = tutor_id or public.is_tutor())
with check (auth.uid() = student_id or auth.uid() = tutor_id or public.is_tutor());

drop policy if exists payments_student_read_tutor_manage on public.payments_credits;
create policy payments_student_read_tutor_manage on public.payments_credits
for select using (auth.uid() = student_id or auth.uid() = tutor_id or public.is_tutor());

drop policy if exists payments_tutor_write on public.payments_credits;
create policy payments_tutor_write on public.payments_credits
for insert with check (auth.uid() = tutor_id or public.is_tutor());

drop policy if exists notes_student_tutor on public.teacher_notes;
create policy notes_student_tutor on public.teacher_notes
for select using (
  auth.uid() = tutor_id
  or public.is_tutor()
  or (auth.uid() = student_id and visibility = 'student')
);

drop policy if exists notes_tutor_manage on public.teacher_notes;
create policy notes_tutor_manage on public.teacher_notes
for all using (auth.uid() = tutor_id or public.is_tutor())
with check (auth.uid() = tutor_id or public.is_tutor());

drop policy if exists assignments_student_tutor on public.custom_assignments;
create policy assignments_student_tutor on public.custom_assignments
for all using (auth.uid() = student_id or auth.uid() = tutor_id or public.is_tutor())
with check (auth.uid() = student_id or auth.uid() = tutor_id or public.is_tutor());

drop policy if exists ai_usage_student_tutor_read on public.ai_usage_logs;
create policy ai_usage_student_tutor_read on public.ai_usage_logs
for select using (auth.uid() = student_id or public.is_linked_tutor(student_id) or public.is_tutor());

drop policy if exists exports_student_manage on public.data_exports;
create policy exports_student_manage on public.data_exports
for all using (auth.uid() = student_id or auth.uid() = requested_by or public.is_tutor())
with check (auth.uid() = student_id or auth.uid() = requested_by or public.is_tutor());
