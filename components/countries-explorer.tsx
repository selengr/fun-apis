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
  Shield,
  Landmark,
  Hash,
} from 'lucide-react'
import type { Country, CountriesResponse } from '@/types/restcountries'
import { Input } from '@/components/ui/input'

type SearchMode = 'name' | 'capital' | 'code' | 'all'

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const

const REGION_STYLES: Record<string, { bg: string; ring: string; dot: string }> = {
  Africa: { bg: 'from-amber-500/15 to-orange-600/5', ring: 'ring-amber-500/20', dot: 'bg-amber-500' },
  Americas: { bg: 'from-sky-500/15 to-blue-600/5', ring: 'ring-sky-500/20', dot: 'bg-sky-500' },
  Asia: { bg: 'from-rose-500/15 to-pink-600/5', ring: 'ring-rose-500/20', dot: 'bg-rose-500' },
  Europe: { bg: 'from-violet-500/15 to-indigo-600/5', ring: 'ring-violet-500/20', dot: 'bg-violet-500' },
  Oceania: { bg: 'from-emerald-500/15 to-teal-600/5', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' },
}

const MEMBERSHIP_LABELS: { key: keyof NonNullable<Country['memberships']>; label: string }[] = [
  { key: 'un', label: 'UN' },
  { key: 'eu', label: 'EU' },
  { key: 'nato', label: 'NATO' },
  { key: 'g7', label: 'G7' },
  { key: 'g20', label: 'G20' },
  { key: 'commonwealth', label: 'Commonwealth' },
  { key: 'schengen', label: 'Schengen' },
  { key: 'eurozone', label: 'Eurozone' },
  { key: 'oecd', label: 'OECD' },
  { key: 'brics', label: 'BRICS' },
  { key: 'asean', label: 'ASEAN' },
]

const PAGE_SIZE = 24

function formatPopulation(n?: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
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

function MembershipBadges({ memberships }: { memberships?: Country['memberships'] }) {
  if (!memberships) return null
  const active = MEMBERSHIP_LABELS.filter(m => memberships[m.key])
  if (!active.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map(m => (
        <span
          key={m.key}
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border/60 bg-muted/40 text-muted-foreground"
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}

function CountryCard({
  country,
  selected,
  onSelect,
}: {
  country: Country
  selected: boolean
  onSelect: () => void
}) {
  const region = country.region ?? 'Other'
  const style = REGION_STYLES[region] ?? REGION_STYLES.Europe

  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      className={`group relative text-left w-full rounded-2xl border overflow-hidden transition-all duration-300 ${
        selected
          ? `border-foreground/30 shadow-lg scale-[1.02] ring-2 ${style.ring}`
          : 'border-border/50 hover:border-border hover:scale-[1.02] hover:shadow-md'
      }`}
    >
      {/* Large flag image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted/30">
        {country.flag?.url_png ? (
          <img
            src={country.flag.url_png}
            alt={`${country.names?.common} flag`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl">
            {country.flag?.emoji ?? '🏳️'}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute top-2 right-2 text-[10px] font-mono text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md tabular-nums">
          {country.codes?.alpha_2}
        </span>
        <span className="absolute bottom-2 left-2 text-2xl drop-shadow">{country.flag?.emoji}</span>
      </div>

      {/* Meta */}
      <div className="relative p-3 bg-card/70 backdrop-blur-sm">
        <div className={`absolute top-0 left-0 w-full h-0.5 ${style.dot} opacity-70`} />
        <p className="font-medium text-sm text-foreground truncate">{country.names?.common}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-muted-foreground truncate">{country.subregion ?? country.region}</p>
          <p className="text-[11px] font-mono text-muted-foreground/80 tabular-nums shrink-0 ml-2">
            {formatPopulation(country.population)}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

function CountryDetail({ country, onClose }: { country: Country; onClose: () => void }) {
  const region = country.region ?? 'Other'
  const style = REGION_STYLES[region] ?? REGION_STYLES.Europe
  const capital = country.capitals?.[0]?.name
  const demonym = country.demonyms?.eng?.m ?? country.demonyms?.eng?.f

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className={`relative rounded-3xl border border-border/50 overflow-hidden bg-gradient-to-br ${style.bg} via-card/90 to-card/80 backdrop-blur-xl`}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 size-8 rounded-full border border-border/60 bg-card/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="flex flex-col items-center md:items-start shrink-0">
            {country.flag?.url_png ? (
              <img
                src={country.flag.url_png}
                alt={`${country.names?.common} flag`}
                className="w-48 h-32 md:w-56 md:h-36 object-cover rounded-2xl border border-border/40 shadow-lg"
              />
            ) : (
              <span className="text-7xl">{country.flag?.emoji ?? '🏳️'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`size-2 rounded-full ${style.dot}`} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {country.region} · {country.subregion}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{country.flag?.emoji}</span>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                {country.names?.common}
              </h2>
            </div>
            {country.names?.official && country.names.official !== country.names.common && (
              <p className="text-sm text-muted-foreground mt-1 italic">{country.names.official}</p>
            )}

            {demonym && (
              <p className="text-sm text-muted-foreground mt-2">
                People here are called <span className="text-foreground">{demonym}</span>
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { icon: MapPin, label: 'Capital', value: capital ?? '—' },
                { icon: Users, label: 'Population', value: formatPopulation(country.population) },
                { icon: Mountain, label: 'Area', value: formatArea(country.area?.kilometers) },
                { icon: Globe2, label: 'Borders', value: country.borders?.length ? `${country.borders.length} countries` : country.landlocked ? 'Landlocked' : '—' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <s.icon className="size-3" />
                    <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {country.languages && country.languages.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Languages className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Languages</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {country.languages.map(l => (
                      <span key={l.name} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border/40">
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {country.currencies && country.currencies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Coins className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Currency</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {country.currencies.map(c => (
                      <span key={c.code} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border/40 font-mono">
                        {c.symbol} {c.code} — {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {country.timezones && country.timezones.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                    <Clock className="size-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Timezones</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {country.timezones.slice(0, 4).join(' · ')}
                    {country.timezones.length > 4 && ` · +${country.timezones.length - 4} more`}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                  <Shield className="size-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">Memberships</span>
                </div>
                <MembershipBadges memberships={country.memberships} />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                {country.cars?.driving_side && (
                  <span className="inline-flex items-center gap-1">
                    <Car className="size-3" /> Drives on the {country.cars.driving_side}
                  </span>
                )}
                {country.calling_codes?.[0] && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" /> +{country.calling_codes[0]}
                  </span>
                )}
                {country.units?.measurement_system && (
                  <span>{country.units.measurement_system} · {country.units.temperature_scale ?? '°C'}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {country.links?.wikipedia && (
                  <a
                    href={country.links.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/60 hover:bg-muted/40 transition-colors"
                  >
                    Wikipedia <ExternalLink className="size-3" />
                  </a>
                )}
                {country.links?.google_maps && (
                  <a
                    href={country.links.google_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/60 hover:bg-muted/40 transition-colors"
                  >
                    Google Maps <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const MODE_OPTIONS: { key: SearchMode; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Name', placeholder: 'Search a country — Canada, Japan, ger…' },
  { key: 'capital', label: 'Capital', placeholder: 'Search a capital — Tokyo, Paris…' },
  { key: 'code', label: 'Code', placeholder: 'Search a code — CA, USA, JP…' },
  { key: 'all', label: 'Anything', placeholder: 'Free text across every field…' },
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

  // Build request params from current state
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
      // 'all' → free text on base endpoint (no path)
      params.q = q
      return params
    },
    [query, mode, region],
  )

  // Single source of truth for fetching, guarded against races
  const reqId = useRef(0)
  const runFetch = useCallback(async (pageIndex: number) => {
    const id = ++reqId.current
    setLoading(true)
    setError(null)
    try {
      const json = await fetchCountries(buildParams(pageIndex))
      if (id !== reqId.current) return // stale response, ignore
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
  }, [buildParams])

  // Reset to first page whenever the query/mode/region changes, with debounce
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
  const currentPlaceholder = MODE_OPTIONS.find(m => m.key === mode)?.placeholder ?? ''

  const subtitle = useMemo(() => {
    if (loading) return 'Loading the atlas…'
    if (error) return ''
    if (region && query.trim()) return `${total} in ${region} matching "${query.trim()}"`
    if (region) return `${total} countries in ${region}`
    if (query.trim()) return `${total} matches for "${query.trim()}"`
    return `${total} countries · browse or search`
  }, [loading, error, total, region, query])

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
      {/* Global stats strip — crypto-style */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: Globe2, label: 'Countries', value: total ? String(total) : '249', sub: 'in the dataset', accent: 'from-sky-500/20 to-transparent' },
          { icon: MapPin, label: 'Regions', value: '5', sub: 'Africa → Oceania', accent: 'from-emerald-500/20 to-transparent' },
          { icon: Languages, label: 'Languages', value: '7k+', sub: 'spoken worldwide', accent: 'from-rose-500/20 to-transparent' },
          { icon: Hash, label: 'Fields', value: '90+', sub: 'per country', accent: 'from-violet-500/20 to-transparent' },
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
              <p className="text-xl md:text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search toolbar */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={currentPlaceholder}
              className="pl-10 h-11 rounded-2xl bg-card/50 border-border/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={surpriseMe}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border border-border/60 bg-card/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all shrink-0"
          >
            <Shuffle className="size-3.5" />
            Surprise me
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mr-1">Search by</span>
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setMode(opt.key)}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                  mode === opt.key
                    ? 'bg-foreground text-background border-foreground font-medium'
                    : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 mr-1">
            <Landmark className="size-3" /> Region
          </span>
          <button
            type="button"
            onClick={() => setRegion(null)}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
              !region
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
            }`}
          >
            All
          </button>
          {REGIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r === region ? null : r)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                region === r
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center rounded-xl border border-red-500/20 bg-red-500/10 py-2 px-4">
          {error}
        </p>
      )}

      {/* Selected country detail */}
      <AnimatePresence mode="wait">
        {selected && (
          <CountryDetail key={selected.codes?.alpha_3} country={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* Country grid */}
      {loading && countries.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/2] rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe2 className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No countries found. Try a different search.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {countries.map((c, i) => (
              <motion.div
                key={c.codes?.alpha_3 ?? c.names?.common ?? i}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
              >
                <CountryCard
                  country={c}
                  selected={selected?.codes?.alpha_3 === c.codes?.alpha_3}
                  onSelect={() => setSelected(c)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => goToPage(page - 1)}
            className="text-xs px-4 py-2 rounded-full border border-border/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-muted-foreground tabular-nums px-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => goToPage(page + 1)}
            className="text-xs px-4 py-2 rounded-full border border-border/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
