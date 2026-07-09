'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Languages,
  BookOpen,
  Globe2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  X,
  Volume2,
  Gem,
} from 'lucide-react'
import type { WiktionaryEntry, Pronunciation, WiktionaryTranslation } from '@/types/wiktionary'
import { Input } from '@/components/ui/input'

const QUICK_WORDS = ['hello', 'love', 'water', 'friend', 'thank you', 'goodbye', 'peace', 'world']

const LANG_COUNTRY: Record<string, string> = {
  English: 'gb', German: 'de', French: 'fr', Spanish: 'es', Italian: 'it',
  Portuguese: 'pt', Russian: 'ru', Japanese: 'jp', Chinese: 'cn', Mandarin: 'cn',
  Arabic: 'sa', Persian: 'ir', Hindi: 'in', Korean: 'kr', Turkish: 'tr', Dutch: 'nl',
  Polish: 'pl', Swedish: 'se', Norwegian: 'no', Danish: 'dk', Finnish: 'fi',
  Greek: 'gr', Hebrew: 'il', Ukrainian: 'ua', Vietnamese: 'vn', Indonesian: 'id',
  Thai: 'th', Czech: 'cz', Romanian: 'ro', Hungarian: 'hu',
}

const CODE_OVERRIDES: Record<string, string> = {
  en: 'gb', ja: 'jp', zh: 'cn', fa: 'ir', ko: 'kr', ar: 'sa', hi: 'in',
  el: 'gr', he: 'il', uk: 'ua', vi: 'vn', id: 'id', cs: 'cz',
}

const PRON_FLAG: Record<string, string> = {
  UK: '🇬🇧', US: '🇺🇸', AU: '🇦🇺', CA: '🇨🇦', Audio: '✦',
}

const serif = { fontFamily: 'var(--font-dictionary-display), Georgia, "Times New Roman", serif' }

function countryCode(language: string, code?: string): string | null {
  if (LANG_COUNTRY[language]) return LANG_COUNTRY[language]
  const base = language.split(/[\s(]/)[0]
  if (LANG_COUNTRY[base]) return LANG_COUNTRY[base]
  if (code) {
    const c = CODE_OVERRIDES[code] ?? code
    if (/^[a-z]{2}(-[a-z]{3,})?$/i.test(c)) return c.toLowerCase()
  }
  return null
}

function flagSrc(language: string, code?: string) {
  const cc = countryCode(language, code)
  return cc ? `https://flagcdn.com/w640/${cc}.png` : null
}

function useAudioPlayer() {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)

  const play = useCallback((id: string, url: string) => {
    if (!url) return
    try {
      ref.current?.pause()
      const audio = new Audio(url)
      ref.current = audio
      setPlaying(id)
      audio.onended = () => setPlaying(null)
      audio.onerror = () => setPlaying(null)
      void audio.play()
    } catch {
      setPlaying(null)
    }
  }, [])

  const stop = useCallback(() => {
    ref.current?.pause()
    setPlaying(null)
  }, [])

  return { playing, play, stop }
}

function AudioButton({
  id,
  url,
  size = 'md',
  playing,
  onPlay,
}: {
  id: string
  url?: string
  size?: 'sm' | 'md'
  playing: string | null
  onPlay: (id: string, url: string) => void
}) {
  if (!url) return null
  const active = playing === id
  const dim = size === 'sm' ? 'size-8' : 'size-10'

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onPlay(id, url)
      }}
      className={`${dim} rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shrink-0 ${
        active
          ? 'border-amber-400/60 bg-amber-500/20 text-amber-700 dark:text-amber-200 shadow-[0_0_20px_rgba(201,169,98,0.25)]'
          : 'border-amber-900/10 dark:border-amber-100/15 bg-white/60 dark:bg-white/5 text-stone-500 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-200'
      }`}
      aria-label="Play pronunciation"
    >
      {active ? (
        <span className="flex gap-0.5 items-end h-3">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className="w-0.5 bg-amber-600 dark:bg-amber-300 rounded-full animate-pulse"
              style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </span>
      ) : (
        <Volume2 className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      )}
    </button>
  )
}

function FlagHero({ language, code, className = '' }: { language: string; code?: string; className?: string }) {
  const src = flagSrc(language, code)
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent mix-blend-overlay" />
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-amber-100/90 font-medium">{language}</p>
      </div>
    </div>
  )
}

function TranslationCard({
  t,
  index,
  hero,
  playing,
  onPlay,
}: {
  t: WiktionaryTranslation
  index: number
  hero?: boolean
  playing: string | null
  onPlay: (id: string, url: string) => void
}) {
  const audioId = `trans-${t.language}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-amber-900/8 dark:border-amber-100/8 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.04)] hover:shadow-[0_28px_80px_rgba(201,169,98,0.12)] transition-shadow duration-500`}
    >
      <FlagHero language={t.language} code={t.code} className={'h-32 sm:h-36'} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={`text-stone-900 dark:text-stone-50 leading-none tracking-tight text-2xl sm:text-3xl`}
              style={serif}
            >
              {t.terms[0]}
            </p>
            {t.ipa && (
              <p className="mt-2 text-sm text-amber-800/60 dark:text-amber-200/50 font-mono tracking-wide">{t.ipa}</p>
            )}
            {t.terms.length > 1 && (
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {t.terms.slice(1, 3).join(' · ')}
              </p>
            )}
            {t.gloss && (
              <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed italic">
                {t.gloss}
              </p>
            )}
          </div>
          <AudioButton id={audioId} url={t.audio} playing={playing} onPlay={onPlay} />
        </div>
      </div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
    </motion.article>
  )
}

function PronunciationBar({
  pronunciations,
  phonetic,
  playing,
  onPlay,
}: {
  pronunciations: Pronunciation[]
  phonetic?: string
  playing: string | null
  onPlay: (id: string, url: string) => void
}) {
  if (!pronunciations.length && !phonetic) return null

  return (
    <div className="mt-6 space-y-4">
      {phonetic && (
        <p className="text-lg sm:text-xl text-amber-900/50 dark:text-amber-200/40 font-mono tracking-wider">{phonetic}</p>
      )}
      {pronunciations.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {pronunciations.map(p => {
            const id = `main-${p.label}`
            const active = playing === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => p.audio && onPlay(id, p.audio)}
                disabled={!p.audio}
                className={`inline-flex items-center gap-3 h-12 pl-4 pr-5 rounded-full border text-sm transition-all duration-300 cursor-pointer disabled:opacity-35 ${
                  active
                    ? 'border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-100 shadow-[0_0_24px_rgba(201,169,98,0.2)]'
                    : 'border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-white/[0.04] hover:border-amber-500/35 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span className="text-base">{PRON_FLAG[p.label] ?? '✦'}</span>
                <span className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] opacity-60">{p.label}</span>
                  {p.ipa && <span className="text-xs font-mono">{p.ipa}</span>}
                </span>
                <Volume2 className={`size-4 ${active ? 'text-amber-600' : 'opacity-50'}`} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

async function fetchEntry(word: string): Promise<WiktionaryEntry> {
  const res = await fetch(`/api/wiktionary?word=${encodeURIComponent(word)}`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Lookup failed')
  return json
}

async function fetchSuggestions(q: string): Promise<string[]> {
  const res = await fetch(`/api/wiktionary?endpoint=suggest&q=${encodeURIComponent(q)}`, { cache: 'no-store' })
  const json = await res.json()
  return json.suggestions ?? []
}

export function WiktionaryDictionary() {
  const [query, setQuery] = useState('hello')
  const [entry, setEntry] = useState<WiktionaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAllTranslations, setShowAllTranslations] = useState(false)
  const [copied, setCopied] = useState(false)
  const { playing, play } = useAudioPlayer()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lookup = useCallback(async (word: string) => {
    if (!word.trim()) return
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    setShowAllTranslations(false)
    try {
      const data = await fetchEntry(word.trim())
      setEntry(data)
      setQuery(data.word)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { lookup('hello') }, [lookup])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const onInputChange = (val: string) => {
    setQuery(val)
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    if (!val.trim() || val.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    suggestTimer.current = setTimeout(async () => {
      try {
        const items = await fetchSuggestions(val)
        setSuggestions(items)
        setShowSuggestions(items.length > 0)
      } catch { setSuggestions([]) }
    }, 280)
  }

  const copySummary = async () => {
    if (!entry) return
    const lines = entry.translations.slice(0, 16).map(t => `${t.language}: ${t.terms[0] ?? ''}`).join('\n')
    await navigator.clipboard.writeText(`${entry.word}\n\n${lines}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const featured = useMemo(() => {
    if (!entry) return []
    const english: WiktionaryTranslation = { language: 'English', terms: [entry.word], code: 'en' }
    const priority = ['German', 'French', 'Spanish', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Persian', 'Arabic']
    const picked = priority.map(lang => entry.translations.find(t => t.language === lang)).filter(Boolean) as WiktionaryTranslation[]
    return [english, ...picked.slice(0, 8)]
  }, [entry])

  const moreTranslations = useMemo(() => {
    if (!entry) return []
    const set = new Set(featured.map(t => t.language))
    return entry.translations.filter(t => !set.has(t.language))
  }, [entry, featured])

  const metrics = [
    { label: 'Languages', value: entry?.translationCount ?? '—' },
    { label: 'Audio clips', value: entry?.audioCount ?? '—' },
    { label: 'Definitions', value: entry?.definitions.length ?? '—' },
    { label: 'Examples', value: entry?.examples.length ?? '—' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-4 space-y-10">
      {/* Metrics strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center gap-x-10 gap-y-4 py-6 border-y border-amber-900/8 dark:border-amber-100/8"
      >
        {metrics.map(m => (
          <div key={m.label} className="text-center min-w-[80px]">
            <p className="text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tabular-nums" style={serif}>
              {m.value}
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 mt-1">{m.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        ref={wrapperRef}
        className="relative"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
            <Input
              value={query}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') lookup(query)
                if (e.key === 'Escape') setShowSuggestions(false)
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search a word…"
              className="h-14 pl-12 pr-12 text-base rounded-full border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl shadow-inner focus-visible:ring-amber-500/30"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-[calc(100%+10px)] left-0 right-0 z-[100] max-h-64 overflow-y-auto rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-white/95 dark:bg-stone-950/95 backdrop-blur-2xl shadow-2xl p-2"
                >
                  {suggestions.map(s => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={() => { setQuery(s); lookup(s) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-xl hover:bg-amber-500/8 transition-colors cursor-pointer"
                        style={serif}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => lookup(query)}
            disabled={loading || !query.trim()}
            className="h-14 px-8 rounded-full bg-stone-900 dark:bg-amber-100 text-amber-50 dark:text-stone-900 text-sm uppercase tracking-[0.2em] font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 shrink-0 shadow-lg"
          >
            {loading ? <RefreshCw className="size-4 animate-spin mx-auto" /> : 'Discover'}
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {QUICK_WORDS.map(w => (
            <button
              key={w}
              type="button"
              onClick={() => lookup(w)}
              className="text-xs px-4 py-1.5 rounded-full border border-amber-900/10 dark:border-amber-100/10 text-stone-500 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-500/30 transition-all cursor-pointer tracking-wide"
            >
              {w}
            </button>
          ))}
        </div>
      </motion.div>

      {error && (
        <p className="text-center text-sm text-red-500/90 py-3">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {entry && !error && (
          <motion.div
            key={entry.word}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`space-y-12 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Hero entry */}
            <section className="relative rounded-3xl overflow-hidden border border-amber-900/8 dark:border-amber-100/8 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-stone-100/30 dark:from-amber-950/20 dark:to-transparent pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row">
                <div className="flex-1 p-8 sm:p-10 lg:p-12">
                  <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-amber-700/50 dark:text-amber-300/40 mb-6">
                    <Gem className="size-3" />
                    Entry
                  </div>
                  <h2
                    className="text-6xl sm:text-7xl md:text-8xl font-light text-stone-900 dark:text-stone-50 capitalize leading-[0.95]"
                    style={serif}
                  >
                    {entry.word}
                  </h2>
                  <PronunciationBar
                    pronunciations={entry.pronunciations}
                    phonetic={entry.phonetic}
                    playing={playing}
                    onPlay={play}
                  />
                  <div className="flex flex-wrap gap-2 mt-8">
                    <button
                      type="button"
                      onClick={copySummary}
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-amber-900/10 dark:border-amber-100/10 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-amber-900/10 dark:border-amber-100/10 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      Wiktionary <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
                {entry.image && (
                  <div className="lg:w-[340px] xl:w-[380px] shrink-0 p-6 lg:p-8 lg:pl-0">
                    <div className="relative h-56 lg:h-full min-h-[200px] rounded-2xl overflow-hidden border border-amber-900/10 dark:border-amber-100/10 shadow-2xl">
                      <img src={entry.image.url} alt={entry.word} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Synonyms & antonyms */}
            {(entry.synonyms.length > 0 || entry.antonyms.length > 0) && (
              <section className="grid sm:grid-cols-2 gap-6">
                {entry.synonyms.length > 0 && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 bg-white/50 dark:bg-white/[0.02] p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-4">Synonyms</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.synonyms.map(s => (
                        <button key={s} type="button" onClick={() => lookup(s)} className="text-sm px-4 py-1.5 rounded-full border border-amber-900/8 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer" style={serif}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {entry.antonyms.length > 0 && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 bg-white/50 dark:bg-white/[0.02] p-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-4">Antonyms</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.antonyms.map(a => (
                        <button key={a} type="button" onClick={() => lookup(a)} className="text-sm px-4 py-1.5 rounded-full border border-stone-300/30 dark:border-stone-600/30 text-stone-500 hover:border-stone-400 transition-all cursor-pointer" style={serif}>{a}</button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Translations */}
            <section>
              <div className="flex items-end justify-between mb-8 px-1">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-amber-700/50 dark:text-amber-300/40 mb-2">Global</p>
                  <h3 className="text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-50" style={serif}>Across Languages</h3>
                </div>
                <span className="text-xs text-stone-400 tracking-widest">{entry.translationCount} dialects</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((t, i) => (
                  <TranslationCard key={t.language} t={t} index={i} hero={i === 0} playing={playing} onPlay={play} />
                ))}
              </div>
            </section>

            {moreTranslations.length > 0 && (
              <section className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 overflow-hidden bg-white/40 dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setShowAllTranslations(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-amber-500/[0.03] transition-colors cursor-pointer"
                >
                  <span className="text-sm uppercase tracking-[0.15em] text-stone-600 dark:text-stone-400">
                    {showAllTranslations ? 'Collapse' : `View ${moreTranslations.length} more languages`}
                  </span>
                  <ChevronDown className={`size-5 text-stone-400 transition-transform duration-500 ${showAllTranslations ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showAllTranslations && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-amber-900/8 dark:border-amber-100/8">
                      <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto">
                        {moreTranslations.map((t, i) => (
                          <motion.div
                            key={t.language}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.012, 0.35) }}
                            className="group rounded-xl border border-amber-900/6 dark:border-amber-100/6 overflow-hidden bg-white/60 dark:bg-white/[0.02]"
                          >
                            <FlagHero language={t.language} code={t.code} className="h-24" />
                            <div className="p-3 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-base truncate" style={serif}>{t.terms[0]}</p>
                                {t.ipa && <p className="text-[10px] font-mono text-stone-400 truncate">{t.ipa}</p>}
                              </div>
                              <AudioButton id={`more-${t.language}`} url={t.audio} size="sm" playing={playing} onPlay={play} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Definitions & context */}
            <section className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="size-4 text-amber-600/60" />
                  <h3 className="text-xl font-light" style={serif}>Definitions</h3>
                </div>
                <div className="space-y-4">
                  {entry.definitions.map((def, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative pl-6 py-5 border-l border-amber-500/25"
                    >
                      <span className="absolute left-0 top-5 -translate-x-1/2 size-2 rounded-full bg-amber-500/60" />
                      {def.partOfSpeech && (
                        <span className="text-[9px] uppercase tracking-[0.25em] text-amber-700/50 dark:text-amber-300/40">{def.partOfSpeech}</span>
                      )}
                      <p className="mt-1 text-base text-stone-700 dark:text-stone-300 leading-relaxed">{def.text}</p>
                      {def.example && (
                        <p className="mt-3 text-sm italic text-stone-500 dark:text-stone-400 pl-4 border-l border-amber-400/20">
                          &ldquo;{def.example}&rdquo;
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                {entry.etymology && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 p-6 bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="size-4 text-amber-600/50" />
                      <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Etymology</span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{entry.etymology}</p>
                  </div>
                )}
                {entry.examples.length > 0 && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 p-6 bg-white/50 dark:bg-white/[0.02]">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-4">In context</p>
                    <div className="space-y-4">
                      {entry.examples.map((ex, i) => (
                        <p key={i} className="text-sm italic text-stone-600 dark:text-stone-400 leading-relaxed" style={serif}>
                          &ldquo;{ex}&rdquo;
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {entry.wikiExtract && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 p-6 bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Globe2 className="size-4 text-amber-600/50" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Encyclopedia</span>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{entry.wikiExtract}…</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}
