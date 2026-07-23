import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Instrument_Serif, JetBrains_Mono, Syne } from 'next/font/google'
import { UserLocationFinder } from '@/components/user-location-finder'
import { ThemeToggle } from '@/components/theme-toggle'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-loc-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-loc-mono',
})

const mark = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-loc-mark',
})

export const metadata = {
  title: 'Whereabouts — Your IP',
  description: 'See your public ISP IP and where the wire thinks you are',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function LocationPage() {
  return (
    <main
      className={`${display.variable} ${mono.variable} ${mark.variable} loc-theme relative min-h-screen overflow-x-clip`}
    >
      <style>{`
        .loc-theme {
          --loc-ink: #0e1c24;
          --loc-paper: #d4e0dc;
          --loc-mist: #e8f0ed;
          --loc-signal: #0d8f7f;
          --loc-signal-dim: rgba(13, 143, 127, 0.18);
          --loc-line: rgba(14, 28, 36, 0.12);
          --loc-line-soft: rgba(14, 28, 36, 0.08);
          --loc-panel: rgba(212, 224, 220, 0.55);
          --loc-nav-bg: rgba(232, 240, 237, 0.72);
          color: var(--loc-ink);
          background: var(--loc-mist);
        }
        .dark .loc-theme {
          --loc-ink: #e4efeb;
          --loc-paper: #0f1f26;
          --loc-mist: #071216;
          --loc-signal: #2dd4bf;
          --loc-signal-dim: rgba(45, 212, 191, 0.16);
          --loc-line: rgba(228, 239, 235, 0.14);
          --loc-line-soft: rgba(228, 239, 235, 0.08);
          --loc-panel: rgba(12, 28, 34, 0.72);
          --loc-nav-bg: rgba(7, 18, 22, 0.78);
          color: var(--loc-ink);
          background: var(--loc-mist);
        }
      `}</style>

      {/* Cartographic atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Light wash */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 10% -10%, rgba(13,143,127,0.22), transparent 55%),
              radial-gradient(ellipse 70% 50% at 100% 100%, rgba(14,28,36,0.12), transparent 50%),
              linear-gradient(165deg, #e8f0ed 0%, #d4e0dc 45%, #c5d4cf 100%)
            `,
          }}
        />
        {/* Dark wash — deep ink + teal bloom */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: `
              radial-gradient(ellipse 80% 55% at 15% 0%, rgba(45,212,191,0.14), transparent 55%),
              radial-gradient(ellipse 60% 45% at 95% 85%, rgba(13,143,127,0.1), transparent 50%),
              linear-gradient(165deg, #071216 0%, #0a1a20 50%, #0c2228 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.5]"
          style={{
            backgroundImage: `
              repeating-radial-gradient(
                circle at 30% 40%,
                transparent 0,
                transparent 28px,
                var(--loc-line-soft) 28px,
                var(--loc-line-soft) 29px
              )
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.3]"
          style={{
            backgroundImage: `
              linear-gradient(var(--loc-line-soft) 1px, transparent 1px),
              linear-gradient(90deg, var(--loc-line-soft) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={{ ...NAV_GLASS, background: 'var(--loc-nav-bg)' }}
        >
          <ThemeToggle />
          <span
            className="text-[10px] tracking-[0.32em] uppercase text-[var(--loc-ink)]/45 hidden sm:inline"
            style={{ fontFamily: 'var(--font-loc-mono), monospace' }}
          >
            Whereabouts
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
          >
            Back home
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="pt-24 pb-16 md:pt-28">
        <UserLocationFinder />
      </div>
    </main>
  )
}
