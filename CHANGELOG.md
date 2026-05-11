# Changelog

## 2026-05-11

- Added `/demo`, a guest learning demo with local-only progress, TTS playback, immediate feedback, and a soft signup prompt after two completed exercises.
- Added `/demo/portal`, a full student portal preview with dashboard, exercises, SRS vocabulary, booking, and teacher feedback panels.
- Added landing-page CTAs for "Try Without Signing Up" and "Student Portal Demo".
- Added Vercel rewrites for the demo routes.
- Expanded the PWA service worker cache to include portal and demo surfaces.
- Added PWA shortcuts for the portal and guest demo.
- Added a mobile responsive safety layer for the landing page and touch-friendly controls.
- Added versioned AI prompt files under `prompts/`.
- Updated `/api/ai` with prompt loading, server-side input sanitization, light rate limiting, selected response caching, usage logging, and configurable Anthropic model defaults.
- Updated `/api/tutor` with input sanitization and configurable fast model selection.
- Added a normalized Supabase migration for profiles, teacher/student links, exercises, progress events, vocabulary SRS, mistake logs, sessions, credits/payments, notes, assignments, AI usage logs, and data exports.
- Added `docs/AUDIT.md` and `docs/API.md`.

Notes:

- Runtime data is still preserved through the existing KV-backed APIs in this branch.
- Newly generated Arabic demo content should be reviewed by Hadi before becoming official curriculum.
