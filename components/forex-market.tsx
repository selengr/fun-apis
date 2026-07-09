'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Landmark,
  CalendarRange,
  Coins,
  Equal,
} from 'lucide-react'
import type { ForexPeriod, FrankfurterCurrency } from '@/types/frankfurter'
import {
  FALLBACK_CURRENCIES,
  POPULAR_PAIRS,
  REFRESH_MS,
  formatConverted,
  formatRate,
  pctChange,
  periodLabel,
} from '@/lib/frankfurter'
import { ForexChart } from '@/components/forex-chart'
import { CurrencyCombobox } from '@/components/currency-combobox'
import { cn } from '@/lib/utils'

const PERIODS: ForexPeriod[] = ['today', '7', '30', '90', '365']

const DEFAULT_BASE = 'USD'
const DEFAULT_QUOTE = 'IRR'

function ChangePill({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums rounded-full border',
        size === 'lg' ? 'text-sm px-3 py-1' : 'text-[11px] px-2 py-0.5',
        up
          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25'
          : 'text-red-400 bg-red-500/15 border-red-500/25',
      )}
    >
      {up ? <TrendingUp className={size === 'lg' ? 'size-3.5' : 'size-3'} /> : <TrendingDown className={size === 'lg' ? 'size-3.5' : 'size-3'} />}
      {up ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  )
}

function formatIrr(rate: number): string {
  return rate.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
}

export function ForexMarket() {
  const [currencies, setCurrencies] = useState<FrankfurterCurrency[]>([
    ...FALLBACK_CURRENCIES,
    { iso_code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
  ])
  const [base, setBase] = useState(DEFAULT_BASE)
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [period, setPeriod] = useState<ForexPeriod>('today')
  const [amount, setAmount] = useState('1')
  const [rate, setRate] = useState<number | null>(null)
  const [rateDate, setRateDate] = useState<string | null>(null)
  const [series, setSeries] = useState<{ date: string; rate: number }[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pulse, setPulse] = useState(false)
  const prevRateRef = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/forex?action=currencies')
      .then(r => r.json())
      .then(json => {
        if (json.currencies?.length) {
          const list = json.currencies as FrankfurterCurrency[]
          if (!list.some(c => c.iso_code === 'IRR')) {
            list.push({ iso_code: 'IRR', name: 'Iranian Rial', symbol: '﷼' })
          }
          setCurrencies(list)
        }
      })
      .catch(() => {})
  }, [])

  const fetchRate = useCallback(async () => {
    if (base === quote) {
      setError('Choose two different currencies.')
      setLoading(false)
      return
    }

    setRefreshing(true)
    try {
      const res = await fetch(
        `/api/forex?action=rate&base=${base}&quote=${quote}&t=${Date.now()}`,
        { cache: 'no-store' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Rate fetch failed')

      const next = json.rate.rate as number
      if (prevRateRef.current != null && prevRateRef.current !== next) {
        setPulse(true)
        setTimeout(() => setPulse(false), 600)
      }
      prevRateRef.current = next
      setRate(next)
      setRateDate(json.rate.date)
      setLastUpdated(new Date())
      setCountdown(30)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [base, quote])

  const fetchHistory = useCallback(async () => {
    if (base === quote) return
    setHistoryLoading(true)
    try {
      const params = new URLSearchParams({ base, quote })
      const res = await fetch(`/api/forex?action=series&days=${period}&${params}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'History fetch failed')
      setSeries(json.series ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
      setSeries([])
    } finally {
      setHistoryLoading(false)
    }
  }, [base, quote, period])

  useEffect(() => {
    void fetchRate()
    const interval = setInterval(() => void fetchRate(), REFRESH_MS)
    return () => clearInterval(interval)
  }, [fetchRate])

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 30 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const swap = () => {
    setBase(quote)
    setQuote(base)
  }

  const change = useMemo(() => {
    if (series.length < 2) return 0
    return pctChange(series[0].rate, series[series.length - 1].rate)
  }, [series])

  const converted = useMemo(() => {
    const n = parseFloat(amount)
    if (!rate || Number.isNaN(n)) return null
    return n * rate
  }, [amount, rate])

  const sortedCurrencies = useMemo(
    () => [...currencies].sort((a, b) => a.iso_code.localeCompare(b.iso_code)),
    [currencies],
  )

  const displayRate = (value: number, code: string) =>
    code === 'IRR' ? formatIrr(value) : formatRate(value, code)

  const quoteName = currencies.find(c => c.iso_code === quote)?.name ?? quote
  const isUsdIrr = base === 'USD' && quote === 'IRR'

  if (loading && rate == null) {
    return (
      <div className="max-w-6xl mx-auto px-4 space-y-4 pb-16">
        <div className="h-44 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted/25 animate-pulse" />
        <div className="h-72 rounded-2xl bg-muted/20 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
      {/* Hero — live USD → IRR by default */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card/80 to-sky-600/5 backdrop-blur-xl p-6 md:p-8 transition-shadow duration-300',
          pulse && 'ring-2 ring-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.15)]',
        )}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-3">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <Landmark className="size-3.5" />
              <span className="text-[10px] uppercase tracking-[0.15em]">
                {isUsdIrr ? 'USD → Iranian Rial · right now' : 'Live exchange rate'}
              </span>
              {rateDate && <span className="text-[10px]">· {rateDate}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              1 <span className="font-mono font-medium text-foreground">{base}</span> =
            </p>
            <p className="font-mono font-bold tabular-nums tracking-tight text-foreground text-4xl md:text-5xl">
              {rate != null ? displayRate(rate, quote) : '—'}{' '}
              <span className="text-2xl md:text-3xl text-muted-foreground">{quote}</span>
            </p>
            {isUsdIrr && (
              <p className="mt-2 text-sm text-muted-foreground">
                Iranian Rial · ریال ایران
              </p>
            )}
            {!isUsdIrr && (
              <p className="mt-2 text-sm text-muted-foreground">{quoteName}</p>
            )}
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3">
            <ChangePill value={change} size="lg" />
            <p className="text-[11px] text-muted-foreground">
              {period === 'today' ? 'vs previous session' : `${periodLabel(period)} change`}
            </p>
            <button
              type="button"
              onClick={() => void fetchRate()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border/60 bg-background/50 text-[11px] text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()} · ${countdown}s`
                : `Refresh · ${countdown}s`}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Premium converter atelier */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-border/40 bg-gradient-to-b from-card/80 via-card/50 to-card/30 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.06)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-emerald-400/8 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 size-48 rounded-full bg-sky-400/6 blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-7 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-700/50 dark:text-emerald-300/40 mb-1.5">
                Currency atelier
              </p>
              <h2 className="text-xl font-light tracking-tight text-foreground">
                Convert with precision
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-mono tabular-nums">
              1 {base} = {rate != null ? displayRate(rate, quote) : '—'} {quote}
            </p>
          </div>

          <div className="relative space-y-3">
            {/* From */}
            <div className="rounded-3xl border border-border/50 bg-background/55 p-4 sm:p-5 shadow-sm">
              <div className="grid sm:grid-cols-[1fr_minmax(0,1.1fr)] gap-4 sm:gap-5 items-end">
                <CurrencyCombobox
                  label="You send"
                  value={base}
                  currencies={sortedCurrencies}
                  onChange={setBase}
                />
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                    Amount
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className={cn(
                        'w-full h-[3.65rem] rounded-2xl border border-border/50 bg-muted/20 px-4 pr-16',
                        'font-mono text-2xl font-light tabular-nums tracking-tight text-foreground',
                        'outline-none transition-all placeholder:text-muted-foreground/40',
                        'focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/15',
                      )}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-medium text-muted-foreground">
                      {base}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap */}
            <div className="relative z-10 flex justify-center -my-1">
              <button
                type="button"
                onClick={swap}
                className={cn(
                  'inline-flex size-12 items-center justify-center rounded-full',
                  'border border-border/60 bg-background text-foreground shadow-lg shadow-black/5',
                  'transition-all duration-300 cursor-pointer',
                  'hover:scale-105 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300',
                  'active:scale-95',
                )}
                aria-label="Swap currencies"
              >
                <ArrowDownUp className="size-4" />
              </button>
            </div>

            {/* To */}
            <div className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.07] via-background/50 to-sky-500/[0.04] p-4 sm:p-5">
              <div className="grid sm:grid-cols-[1fr_minmax(0,1.1fr)] gap-4 sm:gap-5 items-end">
                <CurrencyCombobox
                  label="You receive"
                  value={quote}
                  currencies={sortedCurrencies}
                  onChange={setQuote}
                />
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                    Result
                  </p>
                  <div className="relative flex h-[3.65rem] items-center rounded-2xl border border-emerald-500/20 bg-background/60 px-4 pr-16">
                    <Equal className="absolute left-3.5 size-3.5 text-emerald-600/40 dark:text-emerald-300/30" />
                    <p className="w-full pl-5 font-mono text-2xl font-light tabular-nums tracking-tight text-foreground truncate">
                      {converted != null
                        ? quote === 'IRR'
                          ? formatIrr(converted)
                          : formatConverted(converted, quote)
                        : '—'}
                    </p>
                    <span className="absolute right-4 font-mono text-xs font-medium text-muted-foreground">
                      {quote}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick pairs */}
          <div className="mt-6 pt-5 border-t border-border/40">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Signature pairs
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { base: 'USD', quote: 'IRR', label: 'USD → IRR' },
                ...POPULAR_PAIRS.map(p => ({
                  base: p.base,
                  quote: p.quote,
                  label: `${p.base} → ${p.quote}`,
                })),
              ].map(p => {
                const active = base === p.base && quote === p.quote
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setBase(p.base); setQuote(p.quote) }}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-2 text-[11px] font-medium tracking-wide transition-all duration-300 cursor-pointer',
                      active
                        ? 'bg-foreground text-background shadow-md'
                        : 'border border-border/50 bg-background/40 text-muted-foreground hover:border-emerald-500/30 hover:text-foreground',
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* History / today */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <CalendarRange className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {period === 'today' ? 'Today' : 'History'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{base}/{quote}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PERIODS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setPeriod(d)}
                className={cn(
                  'text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer',
                  period === d
                    ? 'bg-foreground text-background border-foreground font-medium'
                    : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground',
                )}
              >
                {periodLabel(d)}
              </button>
            ))}
          </div>
        </div>
        <div className={cn('p-5 md:p-6 transition-opacity', historyLoading && 'opacity-60')}>
          {error ? (
            <p className="text-sm text-red-400 text-center py-16 rounded-xl border border-red-500/20 bg-red-500/10">
              {error}
            </p>
          ) : period === 'today' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/40 bg-muted/15 p-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  Latest session
                </p>
                <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {series[series.length - 1]
                    ? displayRate(series[series.length - 1].rate, quote)
                    : rate != null
                      ? displayRate(rate, quote)
                      : '—'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {series[series.length - 1]?.date ?? rateDate ?? '—'}
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-muted/15 p-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  Previous session
                </p>
                <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {series.length > 1 ? displayRate(series[0].rate, quote) : '—'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {series.length > 1 ? series[0].date : 'Waiting for prior fix'}
                  </p>
                  {series.length > 1 && <ChangePill value={change} />}
                </div>
              </div>
              {series.length >= 2 && (
                <div className="sm:col-span-2 pt-2">
                  <ForexChart data={series} positive={change >= 0} height={160} />
                </div>
              )}
            </div>
          ) : (
            <ForexChart data={series} positive={change >= 0} />
          )}
        </div>
      </div>


    </div>
  )
}
