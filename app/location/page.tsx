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
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function LocationPage() {
  return (
    <main
      className={`${display.variable} ${mono.variable} ${mark.variable} relative min-h-screen overflow-x-clip bg-[#e8f0ed] text-[#0e1c24] dark:bg-[#071216] dark:text-[#e4efeb]`}
    >
      {/* Cartographic atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
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
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: `
              radial-gradient(ellipse 80% 55% at 15% 0%, rgba(45,212,191,0.12), transparent 55%),
              radial-gradient(ellipse 60% 45% at 95% 85%, rgba(13,143,127,0.08), transparent 50%),
              linear-gradient(165deg, #071216 0%, #0a1a20 50%, #0c2228 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.45]"
          style={{
            backgroundImage: `
              repeating-radial-gradient(
                circle at 30% 40%,
                transparent 0,
                transparent 28px,
                rgba(14,28,36,0.05) 28px,
                rgba(14,28,36,0.05) 29px
              )
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25] dark:[background-image:repeating-radial-gradient(circle_at_70%_30%,transparent_0,transparent_32px,rgba(45,212,191,0.07)_32px,rgba(45,212,191,0.07)_33px)]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,28,36,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14,28,36,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(228,239,235,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(228,239,235,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      {/* Same shell as homepage MobileNav + other tool pages */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl">
          <div
            className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
            style={NAV_GLASS}
          >
            <ThemeToggle />
            <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
              WHEREABOUTS
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
      </div>

      <div className="pt-24 pb-16 md:pt-28">
        <UserLocationFinder />
      </div>
    </main>
  )
}
