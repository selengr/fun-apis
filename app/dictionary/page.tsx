import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Instrument_Serif } from 'next/font/google'
import { ClassicDictionary } from '@/components/classic-dictionary'
import { ThemeToggle } from '@/components/theme-toggle'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dict-display',
})

export const metadata = {
  title: 'Dictionary',
  description: 'Look up English words — definitions, pronunciation, and examples',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function DictionaryPage() {
  return (
    <main className={`${display.variable} relative min-h-screen bg-background overflow-hidden`}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,oklch(0.7_0.04_240_/0.12),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,oklch(0.4_0.05_240_/0.18),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            DICTIONARY
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 pb-20 md:pt-28">
        <ClassicDictionary />
      </div>
    </main>
  )
}
