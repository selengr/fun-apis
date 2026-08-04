import type { ReactNode } from 'react'
import Link from 'next/link'
import { Check, Circle } from 'lucide-react'
import { getBlogConfigStatus } from '@/lib/blog'
import { GlassNav } from '@/components/glass-nav'

export const metadata = {
  title: 'Blog',
  description: 'Notes and posts — powered by Notion as CMS',
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const status = await getBlogConfigStatus()

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      <GlassNav label="BLOG" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Notion CMS · setup
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-light tracking-tight">Blog</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
          Personal posts from a Notion database. Step 1 (auth) is live — finish Step 2 to list posts.
        </p>

        <ol className="mt-10 space-y-4">
          <Step
            n={1}
            title="Personal access token"
            done={status.hasApiKey && status.step !== 1}
            active={status.step === 1}
          >
            {status.hasApiKey ? (
              <p className="text-sm text-muted-foreground">
                Connected as <span className="text-foreground">{status.userName}</span>
                {status.workspaceName ? (
                  <>
                    {' '}
                    · <span className="text-foreground">{status.workspaceName}</span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-sm text-red-500">{status.message}</p>
            )}
          </Step>

          <Step
            n={2}
            title="Create Blog database + set ID"
            done={status.hasDatabaseId}
            active={status.step === 2}
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>In Notion, create a full-page database named <strong className="text-foreground">Blog</strong> with these properties:</p>
              <ul className="font-mono text-[12px] space-y-1.5 border border-border/60 bg-card/40 p-4 rounded-xl">
                <li>Title — <span className="text-foreground">Title</span> (title)</li>
                <li>Slug — <span className="text-foreground">Slug</span> (text)</li>
                <li>Status — <span className="text-foreground">Status</span> (Status or Select: Draft / Published)</li>
                <li>Date — <span className="text-foreground">Date</span> (date)</li>
                <li>Tags — <span className="text-foreground">Tags</span> (multi-select)</li>
                <li>Excerpt — <span className="text-foreground">Excerpt</span> (text, optional)</li>
              </ul>
              <p>
                Open the database as a full page → copy the ID from the URL
                (<code className="text-foreground">notion.so/…/<strong>32hexchars</strong>?v=…</code>).
              </p>
              <p>
                Add to <code className="text-foreground">.env.local</code>:
              </p>
              <pre className="font-mono text-[12px] border border-border/60 bg-card/40 p-4 rounded-xl overflow-x-auto">
{`NOTION_BLOG_DATABASE_ID=your_database_id_here`}
              </pre>
              <p>Then restart <code className="text-foreground">next dev</code> and refresh this page.</p>
            </div>
          </Step>

          <Step
            n={3}
            title="List & render posts"
            done={false}
            active={status.step === 3}
          >
            <p className="text-sm text-muted-foreground">
              After Step 2, we wire <code className="text-foreground">/blog</code> list +{' '}
              <code className="text-foreground">/blog/[slug]</code> from Notion markdown.
            </p>
          </Step>
        </ol>

        <p className="mt-10 font-mono text-[11px] text-muted-foreground">
          Status API ·{' '}
          <Link href="/api/blog?action=status" className="underline underline-offset-2 hover:text-foreground">
            /api/blog?action=status
          </Link>
        </p>
      </div>
    </main>
  )
}

function Step({
  n,
  title,
  done,
  active,
  children,
}: {
  n: number
  title: string
  done: boolean
  active: boolean
  children: ReactNode
}) {
  return (
    <li
      className={`border rounded-2xl p-5 sm:p-6 ${
        active ? 'border-foreground/30 bg-card/50' : 'border-border/50 bg-card/20'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`inline-flex size-7 items-center justify-center rounded-full border text-xs font-mono ${
            done
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : active
                ? 'border-foreground/40 text-foreground'
                : 'border-border text-muted-foreground'
          }`}
        >
          {done ? <Check className="size-3.5" /> : n}
        </span>
        <h2 className="text-base font-medium tracking-tight">{title}</h2>
        {active && (
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Circle className="size-2 fill-current text-amber-500" />
            Now
          </span>
        )}
      </div>
      {children}
    </li>
  )
}
