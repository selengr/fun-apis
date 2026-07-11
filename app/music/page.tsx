import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MusicExplorer } from '@/components/music-explorer'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Music Explorer — Listening Room',
  description: 'Search artists, top tracks, albums, and related sounds via Spotify.',
}

export default function MusicPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f3efe8] dark:bg-[#0c0b0a] text-stone-900 dark:text-stone-100">
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-full border border-stone-900/8 dark:border-white/8 bg-[#f3efe8]/75 dark:bg-[#0c0b0a]/75 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors tracking-[0.1em] uppercase cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Return
          </Link>
          <span className="font-pixel text-[9px] tracking-[0.22em] text-stone-400/80 hidden sm:inline">
            LISTENING ROOM
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 md:pt-28">
        <MusicExplorer />
      </div>
    </main>
  )
}
