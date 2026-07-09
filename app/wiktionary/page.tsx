import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Cormorant_Garamond } from 'next/font/google'
import { WiktionaryDictionary } from '@/components/wiktionary-dictionary'
import { ThemeToggle } from '@/components/theme-toggle'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dictionary-display',
})

export const metadata = {
  title: 'Lexicon — Premium Dictionary',
  description: 'A refined multilingual dictionary with pronunciation, etymology, and global translations',
}

export default function WiktionaryPage() {
  return (
    <main
      className={`${display.variable} relative min-h-screen overflow-hidden bg-[#f7f4ef] dark:bg-[#080808] font-sans`}
      style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
    >
      {/* Ambient luxury backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,169,98,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,169,98,0.08),transparent_55%)]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-stone-300/25 dark:bg-stone-800/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </div>

      {/* Nav */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-6xl flex items-center justify-between px-5 py-3 rounded-full border border-amber-900/10 dark:border-amber-100/10 bg-white/55 dark:bg-black/45 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-4 py-2 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors tracking-[0.12em] uppercase cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Return
          </Link>
          <span
            className="text-sm tracking-[0.35em] uppercase text-amber-800/70 dark:text-amber-200/60 hidden sm:inline"
            style={{ fontFamily: 'var(--font-dictionary-display), Georgia, serif' }}
          >
            Lexicon
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Header */}
      <header className="pt-28 pb-2 px-4 text-center max-w-3xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-700/60 dark:text-amber-300/50 mb-4">
          Multilingual · Pronunciation · Etymology
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 dark:text-stone-50 tracking-tight"
          style={{ fontFamily: 'var(--font-dictionary-display), Georgia, serif' }}
        >
          The Complete Dictionary
        </h1>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      </header>

      <WiktionaryDictionary />
    </main>
  )
}
