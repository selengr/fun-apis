'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Swords } from 'lucide-react'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import { FactionCard } from '@/components/animal-facts/FactionCard'
import { ScoreBoard } from '@/components/animal-facts/ScoreBoard'
import type { CatFact, DogFact, Faction } from '@/types/animal-facts'
import { cn } from '@/lib/utils'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-battle-display',
})

const ui = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-battle-ui',
})

export function AnimalFactsBattle() {
  const [catFact, setCatFact] = useState('')
  const [dogFact, setDogFact] = useState('')
  const [catLength, setCatLength] = useState(0)
  const [catLoading, setCatLoading] = useState(true)
  const [dogLoading, setDogLoading] = useState(true)
  const [catError, setCatError] = useState(false)
  const [dogError, setDogError] = useState(false)
  const [catWins, setCatWins] = useState(0)
  const [dogWins, setDogWins] = useState(0)
  const [totalFacts, setTotalFacts] = useState(0)
  const [dogFirstLoad, setDogFirstLoad] = useState(true)
  const [battleWinner, setBattleWinner] = useState<Faction | null>(null)

  const fetchCatFact = useCallback(async () => {
    setCatLoading(true)
    setCatError(false)
    try {
      const res = await fetch('https://catfact.ninja/fact', { cache: 'no-store' })
      if (!res.ok) throw new Error('cat failed')
      const data = (await res.json()) as CatFact
      setCatFact(data.fact)
      setCatLength(data.length ?? data.fact.length)
      setTotalFacts(n => n + 1)
    } catch {
      setCatError(true)
      setCatFact('')
      setCatLength(0)
    } finally {
      setCatLoading(false)
    }
  }, [])

  const fetchDogFact = useCallback(async () => {
    setDogLoading(true)
    setDogError(false)
    try {
      const res = await fetch('/api/dog-facts', { cache: 'no-store' })
      if (!res.ok) throw new Error('dog failed')
      const data = await res.json()
      if (data?.error) throw new Error(data.error)

      const fact: string = Array.isArray(data)
        ? (data[0] as DogFact)?.fact
        : (data as DogFact)?.fact

      if (!fact) throw new Error('empty dog fact')

      setDogFact(fact)
      setDogFirstLoad(false)
      setTotalFacts(n => n + 1)
    } catch {
      setDogError(true)
      setDogFact('')
    } finally {
      setDogLoading(false)
    }
  }, [])

  const fetchBoth = useCallback(async () => {
    setBattleWinner(null)
    await Promise.all([fetchCatFact(), fetchDogFact()])
    setBattleWinner(Math.random() < 0.5 ? 'cat' : 'dog')
  }, [fetchCatFact, fetchDogFact])

  useEffect(() => {
    void fetchBoth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const battling = catLoading || dogLoading

  return (
    <div className={cn(display.variable, ui.variable, 'relative min-h-screen overflow-hidden')}>
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-12%] left-[-8%] h-[520px] w-[520px] rounded-full bg-rose-300/25 dark:bg-rose-900/20 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] h-[480px] w-[480px] rounded-full bg-amber-300/20 dark:bg-amber-900/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/3 h-[360px] w-[360px] rounded-full bg-stone-300/20 dark:bg-stone-700/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero */}
      <header className="px-5 pt-6 pb-10 text-center sm:pt-8 sm:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-battle-ui)] text-[10px] uppercase tracking-[0.35em] text-stone-400 dark:text-stone-500"
        >
          A salon of curious truths
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="mt-4 font-[family-name:var(--font-battle-display)] text-[clamp(3rem,10vw,5.5rem)] font-light leading-[0.92] tracking-tight text-stone-900 dark:text-stone-50"
        >
          Cat{' '}
          <span className="italic text-stone-400 dark:text-stone-500 font-normal">versus</span>
          <br className="sm:hidden" /> Dog
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-md font-[family-name:var(--font-battle-ui)] text-sm leading-relaxed text-stone-500 dark:text-stone-400"
        >
          Two factions. One question. Whose fact stays with you longer?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-7 inline-flex items-center gap-4 rounded-full border border-stone-900/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] px-5 py-2.5 backdrop-blur-md"
        >
          <span className="font-[family-name:var(--font-battle-ui)] text-xs tracking-wide text-rose-800/70 dark:text-rose-200/70">
            Cat <span className="ml-1 tabular-nums font-medium text-rose-900 dark:text-rose-100">{catWins}</span>
          </span>
          <span className="h-3 w-px bg-stone-300/70 dark:bg-stone-600" />
          <span className="font-[family-name:var(--font-battle-ui)] text-xs tracking-wide text-amber-900/70 dark:text-amber-100/70">
            Dog <span className="ml-1 tabular-nums font-medium text-amber-950 dark:text-amber-50">{dogWins}</span>
          </span>
        </motion.div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
          <div className="order-1">
            <FactionCard
              faction="cat"
              fact={catFact}
              length={catLength}
              loading={catLoading}
              error={catError}
              isBattleWinner={battleWinner === 'cat'}
              onNext={() => {
                setBattleWinner(null)
                void fetchCatFact()
              }}
              onWin={() => setCatWins(n => n + 1)}
            />
          </div>

          <div className="order-2 flex items-center justify-center py-1 lg:order-3 lg:col-span-2 lg:py-3">
            <motion.button
              type="button"
              disabled={battling}
              onClick={() => void fetchBoth()}
              whileHover={battling ? undefined : { scale: 1.02 }}
              whileTap={battling ? undefined : { scale: 0.98 }}
              className={cn(
                'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4',
                'font-[family-name:var(--font-battle-ui)] text-sm font-medium tracking-[0.08em]',
                'text-stone-50 dark:text-stone-950',
                'bg-stone-900 dark:bg-stone-100',
                'shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]',
                'disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed',
                'transition-opacity duration-300',
              )}
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-500/25 via-transparent to-amber-500/25 opacity-80" />
              <Swords className={cn('relative size-4', battling && 'animate-pulse')} />
              <span className="relative">
                {battling ? 'Dueling…' : 'Battle — refresh both'}
              </span>
            </motion.button>
          </div>

          <div className="order-3 lg:order-2">
            <FactionCard
              faction="dog"
              fact={dogFact}
              loading={dogLoading}
              error={dogError}
              showColdStart={dogFirstLoad}
              isBattleWinner={battleWinner === 'dog'}
              onNext={() => {
                setBattleWinner(null)
                void fetchDogFact()
              }}
              onWin={() => setDogWins(n => n + 1)}
            />
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <ScoreBoard
            catWins={catWins}
            dogWins={dogWins}
            totalFacts={totalFacts}
          />
        </div>
      </main>
    </div>
  )
}
