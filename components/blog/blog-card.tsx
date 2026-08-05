import Link from 'next/link'
import Image from 'next/image'
import type { BlogPostMeta } from '@/types/blog'

function formatDate(iso: string | null) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function BlogCard({ post }: { post: BlogPostMeta }) {
  const banner = post.bannerImage || post.coverUrl || '/images/banners/https___west.avif'
  const date = formatDate(post.date)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 transition-all duration-300 hover:border-foreground/20 hover:bg-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted/40">
        <Image
          src={banner}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={banner.startsWith('http')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
        {post.featured && (
          <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md bg-background/80 border border-border/60">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono tracking-wide">
          {date && <time dateTime={post.date ?? undefined}>{date}</time>}
          {post.readingMinutes != null && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{post.views} views</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-medium tracking-tight leading-snug group-hover:underline group-hover:underline-offset-4 decoration-foreground/30">
          {post.title}
        </h2>

        {post.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[#f7f6f3] border border-border/50">
              <Image
                src={post.authorImage || '/LOGO/rk-light-logo.png'}
                alt=""
                fill
                className="object-cover"
                unoptimized={(post.authorImage || '').startsWith('http')}
              />
            </div>
            <span className="text-xs text-muted-foreground truncate">{post.authorName}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {post.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border/60 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
