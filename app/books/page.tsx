import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { BookExplorer } from '@/components/book-explorer'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Book Explorer — Open Library',
  description: 'Discover books, authors, editions and subjects from Open Library',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

function BookExplorerFallback() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 animate-pulse">
      <div className="h-14 max-w-xl mx-auto rounded-2xl bg-muted/40 mb-14" />
      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        <div className="aspect-[2/3] w-[200px] mx-auto rounded-2xl bg-muted/35" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded-xl bg-muted/35" />
          <div className="h-5 w-1/3 rounded-lg bg-muted/30" />
          <div className="h-32 w-full rounded-2xl bg-muted/25" />
        </div>
      </div>
    </div>
  )
}

export default function BooksPage() {
  return (
    <main className="relative min-h-screen bg-[#faf8f5] dark:bg-[#0a0a0b] overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[10%] w-[520px] h-[520px] rounded-full bg-violet-400/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-5%] left-[5%] w-[460px] h-[460px] rounded-full bg-amber-300/[0.06] blur-[120px]" />
      </div>

      <div className="fixed top-4 inset-x-0 z-[70] flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={NAV_GLASS}
        >
          <ThemeToggle />
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            BOOKS
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all tracking-wide cursor-pointer"
          >
            Back home
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="pt-24 md:pt-28">
        <Suspense fallback={<BookExplorerFallback />}>
          <BookExplorer />
        </Suspense>
      </div>
    </main>
  )
}
