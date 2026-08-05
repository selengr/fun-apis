import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Banner from '@/components/views/banner/banner'
import { BlogMarkdown } from '@/components/blog/blog-markdown'
import { BlogNav } from '@/components/blog/blog-nav'
import { ViewCounter } from '@/components/blog/view-counter'
import { getPostBySlug, listPublishedPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPostBySlug(slug)
    if (!post) return { title: 'Post' }
    return {
      title: post.title,
      description: post.summary ?? post.introduction ?? undefined,
      openGraph: post.bannerImage
        ? { images: [{ url: post.bannerImage }] }
        : undefined,
    }
  } catch {
    return { title: 'Post' }
  }
}

export async function generateStaticParams() {
  try {
    const posts = await listPublishedPosts(48)
    return posts.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

function formatDate(iso: string | null) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  let post
  try {
    post = await getPostBySlug(slug)
  } catch {
    notFound()
  }
  if (!post || post.status !== 'Published') notFound()

  const date = formatDate(post.date)
  const banner = post.bannerImage || '/images/banners/https___west.avif'
  const author = post.authorImage || '/LOGO/rk-light-logo.png'

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <BlogNav label="POST" />

      <section className="relative pt-8">
        <Banner banner={banner} user={author} blog title={post.title} videoReady>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-mono text-muted-foreground tracking-wide">
              <span>{post.authorName}</span>
              {date && (
                <>
                  <span aria-hidden>·</span>
                  <time dateTime={post.date ?? undefined}>{date}</time>
                </>
              )}
              {post.readingMinutes != null && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} min read</span>
                </>
              )}
              <span aria-hidden>·</span>
              <ViewCounter pageId={post.id} initial={post.views} />
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono uppercase tracking-[0.14em] border border-border/60 px-2.5 py-1 rounded-md text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.summary && (
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                {post.summary}
              </p>
            )}
          </div>
        </Banner>
      </section>

      <article className="mx-auto max-w-2xl px-4 sm:px-6 pb-24 pt-4">
        {post.introduction && (
          <section className="mb-10">
            <h2 className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Introduction
            </h2>
            <p className="text-base leading-relaxed">{post.introduction}</p>
          </section>
        )}

        <BlogMarkdown markdown={post.markdown} />

        {post.conclusion && (
          <section className="mt-12 pt-10 border-t border-border/50">
            <h2 className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Conclusion
            </h2>
            <p className="text-base leading-relaxed">{post.conclusion}</p>
          </section>
        )}

        <footer className="mt-14 flex items-center gap-3 pt-8 border-t border-border/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={author}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover bg-[#f7f6f3]"
          />
          <div>
            <p className="text-sm font-medium">{post.authorName}</p>
            <p className="text-xs text-muted-foreground">Author</p>
          </div>
        </footer>
      </article>
    </main>
  )
}
