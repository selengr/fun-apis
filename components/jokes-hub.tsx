'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Laugh,
  RefreshCw,
  Heart,
  Sparkles,
  Dices,
  Calendar,
  Layers,
  Infinity,
  ChevronDown,
  Copy,
  Check,
  Trash2,
} from 'lucide-react'
import type { Joke, JokeApiInfo, JokeResponse, StoredFavorite } from '@/types/jokeapi'
import { Input } from '@/components/ui/input'

const CATEGORIES = [
  { key: 'Any', emoji: '🎲', label: 'Any', accent: 'from-violet-500/20 to-transparent' },
  { key: 'Programming', emoji: '💻', label: 'Code', accent: 'from-sky-500/20 to-transparent' },
  { key: 'Pun', emoji: '🎪', label: 'Puns', accent: 'from-amber-500/20 to-transparent' },
  { key: 'Misc', emoji: '🃏', label: 'Misc', accent: 'from-rose-500/20 to-transparent' },
  { key: 'Dark', emoji: '🌙', label: 'Dark', accent: 'from-zinc-500/20 to-transparent' },
  { key: 'Spooky', emoji: '👻', label: 'Spooky', accent: 'from-purple-500/20 to-transparent' },
  { key: 'Christmas', emoji: '🎄', label: 'Xmas', accent: 'from-emerald-500/20 to-transparent' },
] as const

const FAVORITES_KEY = 'fun-apis-joke-favorites'

function isJoke(data: JokeResponse): data is Joke {
  return !data.error && 'id' in data && !('jokes' in data)
}

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

async function apiFetch(params: Record<string, string>) {
  const qs = new URLSearchParams(params)
  const res = await fetch(`/api/jokes?${qs}`, { cache: 'no-store' })
  const json: JokeResponse = await res.json()
  if (!res.ok || json.error) {
    throw new Error('message' in json ? json.message : 'Failed to load joke')
  }
  return json
}

function loadFavorites(): StoredFavorite[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveFavorites(favs: StoredFavorite[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

function JokeCard({
  joke,
  large,
  favorites,
  onToggleFavorite,
  revealed,
  onReveal,
}: {
  joke: Joke
  large?: boolean
  favorites: StoredFavorite[]
  onToggleFavorite: (j: Joke) => void
  revealed?: boolean
  onReveal?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isFav = favorites.some(f => f.id === joke.id)
  const cat = CATEGORIES.find(c => c.key === joke.category) ?? CATEGORIES[0]
  const isTwopart = joke.type === 'twopart'
  const showDelivery = !isTwopart || revealed

  const text = isTwopart
    ? revealed
      ? `${joke.setup}\n\n${joke.delivery}`
      : joke.setup
    : joke.joke

  const copy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(isTwopart && revealed ? `${joke.setup}\n\n${joke.delivery}` : text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden ${
        large ? 'p-6 md:p-8' : 'p-4 md:p-5'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-60 pointer-events-none`} />

      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {joke.category} · #{joke.id}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copy}
              className="size-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Copy joke"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(joke)}
              className={`size-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                isFav
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-border/60 text-muted-foreground hover:text-red-400'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`size-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {isTwopart ? (
          <div className="space-y-3">
            <p className={`leading-relaxed text-foreground ${large ? 'text-xl md:text-2xl font-light' : 'text-base'}`}>
              {joke.setup}
            </p>
            <AnimatePresence mode="wait">
              {showDelivery ? (
                <motion.p
                  key="delivery"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`font-medium text-foreground ${large ? 'text-lg md:text-xl' : 'text-base'}`}
                >
                  {joke.delivery}
                </motion.p>
              ) : (
                <motion.button
                  key="reveal"
                  type="button"
                  onClick={onReveal}
                  className="text-sm px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  Reveal punchline →
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className={`leading-relaxed text-foreground ${large ? 'text-xl md:text-2xl font-light' : 'text-base'}`}>
            {joke.joke}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function SpinWheel({
  spinning,
  landed,
  onSpin,
}: {
  spinning: boolean
  landed: string | null
  onSpin: () => void
}) {
  const segments = CATEGORIES.filter(c => c.key !== 'Any')

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-44 md:size-52">
        <motion.div
          animate={{ rotate: spinning ? 1080 + Math.random() * 360 : landed ? segments.findIndex(s => s.key === landed) * (360 / segments.length) : 0 }}
          transition={{ duration: spinning ? 2.2 : 0.5, ease: spinning ? [0.2, 0.8, 0.2, 1] : 'easeOut' }}
          className="absolute inset-0 rounded-full border-4 border-border/40 overflow-hidden"
          style={{ transformOrigin: 'center' }}
        >
          {segments.map((seg, i) => {
            const angle = (360 / segments.length) * i
            return (
              <div
                key={seg.key}
                className="absolute inset-0 flex items-start justify-center pt-4"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span className="text-lg" style={{ transform: `rotate(${-angle}deg)` }}>
                  {seg.emoji}
                </span>
              </div>
            )
          })}
          <div className="absolute inset-4 rounded-full bg-card/90 border border-border/40 flex items-center justify-center">
            <span className="text-2xl">{landed ? segments.find(s => s.key === landed)?.emoji ?? '🎲' : '🎲'}</span>
          </div>
        </motion.div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-amber-500 z-10" />
      </div>

      <button
        type="button"
        onClick={onSpin}
        disabled={spinning}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-sm font-medium hover:from-amber-500/25 hover:to-orange-500/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Dices className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
        {spinning ? 'Spinning…' : 'Spin for a joke'}
      </button>
    </div>
  )
}

export function JokesHub() {
  const [info, setInfo] = useState<JokeApiInfo | null>(null)
  const [category, setCategory] = useState('Any')
  const [heroJoke, setHeroJoke] = useState<Joke | null>(null)
  const [dailyJoke, setDailyJoke] = useState<Joke | null>(null)
  const [feed, setFeed] = useState<Joke[]>([])
  const [favorites, setFavorites] = useState<StoredFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [feedLoading, setFeedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [heroRevealed, setHeroRevealed] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spinLanded, setSpinLanded] = useState<string | null>(null)
  const [tab, setTab] = useState<'feed' | 'favorites'>('feed')
  const [search, setSearch] = useState('')
  const feedEndRef = useRef<HTMLDivElement>(null)
  const feedLoadingRef = useRef(false)

  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

  const fetchOne = useCallback(async (cat: string, extra?: Record<string, string>) => {
    const json = await apiFetch({ category: cat, ...extra })
    if (isJoke(json)) return json
    throw new Error('Unexpected response')
  }, [])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const infoJson = await apiFetch({ endpoint: 'info' }) as unknown as JokeApiInfo
      setInfo(infoJson)

      const total = infoJson.jokes?.totalCount ?? 1368
      const dailyId = dayOfYear() % total

      const [daily, hero, ...initialFeed] = await Promise.all([
        fetchOne('Any', { idRange: String(dailyId) }),
        fetchOne('Any'),
        ...Array.from({ length: 4 }, () => fetchOne('Any')),
      ])

      setDailyJoke(daily)
      setHeroJoke(hero)
      setFeed(initialFeed)
      setHeroRevealed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load jokes')
    } finally {
      setLoading(false)
    }
  }, [fetchOne])

  useEffect(() => {
    init()
  }, [init])

  const loadMore = useCallback(async () => {
    if (feedLoadingRef.current) return
    feedLoadingRef.current = true
    setFeedLoading(true)
    try {
      const params: Record<string, string> = { category, amount: '3' }
      if (search.trim()) params.contains = search.trim()
      const json = await apiFetch(params)
      if ('jokes' in json && Array.isArray(json.jokes)) {
        setFeed(prev => {
          const ids = new Set(prev.map(j => j.id))
          const fresh = json.jokes.filter(j => !ids.has(j.id))
          return [...prev, ...fresh]
        })
      } else if (isJoke(json)) {
        setFeed(prev => (prev.some(j => j.id === json.id) ? prev : [...prev, json]))
      }
    } catch {
      // silent for infinite scroll
    } finally {
      feedLoadingRef.current = false
      setFeedLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    const el = feedEndRef.current
    if (!el || tab !== 'feed') return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore, tab, feed.length])

  const randomJoke = async () => {
    if (randomLoading) return
    setError(null)
    setRandomLoading(true)
    try {
      const params: Record<string, string> = { category }
      if (search.trim()) params.contains = search.trim()
      const joke = await fetchOne(category, params)
      setHeroJoke(joke)
      setHeroRevealed(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No joke found')
    } finally {
      setRandomLoading(false)
    }
  }

  const spinForJoke = async () => {
    if (spinning) return
    setSpinning(true)
    setSpinLanded(null)
    setError(null)

    const segments = CATEGORIES.filter(c => c.key !== 'Any')
    const landed = segments[Math.floor(Math.random() * segments.length)].key

    setTimeout(async () => {
      setSpinLanded(landed)
      setSpinning(false)
      try {
        const joke = await fetchOne(landed)
        setHeroJoke(joke)
        setCategory(landed)
        setHeroRevealed(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Spin failed')
      }
    }, 2200)
  }

  const toggleFavorite = (joke: Joke) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === joke.id)
      const next = exists
        ? prev.filter(f => f.id !== joke.id)
        : [
            ...prev,
            {
              id: joke.id,
              category: joke.category,
              type: joke.type,
              joke: joke.joke,
              setup: joke.setup,
              delivery: joke.delivery,
              savedAt: Date.now(),
            },
          ]
      saveFavorites(next)
      return next
    })
  }

  const clearFavorites = () => {
    saveFavorites([])
    setFavorites([])
  }

  const changeCategory = async (cat: string) => {
    setCategory(cat)
    setFeed([])
    setError(null)
    try {
      const joke = await fetchOne(cat)
      setHeroJoke(joke)
      setHeroRevealed(false)
      const batch = await apiFetch({ category: cat, amount: '4' })
      if ('jokes' in batch) setFeed(batch.jokes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const totalJokes = info?.jokes?.totalCount ?? 1368

  const favoriteJokes = useMemo(
    () =>
      favorites.map(f => ({
        error: false as const,
        id: f.id,
        category: f.category,
        type: f.type,
        joke: f.joke,
        setup: f.setup,
        delivery: f.delivery,
        flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
        safe: true,
        lang: 'en',
      })),
    [favorites],
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: Laugh, label: 'Jokes', value: String(totalJokes), sub: 'in the library', accent: 'from-amber-500/20 to-transparent' },
          { icon: Layers, label: 'Categories', value: '7', sub: 'from code to Christmas', accent: 'from-orange-500/20 to-transparent' },
          { icon: Sparkles, label: 'Languages', value: '6', sub: 'joke languages', accent: 'from-yellow-500/20 to-transparent' },
          { icon: Heart, label: 'Saved', value: String(favorites.length), sub: 'your favorites', accent: 'from-rose-500/20 to-transparent' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-4 hover:border-border transition-colors"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <s.icon className="size-3.5" />
                <span className="text-[10px] uppercase tracking-[0.15em]">{s.label}</span>
              </div>
              <p className="text-xl md:text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Joke of the day */}
      {dailyJoke && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card/80 to-orange-500/5 p-5 md:p-6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4 px-3 py-1.5 rounded-full border border-border/70 bg-card/60">
              <Calendar className="size-3" />
              Joke of the day
            </div>
            <JokeCard
              joke={dailyJoke}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              revealed
            />
          </div>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Laugh className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && randomJoke()}
              placeholder="Search jokes… (e.g. bar, python, cat)"
              className="pl-10 h-11 rounded-2xl bg-card/50 border-border/60"
            />
          </div>
          <button
            type="button"
            onClick={randomJoke}
            disabled={randomLoading}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl border border-border/60 bg-card/50 text-sm hover:bg-muted/30 transition-all shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`size-4 ${randomLoading ? 'animate-spin' : ''}`} />
            {randomLoading ? 'Finding…' : 'Random joke'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => changeCategory(c.key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                category === c.key
                  ? 'bg-foreground text-background border-foreground font-medium'
                  : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {[
            { key: 'feed' as const, label: 'Infinite feed', icon: Infinity },
            { key: 'favorites' as const, label: `Favorites (${favorites.length})`, icon: Heart },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                tab === t.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
              }`}
            >
              <t.icon className="size-3" />
              {t.label}
            </button>
          ))}
          {tab === 'favorites' && favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="text-[11px] px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all inline-flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <Trash2 className="size-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center rounded-xl border border-red-500/20 bg-red-500/10 py-2 px-4">
          {error}
        </p>
      )}

      {/* Featured joke + Spin wheel — side by side */}
      {tab === 'feed' && (
        <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-stretch">
          {heroJoke && (
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Featured</p>
              <JokeCard
                joke={heroJoke}
                large
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                revealed={heroRevealed}
                onReveal={() => setHeroRevealed(true)}
              />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-5 md:p-6 flex flex-col items-center justify-center lg:w-72"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">Spin the wheel</p>
            <SpinWheel spinning={spinning} landed={spinLanded} onSpin={spinForJoke} />
          </motion.div>
        </div>
      )}

      {/* Feed or favorites */}
      {tab === 'feed' ? (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
            <Infinity className="size-3" /> Keep scrolling for more
          </p>
          <AnimatePresence mode="popLayout">
            {feed.map((joke, i) => (
              <JokeCard
                key={`feed-${joke.id}-${i}`}
                joke={joke}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                revealed
              />
            ))}
          </AnimatePresence>
          <div ref={feedEndRef} className="flex justify-center py-6">
            {feedLoading && <RefreshCw className="size-5 text-muted-foreground animate-spin" />}
            {!feedLoading && <ChevronDown className="size-5 text-muted-foreground/40 animate-bounce" />}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteJokes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border/50">
              <Heart className="size-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No favorites yet. Tap the heart on any joke.</p>
            </div>
          ) : (
            favoriteJokes.map(joke => (
              <JokeCard
                key={joke.id}
                joke={joke}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                revealed
              />
            ))
          )}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Powered by{' '}
        <a
          href="https://v2.jokeapi.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          JokeAPI
        </a>
        {' '}· safe mode on · no API key needed
      </p>
    </div>
  )
}
