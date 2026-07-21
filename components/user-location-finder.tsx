'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Crosshair,
  Search,
  Copy,
  Check,
  Globe,
  Wifi,
} from 'lucide-react'
import type { IpstackData } from '@/types/ipstack'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      setSearchError(`Couldn't find “${q}”. Try City, Country.`)
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

  const gmtHours = data ? data.time_zone.gmt_offset / 3600 : 0
  const gmtLabel = gmtHours >= 0 ? `GMT+${gmtHours}` : `GMT${gmtHours}`

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        <div className="h-4 w-48 mx-auto bg-muted/70 animate-pulse rounded" />
        <div className="h-16 w-full bg-muted/60 animate-pulse rounded-2xl" />
        <div className="h-4 w-72 mx-auto bg-muted/50 animate-pulse rounded" />
        <div className="h-64 bg-muted/40 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-6 text-center">
        <Globe className="size-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-4">{error ?? 'No data'}</p>
        <Button onClick={fetchLocation} variant="outline" className="gap-2">
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    )
  }

  const placeLine = usePrecise && precise
    ? [precise.city ?? precise.locality, precise.countryName ?? data.country_name]
        .filter(Boolean)
        .join(', ')
    : `${data.city}, ${data.country_name}`

  return (
    <div className="max-w-3xl mx-auto px-6 space-y-8">
      {/* IP is the focus */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-4">
          Your public IP address
        </p>

        <div className="relative rounded-3xl border border-border bg-card/80 dark:bg-card/60 backdrop-blur-md px-5 py-8 md:px-8 md:py-10 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
            <Wifi className="size-4" />
            <span className="text-[11px] uppercase tracking-[0.2em]">
              ISP · {data.connection.isp || 'Unknown provider'}
            </span>
          </div>

          <p className="font-mono text-[clamp(1.6rem,7vw,3.25rem)] font-semibold tracking-tight text-foreground break-all leading-none">
            {data.ip}
          </p>

          <p className="mt-5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            This is the <span className="text-foreground font-medium">public IP address</span> your
            internet provider ({data.connection.isp || 'your ISP'}) assigns to your connection.
            Websites see this — not your private home Wi‑Fi address.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(data.ip)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="gap-2"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy IP'}
            </Button>
            <Button size="sm" variant="outline" onClick={fetchLocation} className="gap-2">
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground/80">
            {data.type.toUpperCase()}
            {data.connection.asn ? ` · ASN ${data.connection.asn}` : ''}
          </p>
        </div>
      </motion.section>

      {/* Secondary: where that IP roughly maps */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
              {usePrecise ? 'Device location' : 'Approx. from this IP'}
            </p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
              <span className="mr-2" aria-hidden>
                {data.location.country_flag_emoji}
              </span>
              {placeLine}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {usePrecise && precise
                ? `${precise.principalSubdivision ?? data.region_name} · from your device`
                : `${data.region_name} · ${data.continent_name}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={requestPrecise}
              disabled={geoLoading}
              className="gap-2"
            >
              {geoLoading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Crosshair className="size-3.5" />
              )}
              {geoLoading ? 'Locating…' : 'Precise location'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSearch(v => !v)}
              className="gap-2"
            >
              <Search className="size-3.5" />
              Type city
            </Button>
            {usePrecise ? (
              <Button size="sm" variant="ghost" onClick={() => setUsePrecise(false)} className="gap-2">
                <Globe className="size-3.5" />
                IP map
              </Button>
            ) : null}
          </div>
        </div>

        {geoError ? (
          <p className="text-xs text-amber-700 dark:text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
            {geoError}
          </p>
        ) : null}

        <AnimatePresence>
          {showSearch ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                  placeholder="City, Country"
                  className="h-10"
                />
                <Button
                  onClick={handleManualSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="h-10 gap-2 shrink-0"
                >
                  {searching ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Pin
                </Button>
              </div>
              {searchError ? (
                <p className="mt-2 text-xs text-destructive">{searchError}</p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {usePrecise && precise ? (
          <p className="text-xs text-muted-foreground">
            {precise.accuracy > 0
              ? `Accurate to ~${Math.round(precise.accuracy)} m. Your ISP IP above is unchanged.`
              : 'Pinned from your search. Your ISP IP above is unchanged.'}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border text-xs text-muted-foreground">
            <span>{usePrecise ? 'Device pin' : 'IP estimate'}</span>
            <code className="font-mono text-[11px]">
              {activeCoords
                ? `${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)}`
                : '—'}
            </code>
          </div>
          <iframe
            title={`Map of ${placeLine}`}
            src={mapSrc}
            className="w-full h-64 md:h-80 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </motion.section>

      {/* Compact meta — secondary to IP */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-border overflow-hidden bg-border"
      >
        {[
          {
            label: 'Local time',
            value: formatLocalTime(data.time_zone.current_time),
          },
          {
            label: 'Timezone',
            value: data.time_zone.id || gmtLabel,
          },
          {
            label: 'Currency',
            value: [data.currency.symbol, data.currency.code].filter(Boolean).join(' ') || '—',
          },
          {
            label: 'Capital',
            value: data.location.capital || '—',
          },
        ].map(item => (
          <div key={item.label} className="bg-card/90 dark:bg-card/70 backdrop-blur-sm p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              {item.label}
            </p>
            <p className="text-sm text-foreground leading-snug break-words">{item.value}</p>
          </div>
        ))}
      </motion.section>
    </div>
  )
}
