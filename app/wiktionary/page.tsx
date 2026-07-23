import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Cormorant_Garamond } from 'next/font/google'
import { WiktionaryDictionary } from '@/components/wiktionary-dictionary'
import { ThemeToggle } from '@/components/theme-toggle'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dictionary-display',
})

export const metadata = {
  title: 'Wiktionary',
  description: 'Multilingual dictionary — translations, pronunciation, and etymology',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function WiktionaryPage() {
  return (
    <main
      className={`${display.variable} relative min-h-screen bg-background overflow-hidden`}
      style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_-10%,oklch(0.72_0.06_160_/0.1),transparent_55%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_70%_-10%,oklch(0.45_0.06_160_/0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,oklch(0.75_0.04_250_/0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,oklch(0.4_0.05_250_/0.12),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={NAV_GLASS}
        >
          <ThemeToggle />
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            WIKTIONARY
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
        <WiktionaryDictionary />
      </div>
    </main>
  )
}
