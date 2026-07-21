'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CoinMarket } from '@/types/coingecko'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

function buildHorizon(prices: number[], w = 1200, h = 320) {
  if (prices.length < 2) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const pts = prices.map((v, i) => {
    const x = (i / (prices.length - 1)) * w
    const y = h - ((v - min) / range) * (h * 0.68) - h * 0.1
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
  const ink = up ? '#059669' : '#e11d48'
  const prices = btc?.sparkline_in_7d?.price ?? []
  const horizon = useMemo(() => buildHorizon(prices), [prices])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card min-h-[280px] md:min-h-[320px]">
      {/* Soft chart horizon */}
      <svg
        className="absolute inset-0 w-full h-full opacity-90"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ink} stopOpacity="0.16" />
            <stop offset="60%" stopColor={ink} stopOpacity="0.04" />
            <stop offset="100%" stopColor={ink} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`veil-${gradId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--card)" stopOpacity="0.95" />
            <stop offset="40%" stopColor="var(--card)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--card)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {[80, 140, 200, 260].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="1200"
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="1"
            className="text-foreground"
          />
        ))}

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
            />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="4.5" fill={ink} />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="12" fill={ink} opacity="0.12" />
          </>
        ) : null}

        <rect width="1200" height="320" fill={`url(#veil-${gradId})`} />
      </svg>

      {/* Tape */}
      <div className="relative z-10 border-b border-border overflow-hidden bg-muted/40">
        <div
          className="flex whitespace-nowrap py-2.5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground"
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
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 p-7 md:p-10">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
            BTC / USD · seven-day pulse
          </p>

          {loading && !btc ? (
            <div className="h-14 md:h-16 w-56 md:w-72 bg-muted rounded animate-pulse" />
          ) : (
            <p className="font-light tracking-tight tabular-nums leading-none text-foreground text-[clamp(2.5rem,7vw,4.75rem)]">
              {btc ? formatUsd(btc.current_price) : '—'}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[15px] tabular-nums font-medium"
              style={{ color: ink }}
            >
              <span>{up ? '↑' : '↓'}</span>
              {formatPct(change24h)} today
            </span>
            <span className="text-border">·</span>
            <span>Rank #{btc?.market_cap_rank ?? '—'}</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {btc?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={btc.image} alt="" className="size-10 rounded-full border border-border" />
            ) : (
              <div className="size-10 rounded-full bg-muted" />
            )}
            <div className="md:text-right">
              <p className="text-sm text-foreground">{btc?.name ?? 'Bitcoin'}</p>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                {btc?.symbol ?? 'btc'}
              </p>
            </div>
          </div>

          <Link
            href="/crypto"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-wide text-muted-foreground hover:text-foreground transition-colors"
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
