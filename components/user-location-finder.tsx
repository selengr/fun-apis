'use client'

import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  MapPin,
  Clock,
  Wifi,
  Coins,
  RefreshCw,
  Sparkles,
  Navigation,
  Building2,
  Languages,
  Shield,
  Crosshair,
  Satellite,
  LocateFixed,
  Search,
  ShieldAlert,
  ShieldCheck,
  Server,
  Bot,
  Copy,
  Check,
} from 'lucide-react'
import type { IpstackData } from '@/types/ipstack'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

function formatLocalTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
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

/**
 * Reverse-geocode GPS coords to a human place name.
 * OpenStreetMap Nominatim is free, needs no API key, and is CORS-enabled.
 */
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

/**
 * Forward-geocode a place name (e.g. "Kerman, Iran") to coordinates.
 * Definitive accuracy fix when browser GPS can't get a fix.
 */
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

function getFunHeadline(data: IpstackData): string {
  const lines = [
    `Plot twist: you're in ${data.city}, not on the moon 🌙`,
    `${data.location.country_flag_emoji} ${data.city} called — they want their tourist back`,
    `Your packets are vacationing in ${data.region_name}`,
    `Somewhere between ${data.latitude.toFixed(2)}° and chaos`,
    `The internet thinks you're near ${data.zip || data.city}`,
    `${data.connection.isp} is carrying your vibes today`,
  ]
  return lines[Math.floor(Math.random() * lines.length)]
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: ElementType
  label: string
  value: string
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-4 hover:border-border transition-colors"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="size-4" />
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  )
}

export function UserLocationFinder() {
  const [data, setData] = useState<IpstackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [headline, setHeadline] = useState('')
  const [copied, setCopied] = useState(false)

  // Precise (GPS) location — optional, user-permitted
  const [precise, setPrecise] = useState<PreciseLocation | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [usePrecise, setUsePrecise] = useState(false)

  // Manual city search — definitive fix when GPS can't get a fix
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
      setSearchError(`Couldn't find "${q}". Try "City, Country".`)
    }
    setSearching(false)
  }, [searchQuery])

  const fetchLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Cache-bust so a VPN switch reflects immediately
      const res = await fetch(`/api/location?t=${Date.now()}`, {
        cache: 'no-store',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load location')
      setData(json as IpstackData)
      setHeadline(getFunHeadline(json))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const requestPrecise = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Your browser does not support geolocation.')
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
        1: 'Permission denied. Enable location access for this site (and check your OS Location Services), then try again — or just type your city below. 👇',
        2: 'Your device couldn’t get a GPS fix (super common on desktops & some regions). No worries — just type your city below. 👇',
        3: 'GPS timed out. Type your city below instead — faster anyway. 👇',
      }
      setGeoError(messages[err.code] ?? 'Could not get your precise location. Type your city below instead.')
      setShowSearch(true)
      setGeoLoading(false)
    }

    // First try high-accuracy (GPS). If the device can't get a fix
    // (common on desktops), retry with network/Wi-Fi positioning.
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
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
    const zoom = usePrecise && precise ? 15 : 13
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
  }, [activeCoords, usePrecise, precise])

  const language = data?.location.languages[0]
  const gmtHours = data ? data.time_zone.gmt_offset / 3600 : 0
  const gmtLabel = gmtHours >= 0 ? `GMT+${gmtHours}` : `GMT${gmtHours}`

  const sec = data?.security
  const sneaky = !!(
    sec &&
    (sec.is_proxy || sec.is_tor || sec.vpn_service || sec.hosting_facility)
  )

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="h-48 rounded-3xl bg-muted/60 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center rounded-3xl border border-border bg-card">
        <Globe className="size-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-4">{error ?? 'No data'}</p>
        <Button onClick={fetchLocation} variant="outline" className="gap-2">
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">



      {/* Bold IP banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-foreground text-background p-6 md:p-7"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-background/60 mb-2">
              <MapPin className="size-4" />
              <span className="text-[11px] uppercase tracking-[0.2em]">Your IP Address</span>
            </div>
            <p className="font-mono text-3xl md:text-5xl font-bold tracking-tight break-all">
              {data.ip}
            </p>
            <p className="mt-2 text-xs text-background/60">
              {data.type.toUpperCase()} · Yes, we see you 👀 (it&apos;s public info)
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(data.ip)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="shrink-0 gap-2 self-start"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied!' : 'Copy IP'}
          </Button>
        </div>
      </motion.div>


      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10 p-6 md:p-8"
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -left-8 bottom-0 size-32 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-6xl md:text-7xl leading-none select-none">
            {data.location.country_flag_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {usePrecise && precise ? (
                <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                  <Satellite className="size-3" /> GPS-precise
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="size-3" /> IP-detected
                </Badge>
              )}
              <Badge variant="outline">{data.type.toUpperCase()}</Badge>
              {data.location.is_eu && (
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20">
                  EU 🇪🇺
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-1">
              {usePrecise && precise
                ? `${precise.city ?? precise.locality ?? 'Your spot'}, ${precise.countryName ?? data.country_name}`
                : `${data.city}, ${data.country_name}`}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {usePrecise && precise
                ? `${precise.principalSubdivision ?? data.region_name} · pinpointed by your device`
                : `${data.region_name} · ${data.continent_name}`}
            </p>
            <p className="mt-3 text-sm text-foreground/80 italic">&ldquo;{headline}&rdquo;</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
            <Button
              size="sm"
              onClick={requestPrecise}
              disabled={geoLoading}
              className="gap-2"
            >
              {geoLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Crosshair className="size-4" />
              )}
              {geoLoading ? 'Locating…' : 'Use my precise location'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(v => !v)}
              className="gap-2"
            >
              <Search className="size-4" /> Type my city
            </Button>
            {usePrecise && precise && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUsePrecise(false)}
                className="gap-2 text-muted-foreground"
              >
                <Globe className="size-4" /> Back to IP view
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLocation}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="size-4" /> Re-scan IP
            </Button>
          </div>
        </div>

        {geoError && (
          <div className="relative mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
            {geoError}
          </div>
        )}

        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative mt-4"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="Type your city — e.g. “Kerman, Iran”"
                className="h-10"
              />
              <Button
                onClick={handleManualSearch}
                disabled={searching || !searchQuery.trim()}
                className="h-10 gap-2 shrink-0"
              >
                {searching ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Pin it
              </Button>
            </div>
            {searchError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{searchError}</p>
            )}
          </motion.div>
        )}

        {usePrecise && precise && (
          <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <LocateFixed className="size-3.5 text-emerald-500" />
            {precise.accuracy > 0 ? (
              <>
                Accurate to within{' '}
                <strong className="text-foreground">~{Math.round(precise.accuracy)} m</strong>{' '}
                — thanks to your device&apos;s GPS/Wi-Fi.
              </>
            ) : (
              <>
                Pinned from your <strong className="text-foreground">manual search</strong> — spot on.
              </>
            )}{' '}
            The fun facts below still come from your IP.
          </div>
        )}
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl overflow-hidden border border-border shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="size-4" />
            <span>
              {usePrecise && precise
                ? 'Pinpointed by your device 🎯'
                : 'Google Maps says you’re roughly here'}
            </span>
          </div>
          <code className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {activeCoords
              ? `${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)}`
              : '—'}
          </code>
        </div>
        <iframe
          title={`Map of ${usePrecise && precise ? precise.city ?? 'your location' : data.city}`}
          src={mapSrc}
          className="w-full h-72 md:h-80 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </motion.div>


      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={Clock}
          label="Local Time"
          value={formatLocalTime(data.time_zone.current_time)}
          sub={
            data.time_zone.is_daylight_saving
              ? `${data.time_zone.code} · daylight savings is ON`
              : `${data.time_zone.code} · no daylight savings drama`
          }
          delay={0.1}
        />
        <StatCard
          icon={Coins}
          label="Currency"
          value={`${data.currency.symbol} ${data.currency.code}`}
          sub={`You'd pay in ${data.currency.plural}`}
          delay={0.15}
        />
        <StatCard
          icon={Wifi}
          label="ISP"
          value={data.connection.isp}
          sub={`ASN ${data.connection.asn}`}
          delay={0.2}
        />
        <StatCard
          icon={Building2}
          label="Capital"
          value={data.location.capital}
          sub={`Probably not ${data.city}, but close enough`}
          delay={0.25}
        />
        <StatCard
          icon={Languages}
          label="Language"
          value={language?.name ?? 'Unknown'}
          sub={language ? `Native: ${language.native}` : undefined}
          delay={0.3}
        />
        <StatCard
          icon={Shield}
          label="Timezone"
          value={data.time_zone.id}
          sub={gmtLabel}
          delay={0.35}
        />
      </div>

    </div>
  )
}
