'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CoinMarket } from '@/types/coingecko'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

/** Night city skyline — cinematic markets atmosphere */
const ATMOSPHERE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80'

function buildHorizon(prices: number[], w = 1200, h = 320) {
  if (prices.length < 2) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const pts = prices.map((v, i) => {
    const x = (i / (prices.length - 1)) * w
    const y = h - ((v - min) / range) * (h * 0.55) - h * 0.12
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const fill = `${line} L${w},${h} L0,${h} Z`
  const last = pts[pts.length - 1]
  return { line, fill, lastX: last[0], lastY: last[1] }
}

export function MarketsBanner() {
  const [btc, setBtc] = useState<CoinMarket | null>(null)
  const [loading, setLoading] = useState(true)
  const gradId = useId().replace(/:/g, '')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/crypto?per_page=1', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json.coins?.[0]) setBtc(json.coins[0])
      } catch {
        // keep last good data
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const change24h = btc?.price_change_percentage_24h ?? 0
  const up = change24h >= 0
  const ink = up ? '#6ee7b7' : '#fda4af'
  const prices = btc?.sparkline_in_7d?.price ?? []
  const horizon = useMemo(() => buildHorizon(prices), [prices])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 min-h-[320px] md:min-h-[360px] text-white">
      {/* Atmosphere image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ATMOSPHERE}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
      />

      {/* Cinematic dark wash — keeps it darkish but lets the city breathe */}
      <div className="absolute inset-0 bg-[#0f1419]/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1016]/92 via-[#0b1016]/55 to-[#0b1016]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1016]/90 via-transparent to-[#0b1016]/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(110,231,183,0.08),transparent_55%)]" />

      {/* Price horizon over the skyline */}
      <svg
        className="absolute inset-0 w-full h-full opacity-90"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ink} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ink} stopOpacity="0" />
          </linearGradient>
        </defs>
        {horizon ? (
          <>
            <path d={horizon.fill} fill={`url(#fill-${gradId})`} />
            <path
              d={horizon.line}
              fill="none"
              stroke={ink}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="4.5" fill={ink} />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="12" fill={ink} opacity="0.2">
              <animate attributeName="r" values="8;16;8" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </>
        ) : null}
      </svg>

      {/* Soft tape */}
      <div className="relative z-10 border-b border-white/10 overflow-hidden backdrop-blur-[2px] bg-black/15">
        <div
          className="flex whitespace-nowrap py-2.5 text-[10px] tracking-[0.22em] uppercase text-white/55"
          style={{ animation: 'marketsTape 28s linear infinite' }}
        >
          {Array.from({ length: 2 }).map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {[
                'Bitcoin',
                loading && !btc ? '—' : formatUsd(btc?.current_price ?? 0),
                up ? '▲ rising' : '▼ falling',
                `24h ${formatPct(change24h)}`,
                `MCap ${btc ? formatUsd(btc.market_cap, true) : '—'}`,
                `Vol ${btc ? formatUsd(btc.total_volume, true) : '—'}`,
                'Live · every 30s',
              ].map((item, i) => (
                <span key={`${rep}-${i}`} className="px-6 flex items-center gap-6">
                  {item}
                  <span className="size-1 rounded-full bg-white/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 p-7 md:p-10 pt-9 md:pt-12">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.28em] uppercase text-white/55 mb-4 drop-shadow-sm">
            BTC / USD · seven-day pulse
          </p>

          {loading && !btc ? (
            <div className="h-16 md:h-20 w-64 md:w-80 bg-white/15 rounded animate-pulse" />
          ) : (
            <p className="font-light tracking-tight tabular-nums leading-none text-[clamp(2.75rem,8vw,5.5rem)] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              {btc ? formatUsd(btc.current_price) : '—'}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span
              className="inline-flex items-center gap-2 font-mono text-base tabular-nums"
              style={{ color: ink }}
            >
              <span className="text-lg leading-none">{up ? '↑' : '↓'}</span>
              {formatPct(change24h)} today
            </span>
            <span className="text-white/30">·</span>
            <span>Rank #{btc?.market_cap_rank ?? '—'}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">The number the room watches</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-black/25 backdrop-blur-md px-3.5 py-2.5">
            {btc?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={btc.image}
                alt=""
                className="size-9 rounded-full ring-1 ring-white/20"
              />
            ) : (
              <div className="size-9 rounded-full bg-white/15" />
            )}
            <div className="md:text-right">
              <p className="text-sm text-white/90">{btc?.name ?? 'Bitcoin'}</p>
              <p className="text-[11px] font-mono uppercase tracking-widest text-white/45">
                {btc?.symbol ?? 'btc'}
              </p>
            </div>
          </div>

          <Link
            href="/crypto"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-wide text-white/70 hover:text-white transition-colors border-b border-white/25 hover:border-white/70 pb-0.5"
          >
            Open the live board
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes marketsTape {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
