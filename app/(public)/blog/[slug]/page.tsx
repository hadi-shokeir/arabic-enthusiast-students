import { notFound }       from 'next/navigation'
import type { Metadata }  from 'next'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

/* ─────────────────────────────────────────────────────────────────────────────
   Dynamic blog post — /blog/[slug]
   Each slug maps to an MDX file in content/blog/.
───────────────────────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title:       `${post.title} — Arabic Enthusiast`,
    description: post.excerpt,
  }
}

// Dynamic import map — Next.js requires static import strings for MDX
const POST_MODULES: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'sun-and-moon-letters':   () => import('@/content/blog/sun-and-moon-letters.mdx'),
  'why-levantine-arabic':   () => import('@/content/blog/why-levantine-arabic.mdx'),
  'al-fatiha-word-by-word': () => import('@/content/blog/al-fatiha-word-by-word.mdx'),
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const meta   = getPostBySlug(params.slug)
  const loader = POST_MODULES[params.slug]

  if (!meta || !loader) notFound()

  const { default: PostContent } = await loader()

  return <PostContent />
}
