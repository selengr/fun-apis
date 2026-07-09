'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Copy, Share2, ArrowRight, Check } from 'lucide-react'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import type { PoetryMood, PoetryPoem } from '@/types/poetry'
import { MOODS, poemShareText } from '@/lib/poetry'
import { cn } from '@/lib/utils'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poetry-display',
})

const ui = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-poetry-ui',
})

const SAVED_KEY = 'daily-poetry-saved'

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function Action({
  label,
  onClick,
  active,
  primary,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs tracking-[0.08em] transition-all duration-300 cursor-pointer',
        primary
          ? 'bg-stone-900 dark:bg-amber-100 text-amber-50 dark:text-stone-900 hover:opacity-90'
          : active
            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-100'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-900/[0.04] dark:hover:bg-white/[0.04]',
      )}
    >
      {children}
    </button>
  )
}

export function DailyPoetry() {
  const [poem, setPoem] = useState<PoetryPoem | null>(null)
  const [mood, setMood] = useState<PoetryMood | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadPoem = useCallback(async (opts?: { next?: boolean; mood?: PoetryMood | null }) => {
    setLoading(true)
    setError(null)
    setCopied(false)
    try {
      let url = '/api/poetry?action=today'
      if (opts?.next) {
        url = `/api/poetry?action=next${opts.mood ? `&mood=${opts.mood}` : ''}`
      } else if (opts?.mood) {
        url = `/api/poetry?action=mood&mood=${opts.mood}`
      }
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load poem')
      if (!json.poem) throw new Error('No poem found')
      setPoem(json.poem)
      if (opts?.mood) setMood(opts.mood)

      try {
        const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]')
        setSaved(list.includes(`${json.poem.title}::${json.poem.author}`))
      } catch {
        setSaved(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load poem')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPoem()
  }, [loadPoem])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !loading) {
        void loadPoem({ next: true, mood })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loadPoem, loading, mood])

  const toggleSave = () => {
    if (!poem) return
    const key = `${poem.title}::${poem.author}`
    try {
      const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]')
      const next = saved ? list.filter(x => x !== key) : [key, ...list].slice(0, 40)
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setSaved(!saved)
    } catch {
      setSaved(v => !v)
    }
  }

  const copyPoem = async () => {
    if (!poem) return
    await navigator.clipboard.writeText(poemShareText(poem))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const sharePoem = async () => {
    if (!poem) return
    const text = poemShareText(poem)
    try {
      if (navigator.share) await navigator.share({ title: poem.title, text })
      else await copyPoem()
    } catch { /* cancelled */ }
  }

  return (
    <div className={`${display.variable} ${ui.variable} font-[family-name:var(--font-poetry-ui)]`}>
      <section className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-6 sm:px-8 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(201,169,98,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(201,169,98,0.07),transparent_55%)]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#f7f3eb] dark:from-[#0c0b0a] to-transparent" />
        </div>

        <div className="relative w-full max-w-2xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.08em] text-stone-400 dark:text-stone-500 mb-10">
            {todayLabel()}
          </p>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 space-y-4 animate-pulse"
              >
                <div className="h-8 w-1/2 mx-auto rounded-lg bg-stone-300/30 dark:bg-stone-700/30" />
                <div className="h-3 w-24 mx-auto rounded-full bg-stone-300/25 dark:bg-stone-700/25" />
                <div className="space-y-3 pt-10">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3.5 rounded-full bg-stone-300/20 dark:bg-stone-700/20 mx-auto"
                      style={{ width: `${50 + (i % 3) * 12}%` }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : error || !poem ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24"
              >
                <p className="text-stone-500 text-sm">{error ?? 'Nothing to read just now.'}</p>
                <button
                  type="button"
                  onClick={() => void loadPoem({ next: true })}
                  className="mt-5 text-sm text-stone-700 dark:text-stone-300 underline underline-offset-4 cursor-pointer"
                >
                  Try another poem
                </button>
              </motion.div>
            ) : (
              <motion.article
                key={`${poem.title}-${poem.author}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]"
                  style={{ fontFamily: 'var(--font-poetry-display), Georgia, serif' }}
                >
                  {poem.title}
                </h1>
                <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                  {poem.author}
                </p>

                <div
                  className="mt-12 sm:mt-14 text-left sm:text-center space-y-0.5"
                  style={{
                    fontFamily: 'var(--font-poetry-display), Georgia, serif',
                    fontSize: 'clamp(1.05rem, 2.4vw, 1.25rem)',
                    lineHeight: 1.9,
                  }}
                >
                  {poem.lines.map((line, i) => (
                    <p
                      key={i}
                      className={cn(
                        'text-stone-800/90 dark:text-stone-200/85',
                        !line.trim() && 'h-3.5',
                      )}
                    >
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </motion.article>
            )}
          </AnimatePresence>

          {!loading && poem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-14 space-y-8"
            >
              <div className="flex flex-wrap items-center justify-center gap-1">
                <Action label="Save" active={saved} onClick={toggleSave}>
                  <Heart className={cn('size-3.5', saved && 'fill-current')} />
                  {saved ? 'Saved' : 'Save'}
                </Action>
                <Action label="Copy" active={copied} onClick={() => void copyPoem()}>
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Action>
                <Action label="Share" onClick={() => void sharePoem()}>
                  <Share2 className="size-3.5" />
                  Share
                </Action>
                <Action
                  label="Next poem"
                  primary
                  onClick={() => void loadPoem({ next: true, mood })}
                >
                  Next
                  <ArrowRight className="size-3.5" />
                </Action>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => void loadPoem({ mood: m.id })}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[11px] transition-colors duration-200 cursor-pointer',
                      mood === m.id
                        ? 'bg-stone-900/8 dark:bg-amber-100/10 text-stone-800 dark:text-amber-100'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
