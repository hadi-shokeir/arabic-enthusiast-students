/* ─────────────────────────────────────────────────────────────────────────────
   Blog utilities — reads frontmatter from content/blog/*.mdx
   Uses a static registry so this works without a filesystem at runtime (Vercel).
───────────────────────────────────────────────────────────────────────────── */

export interface BlogPost {
  slug:     string
  title:    string
  arabic:   string
  date:     string
  category: string
  excerpt:  string
}

/* Static registry — add each new post here when created. */
const POSTS: BlogPost[] = [
  {
    slug:     'al-fatiha-word-by-word',
    title:    'Al-Fatiha: A Word-by-Word Breakdown',
    arabic:   'الفاتحة: تحليل كلمة بكلمة',
    date:     '2026-04-10',
    category: 'Quranic',
    excerpt:  'The seven verses every Muslim recites 17 times a day — and what each word actually means.',
  },
  {
    slug:     'why-levantine-arabic',
    title:    'Why Learn Levantine Arabic?',
    arabic:   'لماذا تتعلم اللهجة الشامية؟',
    date:     '2026-04-15',
    category: 'Dialect',
    excerpt:  'MSA is formal and beautiful. Levantine is what people actually speak. Here is why both matter — and which to learn first.',
  },
  {
    slug:     'sun-and-moon-letters',
    title:    'Sun and Moon Letters Explained',
    arabic:   'الحروف الشمسية والقمرية',
    date:     '2026-04-20',
    category: 'Grammar',
    excerpt:  'The single most important pronunciation rule in Arabic — and why it matters even if you can already read.',
  },
]

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}
