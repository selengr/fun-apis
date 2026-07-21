import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserLocationFinder } from '@/components/user-location-finder'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Your IP Address — Where Am I?',
  description: 'See your public ISP IP address and roughly where the internet thinks you are',
}

const GLOBE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80'

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function LocationPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Globe atmosphere — kept; theme washes for light/dark readability */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GLOBE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.22] dark:opacity-[0.38]"
        />
        <div className="absolute inset-0 bg-background/70 dark:bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_20%,var(--background)_85%)]" />
      </div>

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
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            YOUR IP
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 pb-16 md:pt-28">
        <UserLocationFinder />
      </div>
    </main>
  )
}
