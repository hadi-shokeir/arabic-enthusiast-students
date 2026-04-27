-- ─────────────────────────────────────────────────────────────────────────────
-- Student Data Restore — adds skill + lesson tracking columns to profiles
-- Run in: https://supabase.com/dashboard/project/aojfgnpzfqkkvfdtaegd/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Add missing columns to profiles ─────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS arabic_type        TEXT,   -- Levantine, Classical, Quranic, etc.
  ADD COLUMN IF NOT EXISTS student_level      TEXT,   -- Beginner, Intermediate, Advanced
  ADD COLUMN IF NOT EXISTS payment_plan       TEXT,   -- Per Lesson, Bundle, Monthly
  ADD COLUMN IF NOT EXISTS lesson_rate        NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lessons_total      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lessons_taken      INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_classes  INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid         NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS start_date         DATE,
  ADD COLUMN IF NOT EXISTS timezone           TEXT,
  ADD COLUMN IF NOT EXISTS gender             TEXT,
  ADD COLUMN IF NOT EXISTS nickname           TEXT,
  ADD COLUMN IF NOT EXISTS study_types        TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS focus_items        TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weekly_tasks       JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS learning_profile   JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_reading      SMALLINT DEFAULT 3 CHECK (skill_reading BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS skill_writing      SMALLINT DEFAULT 3 CHECK (skill_writing BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS skill_listening    SMALLINT DEFAULT 3 CHECK (skill_listening BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS skill_speaking     SMALLINT DEFAULT 3 CHECK (skill_speaking BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS skill_dialect_listening SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS skill_dialect_speaking  SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS skill_tajweed      SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS skill_makharij     SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS skill_hifz         SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS skill_tarteel      SMALLINT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS student_note       TEXT,
  ADD COLUMN IF NOT EXISTS teacher_summary    TEXT,
  ADD COLUMN IF NOT EXISTS teacher_strengths  TEXT,
  ADD COLUMN IF NOT EXISTS teacher_improve    TEXT;

-- ── RLS: tutors can update all profiles (for skill/lesson management) ────────
DROP POLICY IF EXISTS "tutor full access profiles" ON public.profiles;
CREATE POLICY "tutor full access profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'tutor'
    )
  );

-- ── Populate student data from old system ───────────────────────────────────

-- Ekaterina Sharamkina
UPDATE public.profiles SET
  arabic_type        = 'General Dialect',
  student_level      = 'Advanced',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 20,
  lessons_total      = 4,
  lessons_taken      = 3,
  remaining_classes  = 1,
  total_paid         = 80,
  start_date         = '2026-04-10',
  gender             = 'female',
  nickname           = 'Ustura',
  study_types        = ARRAY['classical','dialect'],
  skill_reading      = 4,
  skill_writing      = 3,
  skill_listening    = 4,
  skill_speaking     = 4,
  skill_dialect_listening = 2,
  skill_dialect_speaking  = 2,
  skill_tajweed      = 3,
  skill_makharij     = 3,
  skill_hifz         = 3,
  skill_tarteel      = 3,
  focus_items        = ARRAY['Listening to Dialect dialogue'],
  weekly_tasks       = '[{"id":"mo1xgwo8r3o5c","text":"Watch the movie \"West Beirut\"","assignedAt":"2026-04-16T20:24:28.520Z","doneAt":null},{"id":"mo1xl7hsdr6nc","text":"Listening to dialects and people speaking in Arabic: Series/movies/shows: 1. مرحبا دولة - Lebanese show/plays 2. باب الحارة (syrian) 3. Sarde after Dinner - Lebanese podcast 4. Chef Antoine (Lebanese Chef)","assignedAt":"2026-04-16T20:27:49.188Z","doneAt":null}]'::jsonb,
  enrolment_status   = 'active'
WHERE id = 'b14d409a-6682-4b8b-b16c-28511440a0a6';

-- Mohammed Tarzan
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Bundle',
  lesson_rate        = 20,
  lessons_total      = 5,
  lessons_taken      = 2,
  remaining_classes  = 3,
  total_paid         = 100,
  start_date         = '2026-04-10',
  gender             = 'male',
  phone              = '+1 (425) 269-1162',
  study_types        = ARRAY['classical','quran'],
  skill_reading      = 3,
  skill_writing      = 3,
  skill_listening    = 3,
  skill_speaking     = 3,
  skill_tajweed      = 3,
  skill_makharij     = 3,
  skill_hifz         = 3,
  skill_tarteel      = 3,
  enrolment_status   = 'active'
WHERE id = '97b1d728-b9de-47a8-b064-ddc7ada65793';

-- Shaylin Shahinzad
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 0,
  lessons_taken      = 0,
  remaining_classes  = 0,
  start_date         = '2026-04-14',
  gender             = 'female',
  timezone           = 'Europe/Berlin',
  study_types        = ARRAY['classical','dialect','quran'],
  skill_reading      = 1,
  skill_writing      = 1,
  skill_listening    = 2,
  skill_speaking     = 2,
  skill_dialect_listening = 2,
  skill_dialect_speaking  = 1,
  skill_tajweed      = 3,
  skill_makharij     = 3,
  teacher_strengths  = 'Stay consistent',
  teacher_improve    = 'Listening',
  enrolment_status   = 'active'
WHERE id = '60bebed4-dc22-4f1a-a154-bfc04c406c10';

-- Salma Mohamed
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 0,
  lessons_taken      = 0,
  remaining_classes  = 0,
  start_date         = '2026-04-18',
  gender             = 'female',
  timezone           = 'America/Chicago',
  study_types        = ARRAY['classical','dialect','quran'],
  skill_reading      = 3,
  skill_writing      = 3,
  skill_listening    = 3,
  skill_speaking     = 3,
  enrolment_status   = 'pending'
WHERE id = '7d094df7-c76a-478c-90f5-6a4ce43deb92';

-- Laura Kanso
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 0,
  lessons_taken      = 0,
  remaining_classes  = 0,
  start_date         = '2026-04-19',
  gender             = 'female',
  study_types        = ARRAY['quran'],
  skill_reading      = 3,
  skill_writing      = 3,
  skill_listening    = 3,
  skill_speaking     = 3,
  skill_tajweed      = 3,
  skill_makharij     = 3,
  skill_hifz         = 3,
  skill_tarteel      = 3,
  enrolment_status   = 'active'
WHERE id = '5e68ddf4-e001-452d-92bc-16c7b919cf57';

-- Hasnain Abbas
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 20,
  lessons_taken      = 5,
  remaining_classes  = 0,
  start_date         = '2026-04-19',
  gender             = 'male',
  study_types        = ARRAY['classical','quran','dialect'],
  skill_reading      = 1,
  skill_writing      = 1,
  skill_listening    = 1,
  skill_speaking     = 1,
  skill_dialect_listening = 1,
  skill_dialect_speaking  = 1,
  skill_tajweed      = 1,
  skill_makharij     = 1,
  skill_hifz         = 1,
  skill_tarteel      = 1,
  enrolment_status   = 'active'
WHERE id = 'a7dbb4e5-3a68-416f-bac6-9a5d85ee2823';

-- Syed Hussain Ali Shah
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 24,
  lessons_taken      = 2,
  remaining_classes  = 0,
  start_date         = '2026-04-21',
  gender             = 'male',
  study_types        = ARRAY['classical','quran'],
  skill_reading      = 1,
  skill_writing      = 1,
  skill_listening    = 1,
  skill_speaking     = 1,
  skill_dialect_listening = 3,
  skill_dialect_speaking  = 3,
  skill_tajweed      = 1,
  skill_makharij     = 2,
  skill_hifz         = 3,
  skill_tarteel      = 1,
  enrolment_status   = 'active'
WHERE id = 'fef1cf8d-419c-4f40-b502-96b1458780ff';

-- Carlos
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 0,
  lessons_total      = 0,
  lessons_taken      = 0,
  remaining_classes  = 0,
  start_date         = '2026-04-24',
  gender             = 'male',
  timezone           = 'America/New_York',
  study_types        = ARRAY['dialect'],
  skill_reading      = 3,
  skill_writing      = 3,
  skill_listening    = 3,
  skill_speaking     = 3,
  skill_dialect_listening = 1,
  skill_dialect_speaking  = 1,
  skill_tajweed      = 3,
  skill_makharij     = 3,
  skill_hifz         = 3,
  skill_tarteel      = 3,
  enrolment_status   = 'pending'
WHERE id = 'e92ca7a7-c2e3-473f-864e-35340b615376';

-- Ahmad Ayoub
UPDATE public.profiles SET
  arabic_type        = 'Levantine',
  student_level      = 'Beginner',
  payment_plan       = 'Per Lesson',
  lesson_rate        = 20,
  lessons_total      = 1,
  lessons_taken      = 1,
  remaining_classes  = 0,
  total_paid         = 20,
  start_date         = '2026-04-26',
  gender             = 'male',
  timezone           = 'America/New_York',
  phone              = '+1 (313) 829-3348',
  study_types        = ARRAY['classical','dialect','quran'],
  skill_reading      = 3,
  skill_writing      = 3,
  skill_listening    = 3,
  skill_speaking     = 3,
  enrolment_status   = 'active'
WHERE id = '3881e939-e9e9-4c3c-bc45-2ebe88035704';

-- ── Set Hadi's main account role to tutor ────────────────────────────────────
UPDATE public.profiles SET role = 'tutor'
WHERE id = '170a35f5-e720-4469-bbea-60720b07bc0e';
