-- ─────────────────────────────────────────────────────────────────────────────
-- Homework system
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/aojfgnpzfqkkvfdtaegd/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Homework assignments (tutor creates, student reads)
create table if not exists homework (
  id            uuid        primary key default gen_random_uuid(),
  tutor_id      uuid        references auth.users(id) on delete cascade,
  student_id    uuid        references auth.users(id) on delete cascade,
  title         text        not null,
  instructions  text        not null,
  due_date      date,
  created_at    timestamptz not null default now()
);

-- Submissions (student writes, AI gives feedback)
create table if not exists homework_submissions (
  id            uuid        primary key default gen_random_uuid(),
  homework_id   uuid        references homework(id) on delete cascade,
  student_id    uuid        references auth.users(id) on delete cascade,
  content       text        not null,
  ai_feedback   text,
  score         smallint    check (score between 0 and 100),
  submitted_at  timestamptz not null default now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table homework             enable row level security;
alter table homework_submissions enable row level security;

-- Students can read their own homework
create policy "student reads own homework"
  on homework for select
  using (auth.uid() = student_id);

-- Tutors can do everything on homework
create policy "tutor full access homework"
  on homework for all
  using (auth.uid() = tutor_id);

-- Students can read and insert their own submissions
create policy "student reads own submissions"
  on homework_submissions for select
  using (auth.uid() = student_id);

create policy "student inserts own submissions"
  on homework_submissions for insert
  with check (auth.uid() = student_id);

-- Tutors can read all submissions (service role used for this in the API)
-- The AI feedback column is written by the server-side API using the service role key

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_homework_student       on homework(student_id);
create index if not exists idx_homework_tutor         on homework(tutor_id);
create index if not exists idx_hw_submissions_hw      on homework_submissions(homework_id);
create index if not exists idx_hw_submissions_student on homework_submissions(student_id);
