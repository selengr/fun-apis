import Link from 'next/link'
import type { CSSProperties } from 'react'
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

export default function LocationPage() {
  return (
    <main
      className={`${display.variable} ${mono.variable} ${mark.variable} relative min-h-screen overflow-x-clip bg-[#e8f0ed] text-[#0e1c24] dark:bg-[#071216] dark:text-[#e8f0ed]`}
      style={
        {
          '--loc-ink': '#0e1c24',
          '--loc-paper': '#d4e0dc',
          '--loc-mist': '#e8f0ed',
          '--loc-signal': '#0d8f7f',
          '--loc-signal-dim': 'rgba(13, 143, 127, 0.18)',
        } as CSSProperties
      }
    >
      {/* Cartographic atmosphere — topo wash, not a stock globe card */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 10% -10%, rgba(13,143,127,0.22), transparent 55%),
              radial-gradient(ellipse 70% 50% at 100% 100%, rgba(14,28,36,0.12), transparent 50%),
              linear-gradient(165deg, #e8f0ed 0%, #d4e0dc 45%, #c5d4cf 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              repeating-radial-gradient(
                circle at 30% 40%,
                transparent 0,
                transparent 28px,
                rgba(14,28,36,0.045) 28px,
                rgba(14,28,36,0.045) 29px
              )
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,28,36,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14,28,36,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
        {/* Dark theme wash */}
        <div className="absolute inset-0 hidden dark:block bg-[#071216]/92" />
        <div
          className="absolute inset-0 hidden dark:block opacity-40"
          style={{
            backgroundImage: `
              repeating-radial-gradient(
                circle at 70% 30%,
                transparent 0,
                transparent 32px,
                rgba(13,143,127,0.07) 32px,
                rgba(13,143,127,0.07) 33px
              )
            `,
          }}
        />
      </div>

      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-[var(--loc-ink)]/10 dark:border-white/10 bg-[var(--loc-mist)]/70 dark:bg-[#0a161c]/70 backdrop-blur-xl">
          <ThemeToggle />
          <span
            className="text-[10px] tracking-[0.32em] uppercase text-[var(--loc-ink)]/45 dark:text-white/45 hidden sm:inline"
            style={{ fontFamily: 'var(--font-loc-mono), monospace' }}
          >
            Whereabouts
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-[var(--loc-ink)]/15 dark:border-white/15 text-[var(--loc-ink)]/70 dark:text-white/70 hover:text-[var(--loc-ink)] dark:hover:text-white hover:border-[var(--loc-ink)]/30 dark:hover:border-white/30 transition-all tracking-wide"
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
