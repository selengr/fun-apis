import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBlogConfigStatus, listPublishedPosts } from '@/lib/blog'
import Banner from '@/components/views/banner/banner'
import { BlogCard } from '@/components/blog/blog-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { NAV_GLASS, NAV_GLASS_CLASS } from '@/lib/nav-glass'

export const metadata = {
  title: 'Blog',
  description: 'Notes and essays — Notion-backed blog by Reza Karbakhsh',
}

export const dynamic = 'force-dynamic'

function BlogListNav() {
  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] ${NAV_GLASS_CLASS}`}
        style={NAV_GLASS}
      >
        <ThemeToggle />
        <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
          BLOG
        </span>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Back home
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default async function BlogPage() {
  const status = await getBlogConfigStatus()

  if (!status.ready) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <BlogListNav />
        <div className="mx-auto max-w-xl px-4 pt-32 pb-20">
          <h1 className="text-3xl font-medium tracking-tight">Blog setup</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{status.message}</p>
          {status.step === 2 && (
            <p className="mt-6 text-sm text-muted-foreground">
              Create the database via{' '}
              <code className="text-foreground">POST /api/blog/setup</code>, then add{' '}
              <code className="text-foreground">NOTION_BLOG_DATABASE_ID</code> to{' '}
              <code className="text-foreground">.env.local</code>.
            </p>
          )}
        </div>
      </main>
    )
  }

  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = []
  let error: string | null = null
  try {
    posts = await listPublishedPosts(48)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load posts'
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <BlogListNav />

      <section className="relative pt-8 pb-6">
        <Banner
          banner="/images/banners/https___west.avif"
          user="/LOGO/rk-light-logo.png"
          blog
          title="Blog"
          videoReady
        >
          <div className="flex flex-col gap-3 text-sm sm:text-base leading-relaxed">
            <span>Notes, builds, and ideas from the playground.</span>
            <span className="text-muted-foreground">
              Click a card to open the full post — each one has its own banner and author image.
            </span>
          </div>
        </Banner>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            No published posts yet. Set Status to Published in Notion.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
