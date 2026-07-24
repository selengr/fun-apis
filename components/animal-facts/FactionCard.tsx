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

const META = {
  cat: {
    corner: 'CORNER A',
    label: 'CAT',
    mark: 'C',
    accent: 'var(--af-cat)',
    soft: 'var(--af-cat-soft)',
    error: 'Cat corner went quiet. Try again.',
    loadingHint: null as string | null,
  },
  dog: {
    corner: 'CORNER B',
    label: 'DOG',
    mark: 'D',
    accent: 'var(--af-dog)',
    soft: 'var(--af-dog-soft)',
    error: 'Dog corner still warming up. Try again.',
    loadingHint: 'Kennel cold-start — may take 10–30s',
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
  const t = META[faction]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[380px] flex-col overflow-hidden border"
      style={{
        background: 'var(--af-panel)',
        borderColor: 'var(--af-line)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: t.soft }}
        aria-hidden
      />

      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: t.accent }}
        aria-hidden
      />

      <AnimatePresence>
        {isBattleWinner && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 font-[family-name:var(--font-af-mono)] text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{
              background: 'var(--af-signal)',
              color: 'var(--af-on-fg)',
            }}
          >
            <Trophy className="size-3" />
            Round
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--af-mute)' }}
            >
              {t.corner}
            </p>
            <h2
              className="mt-1.5 font-[family-name:var(--font-af-mark)] text-3xl sm:text-4xl font-extrabold tracking-tight leading-none"
              style={{ color: t.accent }}
            >
              {t.label}
            </h2>
          </div>
          <span
            className="select-none font-[family-name:var(--font-af-mark)] text-5xl sm:text-6xl font-extrabold leading-none opacity-20"
            style={{ color: t.accent }}
            aria-hidden
          >
            {t.mark}
          </span>
        </div>

        {showColdStart && faction === 'dog' && (
          <p
            className="mt-4 border px-3 py-2 font-[family-name:var(--font-af-mono)] text-[11px] leading-relaxed"
            style={{
              borderColor: 'var(--af-line)',
              color: 'var(--af-mute)',
              background: t.soft,
            }}
          >
            First fetch may take 10–30s while the kennel wakes.
          </p>
        )}

        <div
          className="mt-5 flex-1 border p-5 sm:p-6"
          style={{
            borderColor: 'var(--af-line-soft)',
            background: 'color-mix(in srgb, var(--af-bg) 55%, transparent)',
          }}
        >
          {loading ? (
            <div className="space-y-3 pt-1">
              <div className="h-3 w-full animate-pulse" style={{ background: t.soft }} />
              <div className="h-3 w-[90%] animate-pulse" style={{ background: t.soft }} />
              <div className="h-3 w-[72%] animate-pulse" style={{ background: t.soft }} />
              {t.loadingHint && (
                <p
                  className="pt-4 flex items-center gap-2 font-[family-name:var(--font-af-mono)] text-xs"
                  style={{ color: 'var(--af-mute)' }}
                >
                  <Loader2 className="size-3.5 animate-spin" />
                  {t.loadingHint}
                </p>
              )}
            </div>
          ) : error ? (
            <p
              className="font-[family-name:var(--font-af-display)] text-xl font-normal italic leading-relaxed"
              style={{ color: 'var(--af-mute)' }}
            >
              {t.error}
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={fact}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28 }}
              >
                <p className="font-[family-name:var(--font-af-display)] text-[1.3rem] sm:text-[1.55rem] leading-[1.4] tracking-tight">
                  {fact}
                </p>
                {typeof length === 'number' && length > 0 && (
                  <p
                    className="mt-5 font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: 'var(--af-mute)' }}
                  >
                    {length} chars
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 h-11 text-sm font-medium tracking-wide transition-opacity cursor-pointer disabled:opacity-40',
              'font-[family-name:var(--font-af-mono)]',
            )}
            style={{
              background: t.accent,
              color: 'var(--af-on-fg)',
            }}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Next fact
          </button>
          <button
            type="button"
            onClick={onWin}
            disabled={loading || error || !fact}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 h-11 border text-sm font-medium tracking-wide transition-opacity cursor-pointer disabled:opacity-40 bg-transparent',
              'font-[family-name:var(--font-af-mono)]',
            )}
            style={{
              borderColor: 'var(--af-line)',
              color: 'var(--af-fg)',
            }}
          >
            <Trophy className="size-3.5" />
            Award point
          </button>
        </div>
      </div>
    </motion.article>
  )
}
