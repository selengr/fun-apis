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
    const y = h - ((v - min) / range) * (h * 0.72) - h * 0.08
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
  const ink = up ? '#34d399' : '#fb7185'
  const prices = btc?.sparkline_in_7d?.price ?? []
  const horizon = useMemo(() => buildHorizon(prices), [prices])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0c0c0c] text-white min-h-[300px] md:min-h-[340px]">
      {/* Living price horizon — the whole card is the chart */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ink} stopOpacity="0.28" />
            <stop offset="55%" stopColor={ink} stopOpacity="0.06" />
            <stop offset="100%" stopColor={ink} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`veil-${gradId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0c0c0c" stopOpacity="0.92" />
            <stop offset="45%" stopColor="#0c0c0c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0c0c0c" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* faint ledger lines */}
        {[80, 140, 200, 260].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="1200"
            y2={y}
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="1"
          />
        ))}

        {horizon ? (
          <>
            <path d={horizon.fill} fill={`url(#fill-${gradId})`} />
            <path
              d={horizon.line}
              fill="none"
              stroke={ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[marketsDraw_1.4s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ strokeDasharray: 2400, strokeDashoffset: 0 }}
            />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="5" fill={ink} />
            <circle cx={horizon.lastX} cy={horizon.lastY} r="14" fill={ink} opacity="0.18">
              <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.28;0.08;0.28" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </>
        ) : null}

        <rect width="1200" height="320" fill={`url(#veil-${gradId})`} />
      </svg>

      {/* Scrolling market tape */}
      <div className="relative z-10 border-b border-white/8 overflow-hidden">
        <div
          className="flex whitespace-nowrap py-2.5 text-[10px] tracking-[0.22em] uppercase text-white/40"
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
                'Markets hub',
              ].map((item, i) => (
                <span key={`${rep}-${i}`} className="px-6 flex items-center gap-6">
                  {item}
                  <span className="size-1 rounded-full bg-white/20" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 p-7 md:p-10 pt-8 md:pt-12">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.28em] uppercase text-white/40 mb-4">
            BTC / USD · seven-day pulse
          </p>

          {loading && !btc ? (
            <div className="h-16 md:h-20 w-64 md:w-80 bg-white/10 rounded animate-pulse" />
          ) : (
            <p
              className="font-light tracking-tight tabular-nums leading-none text-[clamp(2.75rem,8vw,5.5rem)]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {btc ? formatUsd(btc.current_price) : '—'}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/55">
            <span
              className="inline-flex items-center gap-2 font-mono text-base tabular-nums"
              style={{ color: ink }}
            >
              <span className="text-lg leading-none">{up ? '↑' : '↓'}</span>
              {formatPct(change24h)} today
            </span>
            <span className="text-white/25">·</span>
            <span>Rank #{btc?.market_cap_rank ?? '—'}</span>
            <span className="text-white/25">·</span>
            <span>The number the room watches</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {btc?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={btc.image}
                alt=""
                className="size-10 rounded-full grayscale contrast-125 opacity-90"
              />
            ) : (
              <div className="size-10 rounded-full bg-white/10" />
            )}
            <div className="md:text-right">
              <p className="text-sm text-white/85">{btc?.name ?? 'Bitcoin'}</p>
              <p className="text-[11px] font-mono uppercase tracking-widest text-white/35">
                {btc?.symbol ?? 'btc'}
              </p>
            </div>
          </div>

          <Link
            href="/crypto"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-wide text-white/55 hover:text-white transition-colors border-b border-white/20 hover:border-white/60 pb-0.5"
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
        @keyframes marketsDraw {
          from { stroke-dashoffset: 2400; opacity: 0.2; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
