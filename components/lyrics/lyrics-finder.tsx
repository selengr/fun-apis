'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic2, Search, Loader2 } from 'lucide-react'
import { IPhoneLyricsStage } from '@/components/lyrics/iphone-lyrics-stage'
import type { LyricsResult, LyricsSearch } from '@/types/lyrics'
import {
  FEATURED_LYRICS,
  loadRecent,
  parseLyrics,
  saveRecent,
} from '@/lib/lyrics'
import { cn } from '@/lib/utils'

export function LyricsFinder() {
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState<LyricsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<LyricsSearch[]>([])

  const fetchLyrics = useCallback(async (a: string, t: string) => {
    const artistTrim = a.trim()
    const titleTrim = t.trim()
    if (!artistTrim || !titleTrim) return

    setLoading(true)
    setError(null)
    setArtist(artistTrim)
    setTitle(titleTrim)

    try {
      const params = new URLSearchParams({ artist: artistTrim, title: titleTrim })
      const res = await fetch(`/api/lyrics?${params}`, { cache: 'no-store' })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Could not load lyrics')

      const parsed = parseLyrics(artistTrim, titleTrim, json.lyrics)
      setResult(parsed)
      setRecent(saveRecent({ artist: artistTrim, title: titleTrim }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lyrics not found')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setRecent(loadRecent())
    void fetchLyrics('Coldplay', 'Yellow')
  }, [fetchLyrics])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void fetchLyrics(artist, title)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <section className="relative z-10 mb-10 md:mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-violet-600/70 dark:text-violet-300/70 mb-4"
          >
            <Mic2 className="size-4" />
            <span className="text-[10px] uppercase tracking-[0.28em] font-medium">
              Lyrics.ovh
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl font-light tracking-tight text-foreground leading-[1.05]"
          >
            Read the song
            <span className="block mt-1 italic font-normal text-stone-500 dark:text-stone-400">
              line by line
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto"
          >
            Search any track — perfect for pronunciation, vocabulary, and sing-along English practice.
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={onSubmit}
          className="max-w-xl mx-auto space-y-3"
        >
          <div
            className={cn(
              'rounded-2xl border bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl',
              'border-stone-200/80 dark:border-stone-800',
              'shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_50px_-20px_rgba(0,0,0,0.25)]',
              'overflow-hidden divide-y divide-stone-200/80 dark:divide-stone-800',
            )}
          >
            <label className="flex items-center gap-3 px-4 py-1">
              <span className="w-14 shrink-0 text-[11px] uppercase tracking-[0.14em] text-stone-400">
                Artist
              </span>
              <input
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Coldplay"
                className="flex-1 h-12 bg-transparent text-[15px] outline-none placeholder:text-stone-400/70"
                autoComplete="off"
              />
            </label>
            <label className="flex items-center gap-3 px-4 py-1">
              <span className="w-14 shrink-0 text-[11px] uppercase tracking-[0.14em] text-stone-400">
                Song
              </span>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Yellow"
                className="flex-1 h-12 bg-transparent text-[15px] outline-none placeholder:text-stone-400/70"
                autoComplete="off"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !artist.trim() || !title.trim()}
            className="w-full h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Finding lyrics…
              </>
            ) : (
              <>
                <Search className="size-4" />
                Find lyrics
              </>
            )}
          </button>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {FEATURED_LYRICS.map(s => (
              <button
                key={`${s.artist}-${s.title}`}
                type="button"
                onClick={() => void fetchLyrics(s.artist, s.title)}
                className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-foreground/75 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {s.title} · {s.artist}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 text-center">
                Recent
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {recent.map(r => (
                  <button
                    key={`${r.artist}-${r.title}`}
                    type="button"
                    onClick={() => void fetchLyrics(r.artist, r.title)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.form>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center"
      >
        <IPhoneLyricsStage result={result} loading={loading} error={error} />
      </motion.section>
    </div>
  )
}
