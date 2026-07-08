import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserLocationFinder } from '@/components/user-location-finder'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Where Am I? — Geo Detective',
  description: 'Fun IP-based location lookup powered by ipstack',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top bar — matches home nav glass style */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={NAV_GLASS}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
          <span
            className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline"
          >
            GEO DETECTIVE
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 pb-10 md:pt-28 md:pb-16">
        <div className="text-center mb-8 px-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Geo Detective
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
            What is your <span className="italic">IP address</span>?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Your ISP zone, mapped — with a little detective work.
          </p>
        </div>
        <UserLocationFinder />
      </div>
    </main>
  )
}
