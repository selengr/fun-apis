'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instrument_Serif, Space_Grotesk } from 'next/font/google'
import {
  RefreshCw,
  Crosshair,
  Search,
  Copy,
  Check,
  Globe,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import type { IpstackData } from '@/types/ipstack'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const ATMOSPHERE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80'

function formatLocalTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

interface PreciseLocation {
  latitude: number
  longitude: number
  accuracy: number
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<Partial<PreciseLocation>> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return {}
    const json = await res.json()
    const addr = json.address ?? {}
    return {
      city: addr.city || addr.town || addr.village || addr.county || undefined,
      locality: addr.suburb || addr.neighbourhood || addr.road || undefined,
      principalSubdivision: addr.state || addr.region || undefined,
      countryName: addr.country || undefined,
    }
  } catch {
    return {}
  }
}

async function forwardGeocode(query: string): Promise<PreciseLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query,
      )}&limit=1&addressdetails=1&accept-language=en`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null
    const results = await res.json()
    if (!Array.isArray(results) || results.length === 0) return null
    const r = results[0]
    const addr = r.address ?? {}
    return {
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      accuracy: 0,
      city: addr.city || addr.town || addr.village || addr.county || r.name || undefined,
      locality: addr.suburb || addr.neighbourhood || undefined,
      principalSubdivision: addr.state || addr.region || undefined,
      countryName: addr.country || undefined,
    }
  } catch {
    return null
  }
}

function RadarRing() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
      <div className="absolute size-[120vmax] rounded-full border border-emerald-400/10 animate-[spin_60s_linear_infinite]" />
      <div className="absolute size-[80vmax] rounded-full border border-dashed border-emerald-400/[0.07] animate-[spin_90s_linear_infinite_reverse]" />
      <div className="absolute size-[42vmax] rounded-full border border-emerald-400/[0.08]" />
      <div className="absolute size-3 rounded-full bg-emerald-400/80 shadow-[0_0_40px_12px_rgba(52,211,153,0.35)]" />
      <div className="absolute size-24 rounded-full border border-emerald-400/30 animate-ping opacity-40" />
    </div>
  )
}

export function UserLocationFinder() {
  const [data, setData] = useState<IpstackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [precise, setPrecise] = useState<PreciseLocation | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [usePrecise, setUsePrecise] = useState(false)

  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleManualSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearching(true)
    setSearchError(null)
    const found = await forwardGeocode(q)
    if (found) {
      setPrecise(found)
      setUsePrecise(true)
      setGeoError(null)
      setShowSearch(false)
    } else {
      setSearchError(`No fix for “${q}”. Try City, Country.`)
    }
    setSearching(false)
  }, [searchQuery])

  const fetchLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/location?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load location')
      setData(json as IpstackData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const requestPrecise = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Geolocation is not available in this browser.')
      return
    }

    setGeoLoading(true)
    setGeoError(null)

    const onSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords
      const place = await reverseGeocode(latitude, longitude)
      setPrecise({ latitude, longitude, accuracy, ...place })
      setUsePrecise(true)
      setGeoLoading(false)
    }

    const onFinalError = (err: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        1: 'Permission denied. Allow location for this site, or type your city.',
        2: 'No GPS fix (common on desktop). Type your city instead.',
        3: 'GPS timed out. Type your city — usually faster.',
      }
      setGeoError(messages[err.code] ?? 'Could not get a precise fix. Type your city.')
      setShowSearch(true)
      setGeoLoading(false)
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      err => {
        if (err.code === 1) {
          onFinalError(err)
          return
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onFinalError, {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 60000,
        })
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    )
  }, [])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  const activeCoords = useMemo(() => {
    if (usePrecise && precise) {
      return { latitude: precise.latitude, longitude: precise.longitude }
    }
    if (!data) return null
    return { latitude: data.latitude, longitude: data.longitude }
  }, [usePrecise, precise, data])

  const mapSrc = useMemo(() => {
    if (!activeCoords) return ''
    const { latitude, longitude } = activeCoords
    const zoom = usePrecise && precise ? 15 : 12
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
  }, [activeCoords, usePrecise, precise])

  const placeTitle = usePrecise && precise
    ? (precise.city ?? precise.locality ?? 'Your spot')
    : (data?.city ?? '…')

  const placeSub = usePrecise && precise
    ? [precise.principalSubdivision, precise.countryName ?? data?.country_name]
        .filter(Boolean)
        .join(' · ')
    : [data?.region_name, data?.country_name, data?.continent_name]
        .filter(Boolean)
        .join(' · ')

  const gmtHours = data ? data.time_zone.gmt_offset / 3600 : 0
  const gmtLabel = gmtHours >= 0 ? `GMT+${gmtHours}` : `GMT${gmtHours}`

  const sec = data?.security
  const sneaky = !!(
    sec &&
    (sec.is_proxy || sec.is_tor || sec.vpn_service || sec.hosting_facility)
  )

  return (
    <div className={cn(grotesk.className, 'relative min-h-screen text-white bg-[#070a0e]')}>
      {/* Full-bleed atmosphere */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ATMOSPHERE}
        alt=""
        aria-hidden
        className="pointer-events-none fixed inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="pointer-events-none fixed inset-0 bg-[#070a0e]/55" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#070a0e]/30 via-transparent to-[#070a0e]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(52,211,153,0.08),transparent_50%)]" />

      {/* Nav */}
      <header className="relative z-50 flex items-center justify-between px-5 md:px-10 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Home
        </Link>
        <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-300/70">
          Signal · Geo
        </p>
        <ThemeToggle />
      </header>

      <div className="relative z-10 px-5 md:px-10 pb-16">
        {/* Hero composition */}
        <section className="relative min-h-[72vh] flex flex-col justify-end pt-16 md:pt-20 pb-10 overflow-hidden">
          <RadarRing />

          {loading ? (
            <div className="relative space-y-6 max-w-3xl animate-pulse">
              <div className="h-3 w-40 bg-white/10 rounded" />
              <div className="h-20 w-full max-w-xl bg-white/10 rounded" />
              <div className="h-4 w-72 bg-white/10 rounded" />
              <div className="h-10 w-64 bg-white/10 rounded" />
            </div>
          ) : error || !data ? (
            <div className="relative max-w-md">
              <p className="text-[11px] tracking-[0.3em] uppercase text-rose-300/80 mb-3">
                Signal lost
              </p>
              <h1
                className="text-4xl md:text-5xl text-white leading-none mb-4"
                style={{ fontFamily: serif.style.fontFamily }}
              >
                No fix
              </h1>
              <p className="text-sm text-white/55 mb-6">{error ?? 'Could not read your IP zone.'}</p>
              <button
                type="button"
                onClick={fetchLocation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="size-4" /> Rescan
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-4xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-3xl leading-none" aria-hidden>
                  {data.location.country_flag_emoji}
                </span>
                <span className="text-[10px] tracking-[0.35em] uppercase text-emerald-300/75">
                  {usePrecise ? 'Device lock' : 'IP intercept'}
                  {data.location.is_eu ? ' · EU' : ''}
                  {sneaky ? ' · masked path' : ''}
                </span>
              </div>

              <h1
                className="text-[clamp(3.2rem,12vw,7.5rem)] leading-[0.9] tracking-tight text-white"
                style={{ fontFamily: serif.style.fontFamily }}
              >
                {placeTitle}
              </h1>
              <p className="mt-4 text-base md:text-lg text-white/55 max-w-xl">
                {placeSub}
              </p>

              {/* IP stamp */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">
                    Public address
                  </p>
                  <p className="font-mono text-xl md:text-3xl tracking-tight text-emerald-200 break-all">
                    {data.ip}
                  </p>
                  <p className="mt-1.5 text-xs text-white/35">
                    {data.type.toUpperCase()}
                    {activeCoords
                      ? ` · ${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(data.ip)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full border border-white/15 bg-white/5 text-[11px] tracking-[0.2em] uppercase text-white/70 hover:bg-white hover:text-[#070a0e] transition-all"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={requestPrecise}
                  disabled={geoLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-400 text-[#070a0e] text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-emerald-300 disabled:opacity-60 transition-colors"
                >
                  {geoLoading ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Crosshair className="size-3.5" />
                  )}
                  {geoLoading ? 'Locking…' : 'Precise lock'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearch(v => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-[11px] tracking-[0.18em] uppercase text-white/75 hover:bg-white/10 transition-colors"
                >
                  <Search className="size-3.5" /> Type city
                </button>
                {usePrecise ? (
                  <button
                    type="button"
                    onClick={() => setUsePrecise(false)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-[11px] tracking-[0.18em] uppercase text-white/45 hover:text-white/80 transition-colors"
                  >
                    <Globe className="size-3.5" /> IP view
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={fetchLocation}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-[11px] tracking-[0.18em] uppercase text-white/45 hover:text-white/80 transition-colors"
                >
                  <RefreshCw className="size-3.5" /> Rescan
                </button>
              </div>

              <AnimatePresence>
                {geoError ? (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-xs text-amber-200/80 max-w-lg"
                  >
                    {geoError}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {showSearch ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                        placeholder="City, Country"
                        className="flex-1 h-11 px-4 rounded-full bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50"
                      />
                      <button
                        type="button"
                        onClick={handleManualSearch}
                        disabled={searching || !searchQuery.trim()}
                        className="h-11 px-5 rounded-full bg-white text-[#070a0e] text-[11px] tracking-[0.18em] uppercase font-medium disabled:opacity-50"
                      >
                        {searching ? '…' : 'Pin'}
                      </button>
                    </div>
                    {searchError ? (
                      <p className="mt-2 text-xs text-rose-300/80">{searchError}</p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {usePrecise && precise ? (
                <p className="mt-5 text-xs text-white/40 max-w-lg">
                  {precise.accuracy > 0
                    ? `Device fix · ~${Math.round(precise.accuracy)} m accuracy. Dossier below still reads from your IP.`
                    : 'Pinned from your search. Dossier below still reads from your IP.'}
                </p>
              ) : null}
            </motion.div>
          )}
        </section>

        {/* Map — full visual plane */}
        {data && mapSrc ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative -mx-5 md:mx-0 md:rounded-2xl overflow-hidden border-y md:border border-white/10"
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#070a0e]/80 to-transparent">
              <p className="text-[10px] tracking-[0.28em] uppercase text-white/60">
                {usePrecise ? 'Ground truth' : 'Approximate fix'}
              </p>
              <p className="font-mono text-[10px] text-emerald-200/70">
                {activeCoords
                  ? `${activeCoords.latitude.toFixed(4)} · ${activeCoords.longitude.toFixed(4)}`
                  : '—'}
              </p>
            </div>
            <iframe
              title={`Map of ${placeTitle}`}
              src={mapSrc}
              className="w-full h-[360px] md:h-[440px] border-0 grayscale-[30%] contrast-110"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.section>
        ) : null}

        {/* Dossier strip — not a card grid */}
        {data ? (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 md:mt-14"
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/35 mb-6">
              Dossier
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 border-t border-white/10 pt-8">
              {[
                {
                  label: 'Local time',
                  value: formatLocalTime(data.time_zone.current_time),
                  sub: data.time_zone.is_daylight_saving
                    ? `${data.time_zone.code} · DST`
                    : data.time_zone.code,
                },
                {
                  label: 'Carrier',
                  value: data.connection.isp || 'Unknown',
                  sub: data.connection.asn ? `ASN ${data.connection.asn}` : undefined,
                },
                {
                  label: 'Currency',
                  value: [data.currency.symbol, data.currency.code].filter(Boolean).join(' ') || '—',
                  sub: data.currency.plural || undefined,
                },
                {
                  label: 'Capital',
                  value: data.location.capital || '—',
                  sub: data.city ? `You: ${data.city}` : undefined,
                },
                {
                  label: 'Timezone',
                  value: data.time_zone.id || '—',
                  sub: gmtLabel,
                },
                {
                  label: 'Calling',
                  value: data.location.calling_code
                    ? `+${data.location.calling_code}`
                    : '—',
                  sub: data.zip ? `Postal ${data.zip}` : undefined,
                },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="border-l border-emerald-400/25 pl-4"
                >
                  <p className="text-[10px] tracking-[0.28em] uppercase text-white/40 mb-2">
                    {row.label}
                  </p>
                  <p
                    className="text-xl md:text-2xl text-white leading-tight"
                    style={{ fontFamily: serif.style.fontFamily }}
                  >
                    {row.value}
                  </p>
                  {row.sub ? (
                    <p className="mt-1.5 text-xs text-white/40">{row.sub}</p>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : null}
      </div>
    </div>
  )
}
