'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Globe2,
  MapPin,
  Users,
  Coins,
  Languages,
  Clock,
  Shuffle,
  X,
  ExternalLink,
  Mountain,
  Car,
  Phone,
} from 'lucide-react'
import type { Country, CountriesResponse } from '@/types/restcountries'
import { cn } from '@/lib/utils'

type SearchMode = 'name' | 'capital' | 'code' | 'all'

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const

/** Region atmosphere — scenic Unsplash plates behind posters */
const REGION_SCENES: Record<string, string> = {
  Africa:
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=70',
  Americas:
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=70',
  Asia:
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=70',
  Europe:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=70',
  Oceania:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=70',
  Other:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=70',
}

const PAGE_SIZE = 18

function formatPopulation(n?: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

function formatArea(km?: number) {
  if (!km) return '—'
  return `${new Intl.NumberFormat('en-US').format(Math.round(km))} km²`
}

async function fetchCountries(params: Record<string, string>) {
  const qs = new URLSearchParams(params)
  const res = await fetch(`/api/countries?${qs}`, { cache: 'no-store' })
  const json: CountriesResponse & { error?: string } = await res.json()
  if (!res.ok) {
    throw new Error(
      json.errors?.[0]?.message ?? json.error ?? `Request failed (${res.status})`,
    )
  }
  return json
}

function CountryPoster({
  country,
  selected,
  onSelect,
  index,
}: {
  country: Country
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const region = country.region ?? 'Other'
  const scene = REGION_SCENES[region] ?? REGION_SCENES.Other
  const name = country.names?.common ?? '—'
  const capital = country.capitals?.[0]?.name

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.45 }}
      onClick={onSelect}
      className={cn(
        'group relative aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] border text-left transition-all duration-500',
        selected
          ? 'border-foreground/40 ring-2 ring-foreground/20 scale-[1.01]'
          : 'border-white/10 dark:border-white/10 hover:border-foreground/25',
      )}
    >
      {/* Scenic region plate */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />

      {/* Flag as vertical ribbon */}
      <div className="absolute top-0 bottom-0 left-0 w-[28%] overflow-hidden border-r border-white/10">
        {country.flag?.url_png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={country.flag.url_png}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-4xl">
            {country.flag?.emoji ?? '🏳️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
      </div>

      <div className="absolute top-3 right-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/70 bg-black/35 backdrop-blur-sm px-2 py-1 rounded-md">
          {country.codes?.alpha_2}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 pl-[32%] sm:p-5 sm:pl-[32%]">
        <p className="text-[9px] uppercase tracking-[0.28em] text-white/50 mb-1.5">
          {region}
        </p>
        <h3
          className="text-xl sm:text-2xl font-light text-white leading-tight tracking-tight line-clamp-2"
          style={{ fontFamily: 'var(--font-atlas-display), Georgia, serif' }}
        >
          {name}
        </h3>
        <p className="mt-2 text-xs text-white/55 truncate">
          {capital ? capital : '—'}
          <span className="mx-1.5 text-white/25">·</span>
          {formatPopulation(country.population)}
        </p>
      </div>
    </motion.button>
  )
}

function CountryDetail({ country, onClose }: { country: Country; onClose: () => void }) {
  const region = country.region ?? 'Other'
  const scene = REGION_SCENES[region] ?? REGION_SCENES.Other
  const capital = country.capitals?.[0]?.name
  const demonym = country.demonyms?.eng?.m ?? country.demonyms?.eng?.f

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="relative overflow-hidden rounded-[1.5rem] border border-border"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-50"
      />
      <div className="absolute inset-0 bg-background/80 dark:bg-background/75 backdrop-blur-md" />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 size-9 rounded-full border border-border bg-card/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="shrink-0 w-full md:w-56">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border shadow-lg">
              {country.flag?.url_png ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={country.flag.url_png}
                  alt={`${country.names?.common} flag`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-6xl bg-muted">
                  {country.flag?.emoji ?? '🏳️'}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-2">
              {country.region}
              {country.subregion ? ` · ${country.subregion}` : ''}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl" aria-hidden>
                {country.flag?.emoji}
              </span>
              <h2
                className="text-3xl md:text-5xl font-light tracking-tight text-foreground leading-none"
                style={{ fontFamily: 'var(--font-atlas-display), Georgia, serif' }}
              >
                {country.names?.common}
              </h2>
            </div>
            {country.names?.official &&
            country.names.official !== country.names.common ? (
              <p className="mt-2 text-sm italic text-muted-foreground">{country.names.official}</p>
            ) : null}
            {demonym ? (
              <p className="mt-2 text-sm text-muted-foreground">
                People here are called{' '}
                <span className="text-foreground">{demonym}</span>
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border">
              {[
                { icon: MapPin, label: 'Capital', value: capital ?? '—' },
                {
                  icon: Users,
                  label: 'Population',
                  value: formatPopulation(country.population),
                },
                {
                  icon: Mountain,
                  label: 'Area',
                  value: formatArea(country.area?.kilometers),
                },
                {
                  icon: Globe2,
                  label: 'Borders',
                  value: country.borders?.length
                    ? `${country.borders.length}`
                    : country.landlocked
                      ? 'Landlocked'
                      : '—',
                },
              ].map(s => (
                <div key={s.label} className="bg-card/90 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <s.icon className="size-3" />
                    <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {country.languages && country.languages.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Languages className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Languages</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {country.languages.map(l => l.name).filter(Boolean).join(' · ')}
                  </p>
                </div>
              ) : null}

              {country.currencies && country.currencies.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Coins className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Currency</span>
                  </div>
                  <p className="text-sm font-mono text-foreground/80">
                    {country.currencies
                      .map(c => `${c.symbol ?? ''} ${c.code}`.trim())
                      .join(' · ')}
                  </p>
                </div>
              ) : null}

              {country.timezones && country.timezones.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Clock className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Timezones</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {country.timezones.slice(0, 4).join(' · ')}
                    {country.timezones.length > 4
                      ? ` · +${country.timezones.length - 4} more`
                      : ''}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                {country.cars?.driving_side ? (
                  <span className="inline-flex items-center gap-1">
                    <Car className="size-3" /> Drives on the {country.cars.driving_side}
                  </span>
                ) : null}
                {country.calling_codes?.[0] ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" /> +{country.calling_codes[0]}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {country.links?.wikipedia ? (
                  <a
                    href={country.links.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors"
                  >
                    Wikipedia <ExternalLink className="size-3" />
                  </a>
                ) : null}
                {country.links?.google_maps ? (
                  <a
                    href={country.links.google_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors"
                  >
                    Maps <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const MODE_OPTIONS: { key: SearchMode; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Name', placeholder: 'Find a country…' },
  { key: 'capital', label: 'Capital', placeholder: 'Find a capital…' },
  { key: 'code', label: 'Code', placeholder: 'CA, JP, BR…' },
  { key: 'all', label: 'Anything', placeholder: 'Search anything…' },
]

export function CountriesExplorer() {
  const [countries, setCountries] = useState<Country[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('name')
  const [region, setRegion] = useState<string | null>(null)
  const [selected, setSelected] = useState<Country | null>(null)
  const [page, setPage] = useState(0)

  const buildParams = useCallback(
    (pageIndex: number): Record<string, string> => {
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        offset: String(pageIndex * PAGE_SIZE),
      }
      const q = query.trim()

      if (region) {
        params.path = `region/${region}`
        if (q) params.q = q
        return params
      }

      if (!q) return params

      if (mode === 'name') params.path = 'name'
      else if (mode === 'code') params.path = 'code'
      else if (mode === 'capital') params.path = 'capitals'
      params.q = q
      return params
    },
    [query, mode, region],
  )

  const reqId = useRef(0)
  const runFetch = useCallback(
    async (pageIndex: number) => {
      const id = ++reqId.current
      setLoading(true)
      setError(null)
      try {
        const json = await fetchCountries(buildParams(pageIndex))
        if (id !== reqId.current) return
        const list = json.data?.objects ?? []
        setCountries(list)
        setTotal(json.data?.meta?.total ?? list.length)
      } catch (err) {
        if (id !== reqId.current) return
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setCountries([])
        setTotal(0)
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    },
    [buildParams],
  )

  useEffect(() => {
    const delay = query ? 350 : 0
    const t = setTimeout(() => {
      setPage(0)
      runFetch(0)
    }, delay)
    return () => clearTimeout(t)
  }, [query, mode, region, runFetch])

  const goToPage = useCallback(
    (next: number) => {
      setPage(next)
      runFetch(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [runFetch],
  )

  const surpriseMe = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26))
      const json = await fetchCountries({ path: 'name', q: letter, limit: '50' })
      const list = json.data?.objects ?? []
      if (list.length) setSelected(list[Math.floor(Math.random() * list.length)])
    } catch {
      setError('Could not fetch a random country. Try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPlaceholder =
    MODE_OPTIONS.find(m => m.key === mode)?.placeholder ?? ''

  const subtitle = useMemo(() => {
    if (loading) return 'Opening the atlas…'
    if (error) return ''
    if (region && query.trim()) return `${total} in ${region} matching “${query.trim()}”`
    if (region) return `${total} countries in ${region}`
    if (query.trim()) return `${total} matches for “${query.trim()}”`
    return `${total} countries`
  }, [loading, error, total, region, query])

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-6 space-y-10">
      {/* Hero + search */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">
          World atlas
        </p>
        <h1
          className="text-[clamp(2.75rem,10vw,5rem)] font-light tracking-tight text-foreground leading-none"
          style={{ fontFamily: 'var(--font-atlas-display), Georgia, serif' }}
        >
          Explore the world
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
          Travel-poster countries — search, filter by region, or surprise yourself.
        </p>
      </motion.header>

      <div className="max-w-2xl mx-auto space-y-5">
        <form
          onSubmit={e => e.preventDefault()}
          className="relative flex items-center gap-3 border-b-2 border-foreground/15 focus-within:border-foreground transition-colors pb-3"
        >
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={currentPlaceholder}
            className="flex-1 bg-transparent text-xl md:text-2xl font-light tracking-tight text-foreground placeholder:text-muted-foreground/45 outline-none min-w-0"
            style={{ fontFamily: 'var(--font-atlas-display), Georgia, serif' }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear"
            >
              <X className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={surpriseMe}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Shuffle className="size-3.5" />
            Surprise
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {MODE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMode(opt.key)}
              className={cn(
                'text-xs tracking-wide transition-colors',
                mode === opt.key
                  ? 'text-foreground underline underline-offset-4'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setRegion(null)}
            className={cn(
              'text-[11px] px-3 py-1.5 rounded-full border transition-all',
              !region
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          {REGIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r === region ? null : r)}
              className={cn(
                'text-[11px] px-3 py-1.5 rounded-full border transition-all',
                region === r
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">{subtitle}</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive text-center rounded-xl border border-destructive/20 bg-destructive/10 py-2 px-4">
          {error}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {selected ? (
          <CountryDetail
            key={selected.codes?.alpha_3}
            country={selected}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>

      {loading && countries.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-[1.25rem] bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe2 className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No countries found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {countries.map((c, i) => (
              <CountryPoster
                key={c.codes?.alpha_3 ?? c.names?.common ?? i}
                country={c}
                index={i}
                selected={selected?.codes?.alpha_3 === c.codes?.alpha_3}
                onSelect={() => setSelected(c)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => goToPage(page - 1)}
            className="text-xs px-4 py-2 rounded-full border border-border disabled:opacity-40 hover:bg-muted/40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => goToPage(page + 1)}
            className="text-xs px-4 py-2 rounded-full border border-border disabled:opacity-40 hover:bg-muted/40 transition-colors"
          >
            Next →
          </button>
        </div>
      ) : null}
    </div>
  )
}
