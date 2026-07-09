import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MetExplorer } from '@/components/met-explorer'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Artwork Explorer — The Met',
  description:
    'Explore The Metropolitan Museum of Art collection — search paintings, sculpture, and more from over 470,000 works.',
}

export default function ArtPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f4efe6] dark:bg-[#12100e] text-stone-900 dark:text-stone-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-8%] left-[15%] w-[520px] h-[520px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[420px] h-[420px] rounded-full bg-stone-400/10 dark:bg-stone-700/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-full border border-stone-900/8 dark:border-amber-100/8 bg-[#f4efe6]/80 dark:bg-[#12100e]/80 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors tracking-[0.1em] uppercase cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Return
          </Link>
          <span className="font-pixel text-[9px] tracking-[0.22em] text-stone-400/80 hidden sm:inline">
            THE MET
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 md:pt-28">
        <MetExplorer />
      </div>
    </main>
  )
}
