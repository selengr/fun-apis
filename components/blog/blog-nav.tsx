import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { NAV_GLASS, NAV_GLASS_CLASS } from '@/lib/nav-glass'

export function BlogNav({ label = 'Blog' }: { label?: string }) {
  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none" dir="ltr">
      <div
        className={`pointer-events-auto w-full max-w-3xl flex items-center justify-between px-5 py-3 rounded-2xl border border-border/60 ${NAV_GLASS_CLASS}`}
        style={NAV_GLASS}
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide"
        >
          <ArrowLeft className="size-3.5" />
          All posts
        </Link>
        <span className="font-pixel text-[10px] tracking-[0.2em] text-muted-foreground hidden sm:inline">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="text-[11px] px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
