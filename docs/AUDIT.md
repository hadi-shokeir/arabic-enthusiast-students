# Current Codebase Audit

## Stack

Arabic Enthusiast is currently deployed as a static Vercel app. The landing page and portal use browser-loaded React plus Babel/JSX files from `public/`; there is no active Next.js runtime or Tailwind build step in `package.json`.

## File Structure

- `public/index.html`: landing shell.
- `public/pages/*.jsx`: landing pages.
- `public/components.jsx`, `public/data.js`, `public/site-content.js`: shared landing data/components.
- `public/portal.html`: large all-in-one portal application.
- `api/*.js`: Vercel serverless endpoints.
- `public/manifest.json`, `public/sw.js`: PWA assets.
- `supabase/schema.sql`: older draft Supabase schema.

## Routing

Routing is handled by Vercel rewrites and client-side state. `/portal` maps to `portal.html`; non-API routes fall back to `index.html`. New demo routes map to `demo.html` and `demo-portal.html`.

## State Management

The client uses React state and browser storage. The portal also syncs data through custom serverless APIs. There is no Zustand/Redux layer.

## Database And Storage

Runtime storage uses KV/Upstash REST variables. Supabase exists only as schema documentation/migration material and is not yet the live database.

## Authentication

Authentication is custom email/password auth backed by KV sessions. Students require tutor approval. Google OAuth and Supabase Auth are not active yet.

## AI

Anthropic calls are proxied through `/api/ai` and `/api/tutor`. Prompts were hardcoded before this branch; the foundation branch moves key prompts into `prompts/`, adds input sanitization, basic rate limiting, response caching for selected calls, and usage logging.
