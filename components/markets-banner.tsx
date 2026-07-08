'use client'

import { useEffect, useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { CoinMarket } from '@/types/coingecko'
import { Sparkline } from '@/components/crypto-sparkline'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

export function MarketsBanner() {
  const [btc, setBtc] = useState<CoinMarket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/crypto?per_page=1', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json.coins?.[0]) {
          setBtc(json.coins[0])
        }
      } catch {
        // keep last good data on refresh failure
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
  const change7d = btc?.price_change_percentage_7d_in_currency ?? 0
  const up24h = change24h >= 0

  return (
    <>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute -top-20 -right-10 w-[360px] h-[360px] rounded-full bg-amber-400/15 blur-[100px]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 h-full p-7 md:p-10">
        <div className="md:max-w-xs">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4 px-3 py-1.5 rounded-full border border-border/70 bg-card/60 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </span>
            Markets hub · live
          </div>
          <h3 className="text-2xl md:text-3xl font-light tracking-tight leading-[1.1] mb-3">
            See what&apos;s moving.
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Prices and charts kept clean and easy to read. Crypto is live,
            more coming soon.
          </p>
        </div>

        <div className="flex-1 md:border-l md:border-border/40 md:pl-10">
          {loading && !btc ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-muted/40" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted/40 rounded" />
                  <div className="h-3 w-10 bg-muted/30 rounded" />
                </div>
              </div>
              <div className="h-10 w-40 bg-muted/40 rounded" />
              <div className="h-16 w-full bg-muted/20 rounded-lg" />
            </div>
          ) : btc ? (
            <>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={btc.image}
                      alt=""
                      className="size-12 rounded-full ring-2 ring-background"
                    />
                    <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background flex items-center justify-center text-[9px] font-bold border border-border">
                      {btc.market_cap_rank}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{btc.name}</p>
                    <p className="text-[11px] uppercase font-mono text-muted-foreground">
                      {btc.symbol}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-semibold tabular-nums rounded-full border text-sm px-3 py-1 ${
                    up24h
                      ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25'
                      : 'text-red-400 bg-red-500/15 border-red-500/25'
                  }`}
                >
                  {up24h ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
                  {formatPct(change24h)}
                </span>
              </div>

              <p className="font-mono font-bold tabular-nums tracking-tight text-foreground text-3xl md:text-4xl">
                {formatUsd(btc.current_price)}
              </p>

              <div className="flex items-end justify-between mt-4 gap-2">
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  <p>MCap {formatUsd(btc.market_cap, true)}</p>
                  <p>Vol {formatUsd(btc.total_volume, true)}</p>
                </div>
                <Sparkline
                  data={btc.sparkline_in_7d?.price ?? []}
                  positive={change7d >= 0}
                  large
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load market data.</p>
          )}
        </div>
      </div>
    </>
  )
}
