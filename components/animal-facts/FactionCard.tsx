'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Trophy, RefreshCw } from 'lucide-react'
import type { Faction } from '@/types/animal-facts'
import { cn } from '@/lib/utils'

interface FactionCardProps {
  faction: Faction
  fact: string
  length?: number
  loading: boolean
  error: boolean
  showColdStart?: boolean
  isBattleWinner?: boolean
  onNext: () => void
  onWin: () => void
}

const THEME = {
  cat: {
    panel:
      'bg-gradient-to-b from-[#faf5f8] via-[#f7eef4] to-[#f3e8ef] dark:from-[#1a1218] dark:via-[#161014] dark:to-[#120e12]',
    accent: 'text-rose-700/80 dark:text-rose-300/80',
    accentSoft: 'text-rose-600/50 dark:text-rose-300/40',
    ring: 'ring-rose-900/8 dark:ring-rose-200/10',
    glow: 'bg-rose-300/30 dark:bg-rose-900/25',
    factBg: 'bg-white/55 dark:bg-white/[0.03] border-rose-900/8 dark:border-rose-100/8',
    nextBtn:
      'bg-rose-900 text-[#faf5f8] hover:bg-rose-800 dark:bg-rose-200 dark:text-rose-950 dark:hover:bg-rose-100',
    winBtn:
      'border-rose-900/15 text-rose-800/70 hover:bg-rose-900/[0.04] dark:border-rose-200/15 dark:text-rose-200/70 dark:hover:bg-rose-100/[0.06]',
    winnerBadge: 'bg-rose-900 text-[#faf5f8] dark:bg-rose-200 dark:text-rose-950',
    skeleton: 'bg-rose-900/8 dark:bg-rose-100/10',
    name: 'Feline',
    label: 'Cat',
    emoji: '🐱',
    nextLabel: 'Next fact',
    winLabel: 'Award point',
    error: 'The cat slipped away. Try again.',
    loadingHint: null as string | null,
    floatDelay: 'delay-0',
  },
  dog: {
    panel:
      'bg-gradient-to-b from-[#faf7f2] via-[#f6f0e6] to-[#f2ebe0] dark:from-[#1a1612] dark:via-[#161310] dark:to-[#12100e]',
    accent: 'text-amber-800/80 dark:text-amber-200/80',
    accentSoft: 'text-amber-700/50 dark:text-amber-200/40',
    ring: 'ring-amber-900/8 dark:ring-amber-100/10',
    glow: 'bg-amber-300/25 dark:bg-amber-900/20',
    factBg: 'bg-white/55 dark:bg-white/[0.03] border-amber-900/8 dark:border-amber-100/8',
    nextBtn:
      'bg-amber-900 text-[#faf7f2] hover:bg-amber-800 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-amber-50',
    winBtn:
      'border-amber-900/15 text-amber-900/70 hover:bg-amber-900/[0.04] dark:border-amber-100/15 dark:text-amber-100/70 dark:hover:bg-amber-100/[0.06]',
    winnerBadge: 'bg-amber-900 text-[#faf7f2] dark:bg-amber-100 dark:text-amber-950',
    skeleton: 'bg-amber-900/8 dark:bg-amber-100/10',
    name: 'Canine',
    label: 'Dog',
    emoji: '🐶',
    nextLabel: 'Next fact',
    winLabel: 'Award point',
    error: 'The dog is still dreaming. Try again.',
    loadingHint: 'Waking the kennel… may take a moment',
    floatDelay: '[animation-delay:150ms]',
  },
} as const

export function FactionCard({
  faction,
  fact,
  length,
  loading,
  error,
  showColdStart = false,
  isBattleWinner = false,
  onNext,
  onWin,
}: FactionCardProps) {
  const t = THEME[faction]

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative min-h-[420px] overflow-hidden rounded-[1.75rem]',
        'ring-1',
        t.ring,
        t.panel,
      )}
    >
      {/* Soft atmospheric orb */}
      <div
        className={cn(
          'pointer-events-none absolute -top-16 right-[-10%] h-56 w-56 rounded-full blur-3xl',
          t.glow,
        )}
        aria-hidden
      />

      <AnimatePresence>
        {isBattleWinner && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              'absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] uppercase',
              t.winnerBadge,
            )}
          >
            <Trophy className="size-3" />
            Victor
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex h-full min-h-[420px] flex-col p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={cn(
                'font-[family-name:var(--font-battle-ui)] text-[10px] uppercase tracking-[0.28em]',
                t.accentSoft,
              )}
            >
              {t.name} salon
            </p>
            <h2
              className={cn(
                'mt-2 font-[family-name:var(--font-battle-display)] text-4xl sm:text-5xl font-light tracking-tight leading-none',
                t.accent,
              )}
            >
              {t.label}
            </h2>
          </div>
          <span
            className={cn('text-5xl select-none animate-float opacity-90', t.floatDelay)}
            aria-hidden
          >
            {t.emoji}
          </span>
        </div>

        {showColdStart && faction === 'dog' && (
          <p className="mt-5 rounded-xl border border-amber-800/10 bg-amber-900/[0.04] px-3.5 py-2.5 font-[family-name:var(--font-battle-ui)] text-[11px] leading-relaxed text-amber-900/60 dark:border-amber-100/10 dark:bg-amber-100/[0.04] dark:text-amber-100/55">
            First fetch may take 10–30s while the kennel wakes.
          </p>
        )}

        <div
          className={cn(
            'mt-6 flex-1 rounded-2xl border p-6 backdrop-blur-sm',
            t.factBg,
          )}
        >
          {loading ? (
            <div className="space-y-3 pt-1">
              <div className={cn('h-3.5 w-full animate-pulse rounded-full', t.skeleton)} />
              <div className={cn('h-3.5 w-[92%] animate-pulse rounded-full', t.skeleton)} />
              <div className={cn('h-3.5 w-[76%] animate-pulse rounded-full', t.skeleton)} />
              {t.loadingHint && (
                <p className="pt-4 flex items-center gap-2 font-[family-name:var(--font-battle-ui)] text-xs text-amber-800/55 dark:text-amber-100/50">
                  <Loader2 className="size-3.5 animate-spin" />
                  {t.loadingHint}
                </p>
              )}
            </div>
          ) : error ? (
            <p className="font-[family-name:var(--font-battle-display)] text-xl font-light leading-relaxed text-stone-500 dark:text-stone-400">
              {t.error}
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={fact}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28 }}
              >
                <p className="font-[family-name:var(--font-battle-display)] text-[1.35rem] sm:text-[1.5rem] font-light leading-[1.45] tracking-tight text-stone-800 dark:text-stone-100">
                  {fact}
                </p>
                {typeof length === 'number' && length > 0 && (
                  <p className="mt-5 font-[family-name:var(--font-battle-ui)] text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
                    {length} characters
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 h-12 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-40',
              t.nextBtn,
            )}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            {t.nextLabel}
          </button>
          <button
            type="button"
            onClick={onWin}
            disabled={loading || error || !fact}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 h-12 rounded-full border text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-40 bg-transparent',
              t.winBtn,
            )}
          >
            <Trophy className="size-3.5" />
            {t.winLabel}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
