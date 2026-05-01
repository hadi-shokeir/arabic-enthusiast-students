# Arabic Tutor Manager

A student management system for Arabic language tutors — with authentication, a student portal, WhatsApp integration, PDF progress reports, and RTL text support.

## Features

- **Tutor Dashboard** — overview of students, lessons, revenue, attendance
- **Student Management** — cards/table view, skill tracking, lesson counters
- **Student Portal** — students log in to view their own progress (read-only)
- **Calendar** — visual month view, drag to create lessons, GCal integration
- **Payments** — track pending/paid, auto-adjust lesson bundles
- **PDF Reports** — shareable progress reports via WhatsApp or download
- **Curriculum Library** — assign topics, track completion per student
- **WhatsApp Reminders** — one-click message templates
- **RTL Support** — Arabic text displays correctly in all fields
- **Configurable** — currency, week start day, lesson types, levels
- **Arabic Quest Games** — student game hub with story, kitchen, market, word-building, tracing, memory, and boss quiz chapters
- **المطبخ — The Kitchen** — task-based Arabic cooking game with shuffled ingredients, kitchen zones, tools, register/harakat settings, and vocabulary journal

## Pedagogical Game Model

The student games are designed as task-based language learning, not flashcard drills. In **المطبخ — The Kitchen**, students complete a real cooking task while Arabic is needed to act: choose the right kitchen zone, tool, command, and ingredient.

- **Comprehensible input + 1**: Arabic appears with a visual object, optional English gloss, and browser TTS fallback.
- **Task-based learning**: vocabulary is learned while preparing dishes such as mint tea, fattoush, hummus, tabbouleh, mujaddara, and shish taouk.
- **Spaced recycling**: ingredients and verbs recur across recipes, so common kitchen language keeps returning.
- **Pushed output**: medium and advanced levels ask students to choose the Arabic command before the action works.
- **Dual register**: students can switch between MSA and Levantine where the data is available.
- **Harakat control**: full, partial, or no diacritics can be selected from the game settings.
- **Vocabulary journal**: unlocked words are collected by recipe/category so students can review what they used.

Future contributors should preserve the language layer when adding game mechanics. A mechanic should either make the cooking task more fun, make the Arabic more memorable, or both.

## Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/arabic-tutor.git
cd arabic-tutor

# Run locally (no build step needed)
npx serve public -l 3000

# Open http://localhost:3000
```

The app works without Supabase in **demo mode** (data stored in browser IndexedDB).

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
cd arabic-tutor
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arabic-tutor.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `arabic-tutor` repository
4. Settings will auto-detect from `vercel.json`:
   - **Output Directory**: `public`
   - **Build Command**: (none)
5. Click **Deploy**

Your app will be live at `https://arabic-tutor-XXXX.vercel.app`.

### Step 3: Set Up Supabase (for auth & multi-user)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - **Email** (enabled by default)
   - **Phone** (requires Twilio — optional)
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon/public` key
5. In your `public/index.html`, replace the config at the top of the script:

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...your_anon_key";
```

Or, for production, use Vercel environment variables:

6. In Vercel → Project Settings → Environment Variables, add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

Then update the config to read from a small inline script tag, or use Vercel's [Edge Config](https://vercel.com/docs/storage/edge-config).

### Step 4: Configure Auth Redirect

In Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app`

## Project Structure

```
arabic-tutor/
├── public/
│   └── index.html      ← The entire app (single file, no build)
├── supabase/
│   └── schema.sql       ← Database schema for Supabase
├── vercel.json           ← Vercel deployment config
├── package.json          ← Project metadata & dev server
├── .gitignore
└── README.md
```

## Bug Fixes (v2.0)

| # | Fix | Description |
|---|-----|-------------|
| 1 | `|| true` removed | Free lessons section no longer shows for all students |
| 2 | Revenue accuracy | Dashboard only counts paid payments, matching Payments page |
| 3 | hadLesson logic | Only completed lessons count as "had a lesson this week" |
| 4 | Quick complete | Creates a lesson record when no scheduled lesson exists |
| 5 | PDF Arabic note | Added guidance for Arabic font embedding in jsPDF |
| 6 | Streak accuracy | Future scheduled lessons no longer break attendance streaks |
| 7 | Payment delete | Added confirmation dialog before deleting payment records |
| 8 | Payment edit | Editing lessonsAdded now adjusts student's lesson total |
| 9 | RTL support | Arabic text fields use `direction: auto` and Noto Kufi Arabic |
| 10 | Currency | Configurable currency symbol in Settings → Regional |
| 11 | Week start | Configurable week start day (Sun/Mon/Sat) in Settings |
| 14 | Data safety | Pending saves flush on `beforeunload` to prevent data loss |
| 16 | Migration | Data versioning system for safe schema upgrades |

## Tech Stack

- **React 18** via CDN (no build step)
- **htm** for JSX-like templates without compilation
- **IndexedDB** for local storage (hundreds of MB)
- **Supabase** for auth (email + phone OTP)
- **jsPDF** for PDF generation
- **Vercel** for hosting

## License

MIT
