'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ExternalLink,
  Loader2,
  X,
  Command,
} from 'lucide-react'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import type { Artwork } from '@/types/met'
import {
  FEATURED_SEARCHES,
  OPENING_QUERY,
  loadRecent,
  saveRecent,
} from '@/lib/met'
import { cn } from '@/lib/utils'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-met-display',
})

const ui = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-met-ui',
})

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 sm:grid-cols-[6.5rem_1fr] py-3 border-b border-stone-900/[0.06] dark:border-amber-50/[0.06] last:border-0">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500 pt-0.5">
        {label}
      </dt>
      <dd className="text-[15px] leading-snug text-stone-800 dark:text-stone-100 font-light">
        {value}
      </dd>
    </div>
  )
}

function SkeletonRow() {
  return <div className="h-14 animate-pulse rounded-xl bg-stone-200/50 dark:bg-stone-800/50" />
}

export function MetExplorer() {
  const [query, setQuery] = useState('')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [active, setActive] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const [suggestions, setSuggestions] = useState<Artwork[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [activeSuggest, setActiveSuggest] = useState(-1)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])

  const wrapRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    if (!term) return

    setLoading(true)
    setError(null)
    setImgLoaded(false)
    setShowSuggest(false)
    setQuery(term)
    setRecent(saveRecent(term))

    try {
      const params = new URLSearchParams({
        action: 'search',
        q: term,
        limit: '18',
      })
      const res = await fetch(`/api/met?${params}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Search failed')

      const list: Artwork[] = json.artworks ?? []
      setArtworks(list)
      setActive(list[0] ?? null)
      if (list.length === 0) setError('No artworks found. Try another keyword.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach The Met')
      setArtworks([])
      setActive(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const selectArtwork = useCallback((a: Artwork, list?: Artwork[]) => {
    if (list) setArtworks(list)
    setActive(a)
    setShowSuggest(false)
    setImgLoaded(false)
  }, [])

  useEffect(() => {
    setRecent(loadRecent())
    void runSearch(OPENING_QUERY)
  }, [runSearch])

  useEffect(() => {
    setImgLoaded(false)
  }, [active?.id])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        wrapRef.current?.querySelector('input')?.focus()
        setShowSuggest(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const fetchSuggest = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setSuggestLoading(false)
      return
    }
    setSuggestLoading(true)
    try {
      const res = await fetch(
        `/api/met?action=suggest&q=${encodeURIComponent(q)}&limit=6`,
        { cache: 'no-store' },
      )
      const json = await res.json()
      setSuggestions(json.artworks ?? [])
      setShowSuggest(true)
      setActiveSuggest(-1)
    } catch {
      setSuggestions([])
    } finally {
      setSuggestLoading(false)
    }
  }, [])

  const onQueryChange = (val: string) => {
    setQuery(val)
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    suggestTimer.current = setTimeout(() => void fetchSuggest(val), 280)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggest || suggestions.length === 0) {
      if (e.key === 'Enter') void runSearch(query)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggest(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggest(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggest >= 0) {
        const pick = suggestions[activeSuggest]
        selectArtwork(pick, suggestions)
        setRecent(saveRecent(pick.artist !== 'Unknown artist' ? pick.artist : pick.title))
        setArtworks(suggestions)
        setLoading(false)
        setError(null)
      } else {
        void runSearch(query)
      }
    } else if (e.key === 'Escape') {
      setShowSuggest(false)
    }
  }

  const selectAt = (index: number) => {
    if (!artworks[index]) return
    setActive(artworks[index])
    const el = stripRef.current?.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className={cn(display.variable, ui.variable, 'min-h-[calc(100vh-5rem)]')}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        {/* Search — books-style */}
        <section className="relative z-50 mb-10 md:mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="font-[family-name:var(--font-met-display)] text-4xl sm:text-5xl font-light tracking-tight text-stone-900 dark:text-amber-50 leading-[1.05]">
              Find a work worth
              <span className="block mt-1 italic font-normal text-stone-500 dark:text-stone-400">
                standing still for
              </span>
            </h1>
          </div>

          <div ref={wrapRef} className="relative max-w-xl mx-auto">
            <div
              className={cn(
                'relative flex items-center gap-3 rounded-2xl border bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl',
                'border-stone-200/80 dark:border-stone-800',
                'shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_50px_-20px_rgba(0,0,0,0.25)]',
                'dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-20px_rgba(0,0,0,0.6)]',
                'transition-shadow duration-300',
                showSuggest &&
                  'shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-amber-700/15 dark:ring-amber-200/15',
              )}
            >
              <Search className="ml-4 size-4 text-stone-400 shrink-0" />
              <input
                value={query}
                onChange={e => onQueryChange(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setShowSuggest(true)}
                placeholder="Artist, title, or subject…"
                className="flex-1 h-14 bg-transparent font-[family-name:var(--font-met-ui)] text-[15px] outline-none placeholder:text-stone-400/80 text-stone-900 dark:text-amber-50"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSuggestions([])
                    setShowSuggest(true)
                  }}
                  className="size-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  aria-label="Clear"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1 mr-2 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 text-[10px] text-stone-400 font-mono">
                  <Command className="size-2.5" />
                  K
                </kbd>
              )}
              <button
                type="button"
                onClick={() => void runSearch(query)}
                disabled={loading || !query.trim()}
                className="m-1.5 h-11 px-5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-sm font-medium font-[family-name:var(--font-met-ui)] hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-40"
              >
                Search
              </button>
            </div>

            <AnimatePresence>
              {showSuggest && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-[calc(100%+10px)] z-[60] overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.45)]"
                >
                  {suggestLoading && (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </div>
                  )}

                  {!suggestLoading && query.trim().length >= 2 && suggestions.length > 0 && (
                    <ul className="max-h-[min(22rem,50vh)] overflow-y-auto p-1.5">
                      {suggestions.map((s, i) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveSuggest(i)}
                            onMouseDown={() => {
                              selectArtwork(s, suggestions)
                              setRecent(saveRecent(s.artist !== 'Unknown artist' ? s.artist : s.title))
                              setLoading(false)
                              setError(null)
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer',
                              i === activeSuggest
                                ? 'bg-stone-100 dark:bg-stone-900'
                                : 'hover:bg-stone-50 dark:hover:bg-stone-900/60',
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.image}
                              alt=""
                              className="size-12 rounded-lg object-cover shrink-0 bg-stone-100 dark:bg-stone-900"
                            />
                            <div className="min-w-0 flex-1 font-[family-name:var(--font-met-ui)]">
                              <p className="text-sm font-medium truncate text-stone-900 dark:text-stone-100">
                                {s.title}
                              </p>
                              <p className="text-xs text-stone-500 truncate mt-0.5">
                                {s.artist}
                                {s.year ? ` · ${s.year}` : ''}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!suggestLoading && query.trim().length < 2 && (
                    <div className="p-4 space-y-5 font-[family-name:var(--font-met-ui)]">
                      {recent.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 mb-2.5">
                            Recent
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recent.map(r => (
                              <button
                                key={r}
                                type="button"
                                onMouseDown={() => void runSearch(r)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 mb-2.5">
                          Try
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {FEATURED_SEARCHES.map(s => (
                            <button
                              key={s}
                              type="button"
                              onMouseDown={() => void runSearch(s)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!suggestLoading && query.trim().length >= 2 && suggestions.length === 0 && (
                    <p className="p-4 text-sm text-stone-500 font-[family-name:var(--font-met-ui)]">
                      No matches yet — press Search for a full look.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {error && (
          <p className="mb-8 text-center text-sm text-rose-600/90 dark:text-rose-300/90 font-[family-name:var(--font-met-ui)]">
            {error}
          </p>
        )}

        <div className="relative">
          {loading && !active && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="size-6 animate-spin text-stone-400" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-start"
              >
                <div
                  className={cn(
                    'relative overflow-hidden bg-stone-200/40 dark:bg-stone-900/50',
                    'min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]',
                    'flex items-center justify-center',
                  )}
                >
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100/40 dark:bg-black/30 backdrop-blur-[2px]">
                      <Loader2 className="size-5 animate-spin text-stone-500" />
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.imageLarge || active.image}
                    alt={active.title}
                    onLoad={() => setImgLoaded(true)}
                    className={cn(
                      'max-h-[70vh] w-full object-contain transition-opacity duration-700',
                      imgLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>

                <div className="lg:pt-4">
                  <h2 className="font-[family-name:var(--font-met-display)] text-3xl sm:text-4xl font-light leading-[1.15] tracking-tight text-stone-900 dark:text-amber-50">
                    {active.title}
                  </h2>

                  <dl className="mt-8 font-[family-name:var(--font-met-ui)]">
                    <MetaRow label="Artist" value={active.artist} />
                    <MetaRow label="Year" value={active.year} />
                    <MetaRow label="Museum" value={active.museum} />
                    <MetaRow label="Medium" value={active.medium} />
                    <MetaRow label="Country" value={active.country} />
                    <MetaRow label="Style" value={active.style} />
                  </dl>

                  {active.objectURL && (
                    <a
                      href={active.objectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center gap-2 font-[family-name:var(--font-met-ui)] text-[11px] uppercase tracking-[0.16em] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-amber-50 transition-colors"
                    >
                      View on The Met
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {artworks.length > 1 && (
          <div className="mt-12 pt-8 border-t border-stone-900/[0.06] dark:border-amber-50/[0.06]">
            <div
              ref={stripRef}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
            >
              {artworks.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectAt(i)}
                  className={cn(
                    'relative shrink-0 w-20 h-24 sm:w-24 sm:h-28 snap-start overflow-hidden cursor-pointer transition-opacity duration-300',
                    active?.id === a.id ? 'opacity-100 ring-2 ring-stone-800 dark:ring-amber-100' : 'opacity-50 hover:opacity-100',
                  )}
                  aria-label={a.title}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
