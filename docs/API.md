# Serverless API Notes

The app is currently a static Vercel deployment with serverless functions in `api/`. Production persistence is still KV/Upstash-style storage through `KV_REST_API_URL` or `UPSTASH_REDIS_REST_URL`.

## Auth

- `POST /api/auth` handles custom email/password login and signup requests.
- Session tokens are stored in KV and validated server-side.
- Tutor approval is managed through `/api/users`.
- No API key is exposed to the browser.

## Data

- `GET/POST /api/data` reads and writes the tutor/student data blob.
- Existing integrations such as scheduling, notifications, and lesson deductions still call the same KV-backed endpoints.
- The Supabase migration in `supabase/migrations/20260511_learning_platform_foundation.sql` is ready for the next persistence phase, but runtime code does not switch to Supabase until credentials and migration testing are done.

## AI

- `POST /api/ai` proxies Anthropic calls server-side.
- `POST /api/tutor` powers the student tutor chat endpoint.
- Prompt templates now live in `prompts/`.
- Model defaults:
  - Fast feedback: `ANTHROPIC_FAST_MODEL` or `claude-haiku-4-5-20251001`
  - Complex planning: `ANTHROPIC_COMPLEX_MODEL` or `claude-opus-4-7`
- Inputs are sanitized server-side before being sent to Anthropic.
- `/api/ai` has a light per-session rate limit, cache support for common low-stakes calls, and KV usage logging in the `ai_usage` list.

## Demo Modes

- `/demo` is a guest lesson demo. Progress is stored only in `localStorage`.
- `/demo/portal` is a fake student portal preview. It does not persist real data and does not call paid APIs.
