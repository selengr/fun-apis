'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreBoardProps {
  catWins: number
  dogWins: number
  totalFacts: number
}

export function ScoreBoard({ catWins, dogWins, totalFacts }: ScoreBoardProps) {
  const lead =
    catWins > dogWins ? 'Feline leads' : dogWins > catWins ? 'Canine leads' : 'Evenly matched'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mx-auto w-full max-w-xl text-center"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-stone-900/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] px-8 py-7 backdrop-blur-xl">
        <div className="flex items-end justify-center gap-8 sm:gap-14">
          <div>
            <p className="font-[family-name:var(--font-battle-ui)] text-[10px] uppercase tracking-[0.24em] text-rose-700/50 dark:text-rose-300/45">
              Cat
            </p>
            <p className="mt-1 font-[family-name:var(--font-battle-display)] text-5xl font-light tabular-nums tracking-tight text-rose-900/80 dark:text-rose-200/90">
              {catWins}
            </p>
          </div>

          <div className="pb-2 font-[family-name:var(--font-battle-display)] text-2xl italic text-stone-300 dark:text-stone-600">
            vs
          </div>

          <div>
            <p className="font-[family-name:var(--font-battle-ui)] text-[10px] uppercase tracking-[0.24em] text-amber-800/50 dark:text-amber-200/45">
              Dog
            </p>
            <p className="mt-1 font-[family-name:var(--font-battle-display)] text-5xl font-light tabular-nums tracking-tight text-amber-950/80 dark:text-amber-100/90">
              {dogWins}
            </p>
          </div>
        </div>

        <p
          className={cn(
            'mt-5 font-[family-name:var(--font-battle-ui)] text-[11px] uppercase tracking-[0.2em]',
            catWins > dogWins
              ? 'text-rose-700/60 dark:text-rose-300/55'
              : dogWins > catWins
                ? 'text-amber-800/60 dark:text-amber-200/55'
                : 'text-stone-400 dark:text-stone-500',
          )}
        >
          {lead}
        </p>
      </div>

      <p className="mt-5 font-[family-name:var(--font-battle-ui)] text-xs tracking-wide text-stone-400 dark:text-stone-500">
        {totalFacts} facts discovered this session
      </p>
    </motion.div>
  )
}
