'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  Bookmark,
  Share2,
  BookOpen,
  Clock,
  Globe2,
  Building2,
  Hash,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  TrendingUp,
  User,
  ArrowRight,
  Command,
  Loader2,
} from 'lucide-react'
import type { BookCard, BookDetail } from '@/types/openlibrary'
import {
  POPULAR_SEARCHES,
  authorPhotoUrl,
  coverUrl,
  difficultyFromPages,
  estimateReadingHours,
} from '@/lib/openlibrary'
import { cn } from '@/lib/utils'

const RECENT_KEY = 'book-explorer-recent'

function loadRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  const next = [q, ...loadRecent().filter(x => x !== q)].slice(0, 6)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  return next
}

function RatingStars({ value }: { value?: number }) {
  if (value == null) return <span className="text-xs text-muted-foreground/70">Unrated</span>
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
      <Star className="size-3.5 fill-current" />
      <span className="font-mono text-sm tabular-nums font-medium">{value.toFixed(1)}</span>
    </span>
  )
}

function Cover({
  id,
  title,
  size = 'lg',
  className,
  isbn,
}: {
  id?: number
  title: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  isbn?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = failed ? null : coverUrl(id, size === 'sm' ? 'M' : 'L', isbn)

  useEffect(() => {
    setFailed(false)
  }, [id, isbn])
  const dims =
    size === 'sm'
      ? 'w-12 h-[4.5rem]'
      : size === 'md'
        ? 'w-32 h-48'
        : 'w-[200px] sm:w-[220px] aspect-[2/3]'

  return (
    <div className={cn('relative group/cover', dims, className)}>
      <div className="absolute -inset-4 rounded-[1.5rem] bg-gradient-to-br from-violet-500/20 via-transparent to-amber-500/15 blur-2xl opacity-60 group-hover/cover:opacity-100 transition-opacity duration-700" />
      <div
        className={cn(
          'relative h-full w-full overflow-hidden rounded-2xl bg-stone-200/40 dark:bg-stone-800/40',
          'ring-1 ring-black/[0.06] dark:ring-white/10',
          'shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)]',
          'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover/cover:-translate-y-1 group-hover/cover:rotate-[1.25deg] group-hover/cover:scale-[1.02]',
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/15 to-amber-500/10">
            <BookOpen className="size-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      {size === 'lg' && (
        <div
          className="pointer-events-none mx-auto mt-4 h-5 w-[65%] rounded-[100%] bg-black/30 blur-lg opacity-50"
          aria-hidden
        />
      )}
    </div>
  )
}

function InsightMeter({
  label,
  value,
  hint,
  tone = 'violet',
}: {
  label: string
  value: number
  hint?: string
  tone?: 'violet' | 'amber' | 'emerald'
}) {
  const bar =
    tone === 'amber'
      ? 'from-amber-400 to-orange-500'
      : tone === 'emerald'
        ? 'from-emerald-400 to-teal-500'
        : 'from-violet-500 to-fuchsia-500'

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-sm tabular-nums font-medium text-foreground">
          {value}
          <span className="text-muted-foreground/60 text-xs">%</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full bg-gradient-to-r', bar)}
        />
      </div>
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-muted/35', className)} />
}

export function BookExplorer() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<BookCard[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [activeSuggest, setActiveSuggest] = useState(-1)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [trending, setTrending] = useState<BookCard[]>([])
  const [book, setBook] = useState<BookDetail | null>(null)
  const [similar, setSimilar] = useState<BookCard[]>([])
  const [loadingBook, setLoadingBook] = useState(true)
  const [descOpen, setDescOpen] = useState(false)
  const [tab, setTab] = useState<'overview' | 'details' | 'author'>('overview')
  const [shared, setShared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openWork = useCallback(async (id: string) => {
    setLoadingBook(true)
    setError(null)
    setDescOpen(false)
    setShowSuggest(false)
    setShared(false)
    try {
      const res = await fetch(`/api/books?action=work&id=${encodeURIComponent(id)}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load book')
      setBook(json.book)
      setSimilar(json.similar ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book')
    } finally {
      setLoadingBook(false)
    }
  }, [])

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    if (!term) return
    setQuery(term)
    setRecent(saveRecent(term))
    setShowSuggest(false)
    setLoadingBook(true)
    setError(null)
    try {
      const res = await fetch(`/api/books?action=search&q=${encodeURIComponent(term)}&limit=1`, { cache: 'no-store' })
      const json = await res.json()
      const first = json.books?.[0] as BookCard | undefined
      if (!first) {
        setBook(null)
        setSimilar([])
        setError('No books found. Try another keyword.')
        setLoadingBook(false)
        return
      }
      await openWork(first.workKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setLoadingBook(false)
    }
  }, [openWork])

  useEffect(() => {
    setRecent(loadRecent())
    fetch('/api/books?action=trending')
      .then(r => r.json())
      .then(json => setTrending(json.books ?? []))
      .catch(() => {})

    const q = searchParams.get('q')?.trim()
    const work = searchParams.get('work')?.trim()

    if (work) {
      void openWork(work.replace(/^\/works\//, ''))
    } else if (q) {
      setQuery(q)
      void runSearch(q)
    } else {
      void openWork('OL17930368W')
    }
  }, [openWork, runSearch, searchParams])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const fetchSuggest = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setSuggestLoading(false)
      return
    }
    setSuggestLoading(true)
    try {
      const res = await fetch(`/api/books?action=suggest&q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      const json = await res.json()
      setSuggestions(json.books ?? [])
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
      if (activeSuggest >= 0) void openWork(suggestions[activeSuggest].workKey)
      else void runSearch(query)
    } else if (e.key === 'Escape') {
      setShowSuggest(false)
    }
  }

  const shareBook = async () => {
    if (!book) return
    const url = `https://openlibrary.org/works/${book.workKey}`
    try {
      if (navigator.share) await navigator.share({ title: book.title, url })
      else await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* cancelled */ }
  }

  const readingTime = estimateReadingHours(book?.pages)
  const difficulty = difficultyFromPages(book?.pages)
  const desc = book?.description ?? ''
  const shortDesc = desc.length > 380 ? `${desc.slice(0, 380).trim()}…` : desc
  const chips = useMemo(() => book?.subjects?.slice(0, 8) ?? [], [book])
  const ratingPct = book?.rating != null ? Math.round((book.rating / 5) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      {/* Search — elevated above content */}
      <section className="relative z-50 mb-10 md:mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">

          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground leading-[1.05]">
            Find a book worth
            <span className="block mt-1 italic font-normal text-stone-500 dark:text-stone-400">
              reading tonight
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
              showSuggest && 'shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-violet-500/20',
            )}
          >
            <Search className="ml-4 size-4 text-stone-400 shrink-0" />
            <input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setShowSuggest(true)}
              placeholder="Title, author, or subject…"
              className="flex-1 h-14 bg-transparent text-[15px] outline-none placeholder:text-stone-400/80"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); setShowSuggest(true) }}
                className="size-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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
              disabled={loadingBook}
              className="m-1.5 h-11 px-5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-wait inline-flex items-center gap-2"
            >
              {loadingBook ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Searching…
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Dropdown — high z so it never sits under content */}
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
                      <SkeletonBlock key={i} className="h-14" />
                    ))}
                  </div>
                )}

                {!suggestLoading && query.trim().length >= 2 && suggestions.length > 0 && (
                  <ul className="max-h-[min(22rem,50vh)] overflow-y-auto p-1.5">
                    {suggestions.map((s, i) => (
                      <li key={s.workKey}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveSuggest(i)}
                          onMouseDown={() => void openWork(s.workKey)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer',
                            i === activeSuggest
                              ? 'bg-stone-100 dark:bg-stone-900'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-900/60',
                          )}
                        >
                          <Cover id={s.coverId} title={s.title} size="sm" isbn={s.isbn} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-foreground">{s.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {s.authors[0] ?? 'Unknown'}
                              {s.year ? ` · ${s.year}` : ''}
                            </p>
                          </div>
                          <RatingStars value={s.rating} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {!suggestLoading && query.trim().length < 2 && (
                  <div className="p-4 space-y-5">
                    {recent.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2.5">Recent</p>
                        <div className="flex flex-wrap gap-2">
                          {recent.map(r => (
                            <button
                              key={r}
                              type="button"
                              onMouseDown={() => void runSearch(r)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900 text-foreground/80 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2.5">Popular</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map(r => (
                          <button
                            key={r}
                            type="button"
                            onMouseDown={() => void runSearch(r)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-muted-foreground hover:text-foreground hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!suggestLoading && query.trim().length >= 2 && suggestions.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">No matches for “{query}”</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {error && !book && (
        <div className="rounded-3xl border border-border/40 bg-card/30 py-20 text-center mb-10">
          <BookOpen className="size-9 mx-auto text-muted-foreground/35 mb-4" />
          <p className="text-lg font-light">{error}</p>
        </div>
      )}

      {/* Editorial book stage */}
      <div className="relative z-0 grid lg:grid-cols-[240px_minmax(0,1fr)_260px] gap-8 lg:gap-10 items-start">
        {/* Cover only */}
        <aside className="flex justify-center lg:justify-start">
          {loadingBook ? (
            <SkeletonBlock className="w-[200px] sm:w-[220px] aspect-[2/3]" />
          ) : book ? (
            <div className="lg:sticky lg:top-28">
              <Cover id={book.coverId} title={book.title} size="lg" isbn={book.isbn} />
            </div>
          ) : null}
        </aside>

        {/* Main content */}
        <main className="min-w-0">
          {loadingBook ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-10 w-4/5" />
              <SkeletonBlock className="h-5 w-1/3" />
              <SkeletonBlock className="h-28 w-full" />
              <SkeletonBlock className="h-48 w-full" />
            </div>
          ) : book ? (
            <motion.div
              key={book.workKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <header>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {book.popularity != null && book.popularity > 70 && (
                    <span className="text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-amber-500/12 text-amber-800 dark:text-amber-200 border border-amber-500/20">
                      Popular
                    </span>
                  )}
                  {chips.slice(0, 2).map(s => (
                    <span
                      key={s}
                      className="text-[10px] tracking-wide px-2.5 py-1 rounded-full text-muted-foreground bg-muted/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-light tracking-tight leading-[1.08] text-foreground">
                    {book.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => void shareBook()}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border text-xs transition-all cursor-pointer',
                      shared
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20',
                    )}
                    aria-label="Share book"
                  >
                    <Share2 className="size-3.5" />
                    <span className="hidden sm:inline">{shared ? 'Copied' : 'Share'}</span>
                  </button>
                </div>

                <p className="mt-3 text-[15px] text-muted-foreground">
                  {book.authors.join(', ') || 'Unknown author'}
                  {book.year ? (
                    <span className="text-muted-foreground/50"> · {book.year}</span>
                  ) : null}
                </p>
              </header>

              {/* Compact meta strip */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 py-4 border-y border-border/40">
                {[
                  { label: 'Rating', value: book.rating != null ? book.rating.toFixed(1) : '—' },
                  { label: 'Pages', value: book.pages ? String(book.pages) : '—' },
                  { label: 'Time', value: readingTime ?? '—' },
                  { label: 'Editions', value: book.editionCount ? String(book.editionCount) : '—' },
                  { label: 'Lang', value: book.languages?.length ? String(book.languages.length) : '—' },
                ].map(m => (
                  <div key={m.label} className="min-w-[4.5rem]">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">{m.label}</p>
                    <p className="font-mono text-base tabular-nums text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-1 p-1 rounded-xl bg-muted/30 w-fit">
                {(['overview', 'details', 'author'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-xs capitalize transition-all cursor-pointer',
                      tab === t
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm leading-[1.75] text-foreground/85 whitespace-pre-line">
                      {descOpen ? desc : shortDesc}
                    </p>
                    {desc.length > 380 && (
                      <button
                        type="button"
                        onClick={() => setDescOpen(v => !v)}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-300 hover:underline cursor-pointer"
                      >
                        {descOpen ? 'Show less' : 'Read more'}
                        <ChevronDown className={cn('size-3.5 transition-transform', descOpen && 'rotate-180')} />
                      </button>
                    )}
                  </div>

                  {chips.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {chips.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void runSearch(s)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'details' && (
                <div className="space-y-0 divide-y divide-border/40">
                  {[
                    { icon: Calendar, label: 'Published', value: book.year ?? '—' },
                    { icon: Building2, label: 'Publisher', value: book.publishers?.[0] ?? '—' },
                    { icon: Hash, label: 'ISBN', value: book.isbn ?? '—' },
                    { icon: Globe2, label: 'Languages', value: book.languages?.slice(0, 6).join(', ').toUpperCase() || '—' },
                    { icon: Layers, label: 'Editions', value: book.editionCount ?? '—' },
                    { icon: Bookmark, label: 'Want to read', value: book.wantToRead?.toLocaleString() ?? '—' },
                    { icon: BookOpen, label: 'Already read', value: book.alreadyRead?.toLocaleString() ?? '—' },
                    { icon: Clock, label: 'Difficulty', value: difficulty },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <row.icon className="size-3.5 opacity-60" />
                        {row.label}
                      </span>
                      <span className="text-sm font-mono text-right text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'author' && (
                <div className="flex items-start gap-5">
                  <div className="size-14 rounded-2xl overflow-hidden bg-muted/40 ring-1 ring-border/40 shrink-0 flex items-center justify-center">
                    {authorPhotoUrl(book.authorPhotoId) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={authorPhotoUrl(book.authorPhotoId)!} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-medium tracking-tight">{book.authors[0] ?? 'Unknown'}</p>
                    {book.authorBirth && (
                      <p className="text-xs text-muted-foreground mt-1">Born {book.authorBirth}</p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80 line-clamp-5">
                      {book.authorBio || 'No biography available for this author yet.'}
                    </p>
                    {book.authorKeys[0] && (
                      <a
                        href={`https://openlibrary.org/authors/${book.authorKeys[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-300 hover:underline"
                      >
                        Author on Open Library
                        <ArrowRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </main>

        {/* Insights — refined */}
        <aside>
          {loadingBook ? (
            <SkeletonBlock className="h-72 w-full" />
          ) : book ? (
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="rounded-3xl border border-border/40 bg-gradient-to-b from-white/80 to-white/40 dark:from-stone-900/80 dark:to-stone-950/40 backdrop-blur-xl p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Pulse</p>
                  <span className="relative flex size-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                    <span className="relative inline-flex rounded-full size-1.5 bg-violet-500" />
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-light tracking-tight tabular-nums text-foreground">
                    {book.popularity ?? 42}
                    <span className="text-base text-muted-foreground ml-1">/ 100</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Reader interest score</p>
                </div>

                <div className="space-y-5">
                  <InsightMeter
                    label="Popularity"
                    value={book.popularity ?? 42}
                    hint="Based on reading logs & editions"
                    tone="violet"
                  />
                  <InsightMeter
                    label="Community rating"
                    value={ratingPct}
                    hint={book.ratingsCount ? `${book.ratingsCount.toLocaleString()} ratings` : 'Limited ratings'}
                    tone="amber"
                  />
                </div>

                <div className="mt-6 pt-5 border-t border-border/40 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">Pace</p>
                    <p className="text-sm font-medium">{difficulty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">Sit time</p>
                    <p className="text-sm font-medium font-mono tabular-nums">{readingTime ?? '—'}</p>
                  </div>
                </div>
              </div>

              {trending.length > 0 && (
                <div className="rounded-3xl border border-border/40 bg-card/40 p-4">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <TrendingUp className="size-3.5 text-amber-500" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Also trending</p>
                  </div>
                  <div className="space-y-1">
                    {trending.slice(0, 4).map(t => (
                      <button
                        key={t.workKey}
                        type="button"
                        onClick={() => void openWork(t.workKey)}
                        className="w-full flex items-center gap-3 rounded-xl px-1.5 py-2 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                      >
                        <Cover id={t.coverId} title={t.title} size="sm" isbn={t.isbn} className="!w-9 !h-[3.35rem]" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.authors[0]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>

      {/* Similar */}
      {(similar.length > 0 || loadingBook) && (
        <section className="mt-16 md:mt-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-1.5">More like this</p>
              <h3 className="text-2xl font-light tracking-tight">Similar books</h3>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {loadingBook
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonBlock key={i} className="shrink-0 w-32 h-52" />
                ))
              : similar.map(s => (
                  <button
                    key={s.workKey}
                    type="button"
                    onClick={() => void openWork(s.workKey)}
                    className="shrink-0 w-32 snap-start text-left group cursor-pointer"
                  >
                    <Cover id={s.coverId} title={s.title} size="md" isbn={s.isbn} className="!w-32 !h-48" />
                    <p className="mt-3 text-sm font-medium line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-1">{s.authors[0]}</p>
                  </button>
                ))}
          </div>
        </section>
      )}

      {/* Mobile share bar */}
      {book && !loadingBook && (
        <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => void shareBook()}
            className="w-full h-12 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="size-4" />
            {shared ? 'Link copied' : 'Share this book'}
          </button>
        </div>
      )}

    </div>
  )
}
