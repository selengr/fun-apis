'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Zap,
  Globe2,
  BarChart2,
  Coins,
  Radio,
} from 'lucide-react'
import type { CoinMarket, GlobalMarketData } from '@/types/coingecko'
import { Input } from '@/components/ui/input'
import { Sparkline } from '@/components/crypto-sparkline'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

function ChangePill({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const up = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tabular-nums rounded-full border ${
        size === 'lg' ? 'text-sm px-3 py-1' : 'text-[11px] px-2 py-0.5'
      } ${
        up
          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25'
          : 'text-red-400 bg-red-500/15 border-red-500/25'
      }`}
    >
      {up ? <TrendingUp className={size === 'lg' ? 'size-3.5' : 'size-3'} /> : <TrendingDown className={size === 'lg' ? 'size-3.5' : 'size-3'} />}
      {formatPct(value)}
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = [
      'from-amber-400/20 to-amber-600/10 text-amber-500 border-amber-500/30',
      'from-slate-300/20 to-slate-500/10 text-slate-400 border-slate-400/30',
      'from-orange-400/20 to-orange-700/10 text-orange-500 border-orange-600/30',
    ]
    return (
      <span
        className={`inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br border text-xs font-bold tabular-nums ${colors[rank - 1]}`}
      >
        {rank}
      </span>
    )
  }
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted/40 text-xs text-muted-foreground tabular-nums">
      {rank}
    </span>
  )
}

function TickerTape({ coins }: { coins: CoinMarket[] }) {
  const items = [...coins.slice(0, 12), ...coins.slice(0, 12)]
  if (!items.length) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md py-2.5">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: 'ticker 40s linear infinite' }}
      >
        {items.map((coin, i) => (
          <span key={`${coin.id}-${i}`} className="inline-flex items-center gap-2 text-sm shrink-0">
            <img src={coin.image} alt="" className="size-5 rounded-full" />
            <span className="font-medium text-foreground uppercase text-xs">{coin.symbol}</span>
            <span className="font-mono tabular-nums text-foreground/90">{formatUsd(coin.current_price)}</span>
            <span
              className={`text-xs font-medium tabular-nums ${
                coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatPct(coin.price_change_percentage_24h)}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

type SortKey = 'rank' | 'price' | 'change24h' | 'market_cap' | 'volume'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rank', label: 'Rank' },
  { key: 'price', label: 'Price' },
  { key: 'change24h', label: '24h' },
  { key: 'market_cap', label: 'MCap' },
  { key: 'volume', label: 'Volume' },
]

export function CryptoMarket() {
  const [coins, setCoins] = useState<CoinMarket[]>([])
  const [global, setGlobal] = useState<GlobalMarketData['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('rank')
  const [countdown, setCountdown] = useState(30)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (search?: string) => {
    setRefreshing(true)
    try {
      const params = new URLSearchParams({ per_page: '50' })
      if (search?.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/crypto?${params}&t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load')
      setCoins(json.coins ?? [])
      if (json.global?.data) setGlobal(json.global.data)
      setError(null)
      setLastUpdated(new Date())
      setCountdown(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(query || undefined), REFRESH_MS)
    return () => clearInterval(interval)
  }, [fetchData, query])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 30 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchData(query || undefined), 400)
    return () => clearTimeout(t)
  }, [query, fetchData])

  const sorted = useMemo(() => {
    const list = [...coins]
    switch (sort) {
      case 'price': return list.sort((a, b) => b.current_price - a.current_price)
      case 'change24h': return list.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      case 'market_cap': return list.sort((a, b) => b.market_cap - a.market_cap)
      case 'volume': return list.sort((a, b) => b.total_volume - a.total_volume)
      default: return list.sort((a, b) => a.market_cap_rank - b.market_cap_rank)
    }
  }, [coins, sort])

  const topThree = sorted.slice(0, 3)

  if (loading && coins.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="h-12 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/25 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
      {/* Live ticker */}
      <TickerTape coins={sorted} />

      {/* Global pulse strip */}
      {global && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            { icon: Globe2, label: 'Market Cap', value: formatUsd(global.total_market_cap.usd, true), sub: formatPct(global.market_cap_change_percentage_24h_usd) + ' today', accent: 'from-violet-500/20 to-transparent' },
            { icon: BarChart2, label: '24h Volume', value: formatUsd(global.total_volume.usd, true), sub: `${global.markets.toLocaleString()} exchanges`, accent: 'from-sky-500/20 to-transparent' },
            { icon: Zap, label: 'BTC Dominance', value: `${global.market_cap_percentage.btc.toFixed(1)}%`, sub: `ETH ${global.market_cap_percentage.eth.toFixed(1)}%`, accent: 'from-amber-500/20 to-transparent' },
            { icon: Coins, label: 'Assets Tracked', value: global.active_cryptocurrencies.toLocaleString(), sub: 'live universe', accent: 'from-emerald-500/20 to-transparent' },
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
      )}

      {/* Top 3 bento */}
      {topThree.length > 0 && (
        <div className="grid md:grid-cols-3 gap-3">
          {topThree.map((coin, i) => {
            const up = coin.price_change_percentage_24h >= 0
            const isHero = i === 0
            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] ${
                  isHero
                    ? 'md:col-span-1 border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card/80 to-orange-600/5 p-5 md:p-6'
                    : 'border-border/50 bg-card/50 p-4 md:p-5'
                }`}
              >
                {isHero && (
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                )}
                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={coin.image}
                          alt=""
                          className={`rounded-full ring-2 ring-background ${isHero ? 'size-12' : 'size-10'}`}
                        />
                        <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background flex items-center justify-center text-[9px] font-bold border border-border">
                          {coin.market_cap_rank}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{coin.name}</p>
                        <p className="text-[11px] uppercase font-mono text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    <ChangePill value={coin.price_change_percentage_24h} size={isHero ? 'lg' : 'sm'} />
                  </div>

                  <p className={`font-mono font-bold tabular-nums tracking-tight text-foreground ${isHero ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                    {formatUsd(coin.current_price)}
                  </p>

                  <div className="flex items-end justify-between mt-4 gap-2">
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      <p>MCap {formatUsd(coin.market_cap, true)}</p>
                      <p>Vol {formatUsd(coin.total_volume, true)}</p>
                    </div>
                    <Sparkline
                      data={coin.sparkline_in_7d?.price ?? []}
                      positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                      large={isHero}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search 10,000+ assets…"
              className="pl-10 h-11 rounded-2xl bg-card/50 border-border/60 backdrop-blur-sm"
            />
          </div>
          <button
            onClick={() => fetchData(query || undefined)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all shrink-0"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              Live · {countdown}s
            </span>
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all duration-200 ${
                sort === opt.key
                  ? 'bg-foreground text-background border-foreground font-medium'
                  : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center rounded-xl border border-red-500/20 bg-red-500/10 py-2 px-4">
          {error}
        </p>
      )}

      {/* Market list */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-sm">
        <div className="hidden lg:grid grid-cols-[3rem_1fr_8rem_4.5rem_5rem_5rem_7rem_7rem] gap-3 px-5 py-3.5 border-b border-border/40 bg-muted/20 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
          <span>#</span>
          <span>Asset</span>
          <span className="text-right">Price</span>
          <span className="text-right">1h</span>
          <span className="text-right">24h</span>
          <span className="text-right">7d</span>
          <span className="text-right">Market Cap</span>
          <span className="text-center">Trend</span>
        </div>

        <div className="divide-y divide-border/30">
          <AnimatePresence mode="popLayout">
            {sorted.map((coin, i) => {
              const up24 = coin.price_change_percentage_24h >= 0
              return (
                <motion.div
                  key={coin.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.3) }}
                  className={`group relative grid grid-cols-1 lg:grid-cols-[3rem_1fr_8rem_4.5rem_5rem_5rem_7rem_7rem] gap-2 lg:gap-3 px-5 py-4 items-center hover:bg-muted/15 transition-colors ${
                    i < 3 ? 'bg-muted/5' : ''
                  }`}
                >
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      up24 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />

                  <div className="hidden lg:flex justify-center">
                    <RankBadge rank={coin.market_cap_rank} />
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={coin.image}
                      alt=""
                      className="size-9 rounded-full ring-1 ring-border/50 group-hover:ring-border transition-all"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors">
                        {coin.name}
                      </p>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                        {coin.symbol}
                        <span className="lg:hidden ml-2 normal-case tracking-normal">#{coin.market_cap_rank}</span>
                      </p>
                    </div>
                    <div className="lg:hidden text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums">{formatUsd(coin.current_price)}</p>
                      <ChangePill value={coin.price_change_percentage_24h} />
                    </div>
                  </div>

                  <span className="hidden lg:block text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                    {formatUsd(coin.current_price)}
                  </span>

                  <span
                    className={`hidden lg:block text-right text-xs font-medium tabular-nums ${
                      (coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {coin.price_change_percentage_1h_in_currency != null
                      ? formatPct(coin.price_change_percentage_1h_in_currency)
                      : '—'}
                  </span>

                  <div className="hidden lg:flex justify-end">
                    <ChangePill value={coin.price_change_percentage_24h} />
                  </div>

                  <span
                    className={`hidden lg:block text-right text-xs font-medium tabular-nums ${
                      (coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {coin.price_change_percentage_7d_in_currency != null
                      ? formatPct(coin.price_change_percentage_7d_in_currency)
                      : '—'}
                  </span>

                  <span className="hidden lg:block text-right text-xs text-muted-foreground tabular-nums">
                    {formatUsd(coin.market_cap, true)}
                  </span>

                  <div className="hidden lg:flex justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <Sparkline
                      data={coin.sparkline_in_7d?.price ?? []}
                      positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                    />
                  </div>

                  <div className="flex lg:hidden items-center justify-between col-span-full pt-1 border-t border-border/20 mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      MCap {formatUsd(coin.market_cap, true)} · Vol {formatUsd(coin.total_volume, true)}
                    </span>
                    <Sparkline
                      data={coin.sparkline_in_7d?.price ?? []}
                      positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
