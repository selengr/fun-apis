'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Volume2,
  X,
  Sparkles,
  ImageIcon,
} from 'lucide-react'
import type { DictionaryEntry } from '@/types/dictionary'
import { Input } from '@/components/ui/input'

const QUICK_WORDS = ['serendipity', 'ephemeral', 'eloquent', 'resilience', 'curious', 'wanderlust', 'harmony', 'luminous']

const PRON_FLAG: Record<string, string> = {
  UK: '🇬🇧',
  US: '🇺🇸',
  AU: '🇦🇺',
  CA: '🇨🇦',
}

interface Suggestion {
  word: string
  score: number
}

function labelFromAudio(url: string): string {
  const l = url.toLowerCase()
  if (l.includes('-uk.') || l.includes('_uk.')) return 'UK'
  if (l.includes('-us.') || l.includes('_us.')) return 'US'
  if (l.includes('-au.') || l.includes('_au.')) return 'AU'
  if (l.includes('-ca.')) return 'CA'
  return 'Audio'
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

  return { playing, play }
}

function WordPhoto({ word }: { word: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!word.trim()) return
    const ctrl = new AbortController()
    fetch(`/api/photos?word=${encodeURIComponent(word)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setSrc(d.image ?? null))
      .catch(() => setSrc(null))
    return () => ctrl.abort()
  }, [word])

  if (!src) return null

  return (
    <div className="relative h-56 lg:h-full min-h-[200px] rounded-2xl overflow-hidden border border-amber-900/10 dark:border-amber-100/10 shadow-2xl">
      <img src={src} alt={word} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/80 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
        <ImageIcon className="size-3" />
        Visual
      </span>
    </div>
  )
}

export function ClassicDictionary() {
  const [query, setQuery] = useState('serendipity')
  const [data, setData] = useState<DictionaryEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { playing, play } = useAudioPlayer()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lookup = useCallback(async (word: string) => {
    if (!word.trim()) return
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word.trim())}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Lookup failed')
      setData(json as DictionaryEntry[])
      setQuery((json as DictionaryEntry[])[0]?.word ?? word)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    lookup('serendipity')
  }, [lookup])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const onInputChange = (val: string) => {
    setQuery(val)
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    if (!val.trim() || val.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dictionary?endpoint=suggest&q=${encodeURIComponent(val)}`, { cache: 'no-store' })
        const json = await res.json()
        setSuggestions(json.suggestions ?? [])
        setShowSuggestions((json.suggestions ?? []).length > 0)
      } catch {
        setSuggestions([])
      }
    }, 280)
  }

  const entry = data?.[0]
  const phoneticText = entry?.phonetic ?? entry?.phonetics?.find(p => p.text)?.text ?? ''
  const pronunciations = useMemo(() => {
    if (!entry) return []
    const seen = new Set<string>()
    const out: { label: string; ipa?: string; audio: string }[] = []
    for (const p of entry.phonetics) {
      if (!p.audio) continue
      const label = labelFromAudio(p.audio)
      const key = `${label}-${p.audio}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ label, ipa: p.text, audio: p.audio.split('?')[0] })
    }
    return out
  }, [entry])

  const allMeanings = entry?.meanings ?? []
  const allDefs = allMeanings.flatMap(m =>
    m.definitions.map(d => ({ ...d, partOfSpeech: m.partOfSpeech })),
  )
  const synonyms = useMemo(() => {
    const set = new Set<string>()
    allMeanings.forEach(m => {
      m.synonyms.forEach(s => set.add(s))
      m.definitions.forEach(d => d.synonyms.forEach(s => set.add(s)))
    })
    return [...set].slice(0, 20)
  }, [allMeanings])

  const examples = useMemo(
    () => allDefs.filter(d => d.example).map(d => ({ example: d.example!, def: d.definition, pos: d.partOfSpeech })),
    [allDefs],
  )

  const copyWord = async () => {
    if (!entry) return
    await navigator.clipboard.writeText(entry.word)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWord = async () => {
    if (!entry) return
    if (navigator.share) await navigator.share({ title: entry.word, url: window.location.href })
    else await navigator.clipboard.writeText(entry.word)
  }

  const metrics = [
    { label: 'Meanings', value: entry ? String(allMeanings.length) : '—' },
    { label: 'Definitions', value: entry ? String(allDefs.length) : '—' },
    { label: 'Audio', value: entry ? String(pronunciations.length) : '—' },
    { label: 'Examples', value: entry ? String(examples.length) : '—' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-4 space-y-10">
      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center gap-x-10 gap-y-4 py-6 border-y border-amber-900/8 dark:border-amber-100/8"
      >
        {metrics.map(m => (
          <div key={m.label} className="text-center min-w-[80px]">
            <p className="text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tabular-nums">{m.value}</p>
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
      >
        <div className="flex flex-col sm:flex-row gap-3">
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
                    <li key={s.word}>
                      <button
                        type="button"
                        onMouseDown={() => { setQuery(s.word); lookup(s.word) }}
                        className="w-full px-4 py-3 text-sm text-left rounded-xl hover:bg-amber-500/8 transition-colors cursor-pointer"
                      >
                        {s.word}
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
            className="h-14 px-8 rounded-full bg-stone-900 dark:bg-amber-100 text-amber-50 dark:text-stone-900 text-sm uppercase tracking-[0.2em] font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 shrink-0"
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

      {error && <p className="text-center text-sm text-red-500/90 py-2">{error}</p>}

      <AnimatePresence mode="wait">
        {entry && !error && (
          <motion.div
            key={entry.word}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`space-y-10 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Hero */}
            <section className="relative rounded-3xl overflow-hidden border border-amber-900/8 dark:border-amber-100/8 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-stone-100/30 dark:from-amber-950/20 dark:to-transparent pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row">
                <div className="flex-1 p-8 sm:p-10 lg:p-12">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-amber-700/50 dark:text-amber-300/40 mb-6">
                    Entry · English
                  </p>
                  <h2 className="text-5xl sm:text-6xl md:text-7xl font-light text-stone-900 dark:text-stone-50 capitalize leading-[0.95] tracking-tight">
                    {entry.word}
                  </h2>
                  {phoneticText && (
                    <p className="mt-4 text-lg text-amber-900/50 dark:text-amber-200/40 font-mono tracking-wider">{phoneticText}</p>
                  )}
                  {pronunciations.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {pronunciations.map(p => {
                        const id = `pron-${p.label}`
                        const active = playing === id
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => play(id, p.audio)}
                            className={`inline-flex items-center gap-3 h-12 pl-4 pr-5 rounded-full border text-sm transition-all cursor-pointer ${
                              active
                                ? 'border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-100 shadow-[0_0_24px_rgba(201,169,98,0.2)]'
                                : 'border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-white/[0.04] hover:border-amber-500/35 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span>{PRON_FLAG[p.label] ?? '✦'}</span>
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
                  <div className="flex flex-wrap gap-2 mt-8">
                    <button
                      type="button"
                      onClick={copyWord}
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-amber-900/10 dark:border-amber-100/10 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={shareWord}
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-amber-900/10 dark:border-amber-100/10 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      <Share2 className="size-3.5" />
                      Share
                    </button>
                  </div>
                </div>
                <div className="lg:w-[340px] xl:w-[380px] shrink-0 p-6 lg:p-8 lg:pl-0">
                  <WordPhoto word={entry.word} />
                </div>
              </div>
            </section>

            {synonyms.length > 0 && (
              <section className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 bg-white/50 dark:bg-white/[0.02] p-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-4">Synonyms</p>
                <div className="flex flex-wrap gap-2">
                  {synonyms.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => lookup(s)}
                      className="text-sm px-4 py-1.5 rounded-full border border-amber-900/8 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-4 text-amber-600/60" />
                  <h3 className="text-xl font-light">Definitions</h3>
                </div>
                <div className="space-y-4">
                  {allDefs.map((def, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="relative pl-6 py-4 border-l border-amber-500/25"
                    >
                      <span className="absolute left-0 top-5 -translate-x-1/2 size-2 rounded-full bg-amber-500/60" />
                      <span className="text-[9px] uppercase tracking-[0.25em] text-amber-700/50 dark:text-amber-300/40">
                        {def.partOfSpeech}
                      </span>
                      <p className="mt-1 text-base text-stone-700 dark:text-stone-300 leading-relaxed">{def.definition}</p>
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
                {examples.length > 0 && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 p-6 bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="size-4 text-amber-600/50" />
                      <span className="text-[9px] uppercase tracking-[0.3em] text-stone-400">In context</span>
                    </div>
                    <div className="space-y-4">
                      {examples.slice(0, 6).map((ex, i) => (
                        <div key={i}>
                          <p className="text-sm italic text-stone-600 dark:text-stone-400 leading-relaxed">
                            &ldquo;{ex.example}&rdquo;
                          </p>
                          <p className="mt-1 text-xs text-stone-400 line-clamp-2">{ex.def}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {entry.sourceUrls?.[0] && (
                  <div className="rounded-2xl border border-amber-900/8 dark:border-amber-100/8 p-6 bg-white/50 dark:bg-white/[0.02]">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-3">Source</p>
                    <a
                      href={entry.sourceUrls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-800/70 dark:text-amber-200/60 hover:underline break-all"
                    >
                      Wiktionary reference
                    </a>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center pt-4">
        <p className="text-[9px] uppercase tracking-[0.35em] text-stone-400 dark:text-stone-600">
          Free Dictionary API · Datamuse
        </p>
      </footer>
    </div>
  )
}
