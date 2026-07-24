'use client'

import { motion } from 'framer-motion'

interface ScoreBoardProps {
  catWins: number
  dogWins: number
  totalFacts: number
}

export function ScoreBoard({ catWins, dogWins, totalFacts }: ScoreBoardProps) {
  const lead =
    catWins > dogWins ? 'Cat leads the card' : dogWins > catWins ? 'Dog leads the card' : 'Even scorecard'

  const leadColor =
    catWins > dogWins
      ? 'var(--af-cat)'
      : dogWins > catWins
        ? 'var(--af-dog)'
        : 'var(--af-mute)'

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className="w-full border"
      style={{ borderColor: 'var(--af-line)', background: 'var(--af-panel)' }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-6"
        style={{ borderColor: 'var(--af-line-soft)' }}
      >
        <p
          className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.24em]"
          style={{ color: 'var(--af-mute)' }}
        >
          Scorecard
        </p>
        <p
          className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.18em]"
          style={{ color: leadColor }}
        >
          {lead}
        </p>
      </div>

      <div className="grid grid-cols-3">
        <div
          className="px-4 py-6 sm:px-8 text-center border-r"
          style={{ borderColor: 'var(--af-line-soft)' }}
        >
          <p
            className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--af-cat)' }}
          >
            Cat
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-af-mark)] text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight"
            style={{ color: 'var(--af-cat)' }}
          >
            {catWins}
          </p>
        </div>

        <div className="px-4 py-6 sm:px-8 text-center flex flex-col items-center justify-center">
          <p
            className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--af-mute)' }}
          >
            Facts
          </p>
          <p className="mt-1 font-[family-name:var(--font-af-mark)] text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight">
            {totalFacts}
          </p>
        </div>

        <div
          className="px-4 py-6 sm:px-8 text-center border-l"
          style={{ borderColor: 'var(--af-line-soft)' }}
        >
          <p
            className="font-[family-name:var(--font-af-mono)] text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--af-dog)' }}
          >
            Dog
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-af-mark)] text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight"
            style={{ color: 'var(--af-dog)' }}
          >
            {dogWins}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
