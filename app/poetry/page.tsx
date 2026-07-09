import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DailyPoetry } from '@/components/daily-poetry'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'Daily Poetry',
  description: 'A quiet reading room for classic verse',
}

export default function PoetryPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f7f3eb] dark:bg-[#0c0b0a] text-stone-900 dark:text-stone-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/3 w-[480px] h-[480px] rounded-full bg-amber-200/15 dark:bg-amber-900/8 blur-[130px]" />
      </div>

      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-full border border-stone-900/8 dark:border-amber-100/8 bg-[#f7f3eb]/80 dark:bg-[#0c0b0a]/80 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors tracking-[0.1em] uppercase cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Return
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-20">
        <DailyPoetry />
      </div>
    </main>
  )
}
