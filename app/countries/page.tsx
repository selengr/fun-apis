import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Instrument_Serif } from 'next/font/google'
import { CountriesExplorer } from '@/components/countries-explorer'
import { ThemeToggle } from '@/components/theme-toggle'
import { NAV_GLASS, NAV_GLASS_CLASS } from '@/lib/nav-glass'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-atlas-display',
})

export const metadata = {
  title: 'World Atlas — Countries',
  description: 'Browse every country — flags, capitals, people, and place',
}

const EARTH =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80'



export default function CountriesPage() {
  return (
    <main className={`${display.variable} relative min-h-screen bg-background overflow-hidden`}>
      {/* Earth atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EARTH}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.18] dark:opacity-[0.32]"
        />
        <div className="absolute inset-0 bg-background/75 dark:bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_15%,var(--background)_90%)]" />
      </div>

      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] ${NAV_GLASS_CLASS}`}
          style={NAV_GLASS}
        >
          <ThemeToggle />
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            ATLAS
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

      <div className="pt-24 pb-20 md:pt-28">
        <CountriesExplorer />
      </div>
    </main>
  )
}
