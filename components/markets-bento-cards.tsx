'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CoinMarket } from '@/types/coingecko'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

type ForexPair = {
  label: string
  rate: number
  change: number
}

function seriesToPair(label: string, series: { rate: number }[]): ForexPair | null {
  if (!series.length) return null
  const first = series[0].rate
  const last = series[series.length - 1].rate
  return {
    label,
    rate: last,
    change: series.length > 1 ? ((last - first) / first) * 100 : 0,
  }
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function MarketBentoCard({
  children,
  className = '',
  delay = 0,
  style = {},
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:border-border/80 hover:bg-accent ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 [background:radial-gradient(400px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),color-mix(in_srgb,var(--foreground)_3%,transparent),transparent_60%)]" />
      {children}
    </div>
  )
}

function pctColor(pct: number) {
  if (Number.isNaN(pct)) return 'rgba(255,255,255,0.5)'
  return pct >= 0 ? '#4ade80' : '#f87171'
}

function sampleSparkline(prices: number[], count = 11): number[] {
  if (prices.length <= count) return prices
  const step = (prices.length - 1) / (count - 1)
  return Array.from({ length: count }, (_, i) => prices[Math.round(i * step)])
}

function buildChartPaths(
  prices: number[],
  width = 300,
  yBottom = 160,
  yRange = 108,
) {
  const sampled = sampleSparkline(prices)
  if (sampled.length < 2) return null

  const min = Math.min(...sampled)
  const max = Math.max(...sampled)
  const range = max - min || 1

  const pts = sampled.map((v, i) => ({
    x: (i / (sampled.length - 1)) * width,
    y: yBottom - ((v - min) / range) * yRange,
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(0)},${p.y.toFixed(1)}`).join(' ')
  const fill = `${line} L${width},240 L0,240 Z`
  const last = pts[pts.length - 1]

  return { line, fill, lastX: last.x, lastY: last.y }
}

function formatForexRate(rate: number) {
  return rate >= 10 ? rate.toFixed(2) : rate.toFixed(4)
}

function PriceLabel({
  x,
  pairLabel,
  pairColor,
  price,
  pct,
  priceX = x,
  pctX,
}: {
  x: number
  pairLabel: string
  pairColor: string
  price: string
  pct: string
  priceX?: number
  pctX: number
}) {
  const change = parseFloat(pct)
  return (
    <>
      <text x={x} y="24" fill={pairColor} fontSize="8.5" fontFamily="monospace" opacity=".7">
        {pairLabel}
      </text>
      <text x={priceX} y="40" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="700">
        {price}
      </text>
      <text x={pctX} y="40" fill={pctColor(change)} fontSize="9" fontFamily="monospace">
        {pct}
      </text>
    </>
  )
}

export function MarketsBentoCards() {
  const [btc, setBtc] = useState<CoinMarket | null>(null)
  const [eth, setEth] = useState<CoinMarket | null>(null)
  const [eur, setEur] = useState<ForexPair | null>(null)
  const [gbp, setGbp] = useState<ForexPair | null>(null)
  const [eurSeries, setEurSeries] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [cryptoRes, eurSeriesRes, gbpSeriesRes] = await Promise.all([
          fetch('/api/crypto?per_page=2', { cache: 'no-store' }),
          fetch('/api/forex?action=series&days=7d&base=EUR&quote=USD', { cache: 'no-store' }),
          fetch('/api/forex?action=series&days=7d&base=GBP&quote=USD', { cache: 'no-store' }),
        ])

        const cryptoJson = await cryptoRes.json()
        const eurSeriesJson = await eurSeriesRes.json()
        const gbpSeriesJson = await gbpSeriesRes.json()

        if (!cancelled) {
          const coins: CoinMarket[] = cryptoJson.coins ?? []
          setBtc(coins.find(c => c.symbol.toLowerCase() === 'btc') ?? coins[0] ?? null)
          setEth(coins.find(c => c.symbol.toLowerCase() === 'eth') ?? coins[1] ?? null)

          const eurPoints: { rate: number }[] = eurSeriesJson.series ?? []
          const gbpPoints: { rate: number }[] = gbpSeriesJson.series ?? []
          setEur(seriesToPair('EUR / USD', eurPoints))
          setGbp(seriesToPair('GBP / USD', gbpPoints))
          setEurSeries(eurPoints.map(p => p.rate))
        }
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

  const btcChart = btc?.sparkline_in_7d?.price
    ? buildChartPaths(btc.sparkline_in_7d.price, 300, 160, 108)
    : null
  const forexChart = eurSeries.length >= 2
    ? buildChartPaths(eurSeries, 300, 155, 90)
    : null

  const btcPrice = loading && !btc ? '—' : btc ? formatUsd(btc.current_price) : '—'
  const btcPct = loading && !btc ? '—' : btc ? formatPct(btc.price_change_percentage_24h) : '—'
  const ethPrice = loading && !eth ? '—' : eth ? formatUsd(eth.current_price) : '—'
  const ethPct = loading && !eth ? '—' : eth ? formatPct(eth.price_change_percentage_24h) : '—'

  const eurPrice = loading && !eur ? '—' : eur ? formatForexRate(eur.rate) : '—'
  const eurPct = loading && !eur ? '—' : eur ? formatPct(eur.change) : '—'
  const gbpPrice = loading && !gbp ? '—' : gbp ? formatForexRate(gbp.rate) : '—'
  const gbpPct = loading && !gbp ? '—' : gbp ? formatPct(gbp.change) : '—'

  return (
    <>
      {/* Crypto card */}
      <Link href="/crypto" className="col-span-12 md:col-span-4 block">
        <MarketBentoCard
          className="p-0 min-h-[200px] h-full cursor-pointer overflow-hidden relative"
          style={{ background: '#0a0b0f', borderColor: 'rgba(245,158,11,0.15)' }}
          delay={120}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 240"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity=".2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a0b0f" stopOpacity="0" />
                <stop offset="55%" stopColor="#0a0b0f" stopOpacity=".7" />
                <stop offset="100%" stopColor="#0a0b0f" stopOpacity="1" />
              </linearGradient>
            </defs>
            <line x1="0" y1="60" x2="300" y2="60" stroke="#f59e0b" strokeWidth=".3" opacity=".1" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#f59e0b" strokeWidth=".3" opacity=".1" />
            <line x1="0" y1="140" x2="300" y2="140" stroke="#f59e0b" strokeWidth=".3" opacity=".1" />
            {btcChart ? (
              <>
                <path d={btcChart.fill} fill="url(#cg)" />
                <path d={btcChart.line} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx={btcChart.lastX} cy={btcChart.lastY} r="3" fill="#f59e0b" />
                <circle cx={btcChart.lastX} cy={btcChart.lastY} r="6" fill="#f59e0b" opacity=".2" />
              </>
            ) : (
              <>
                <path d="M0,160 L30,145 L60,130 L90,138 L120,110 L150,95 L180,100 L210,78 L240,65 L270,75 L300,52 L300,240 L0,240 Z" fill="url(#cg)" />
                <path d="M0,160 L30,145 L60,130 L90,138 L120,110 L150,95 L180,100 L210,78 L240,65 L270,75 L300,52" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="300" cy="52" r="3" fill="#f59e0b" />
                <circle cx="300" cy="52" r="6" fill="#f59e0b" opacity=".2" />
              </>
            )}
            <PriceLabel x={16} pairLabel="BTC / USD" pairColor="#f59e0b" price={btcPrice} pct={btcPct} pctX={88} />
            <PriceLabel x={170} pairLabel="ETH / USD" pairColor="#8b5cf6" price={ethPrice} pct={ethPct} pctX={238} />
            <rect x="0" y="0" width="300" height="240" fill="url(#cd)" />
          </svg>

          <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-32">
            <div className="w-8 h-8 rounded-xl border border-amber-500/25 bg-amber-500/10 flex items-center justify-center mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[15px] font-medium text-white">Live crypto prices</h3>
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
              </span>
            </div>
            <p className="text-sm text-white/45 leading-relaxed">
              Bitcoin, Ethereum, and the top coins — updated every 30 seconds.
              Sparklines, ticker, and global stats in one clean view.
            </p>
          </div>
        </MarketBentoCard>
      </Link>

      {/* Forex card */}
      <Link href="/forex" className="col-span-12 md:col-span-4 block">
        <MarketBentoCard
          className="p-0 min-h-[200px] h-full cursor-pointer overflow-hidden relative"
          style={{ background: '#050e0a', borderColor: 'rgba(16,185,129,0.15)' }}
          delay={160}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity=".25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#050e0a" stopOpacity="0" />
                <stop offset="55%" stopColor="#050e0a" stopOpacity=".7" />
                <stop offset="100%" stopColor="#050e0a" stopOpacity="1" />
              </linearGradient>
            </defs>
            <line x1="0" y1="60" x2="300" y2="60" stroke="#10b981" strokeWidth=".3" opacity=".12" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#10b981" strokeWidth=".3" opacity=".12" />
            <line x1="0" y1="140" x2="300" y2="140" stroke="#10b981" strokeWidth=".3" opacity=".12" />
            {forexChart ? (
              <>
                <path d={forexChart.fill} fill="url(#fg)" />
                <path d={forexChart.line} fill="none" stroke="#10b981" strokeWidth="1.5" />
                <circle cx={forexChart.lastX} cy={forexChart.lastY} r="3" fill="#10b981" />
                <circle cx={forexChart.lastX} cy={forexChart.lastY} r="6" fill="#10b981" opacity=".2" />
              </>
            ) : (
              <>
                <path d="M0,155 L38,145 L75,150 L112,122 L150,128 L188,100 L225,106 L262,78 L300,65 L300,240 L0,240 Z" fill="url(#fg)" />
                <path d="M0,155 L38,145 L75,150 L112,122 L150,128 L188,100 L225,106 L262,78 L300,65" fill="none" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="300" cy="65" r="3" fill="#10b981" />
                <circle cx="300" cy="65" r="6" fill="#10b981" opacity=".2" />
              </>
            )}
            <PriceLabel x={16} pairLabel="EUR / USD" pairColor="#6ee7b7" price={eurPrice} pct={eurPct} pctX={78} />
            <PriceLabel x={160} pairLabel="GBP / USD" pairColor="#6ee7b7" price={gbpPrice} pct={gbpPct} pctX={232} />
            <rect x="0" y="0" width="300" height="240" fill="url(#fd)" />
          </svg>

          <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-32">
            <div className="w-8 h-8 rounded-xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-6 4 3 5-7" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[15px] font-medium text-white">Exchange rates</h3>
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
              </span>
            </div>
            <p className="text-sm text-white/45 leading-relaxed">
              Frankfurter forex data — live rates, currency conversion, and
              7-day to 1-year history charts.
            </p>
          </div>
        </MarketBentoCard>
      </Link>

      {/* Coming soon */}
      <MarketBentoCard
        className="col-span-12 md:col-span-4 p-0 min-h-[200px] overflow-hidden relative"
        style={{ background: '#0a0812', borderColor: 'rgba(139,92,246,0.15)' }}
        delay={200}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".22" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0812" stopOpacity="0" />
              <stop offset="55%" stopColor="#0a0812" stopOpacity=".7" />
              <stop offset="100%" stopColor="#0a0812" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line x1="0" y1="60" x2="300" y2="60" stroke="#8b5cf6" strokeWidth=".3" opacity=".1" />
          <line x1="0" y1="100" x2="300" y2="100" stroke="#8b5cf6" strokeWidth=".3" opacity=".1" />
          <line x1="0" y1="140" x2="300" y2="140" stroke="#8b5cf6" strokeWidth=".3" opacity=".1" />
          <path d="M0,165 L45,150 L90,158 L135,130 L180,118 L225,125 L270,95 L300,82 L300,240 L0,240 Z" fill="url(#sg)" />
          <path d="M0,165 L45,150 L90,158 L135,130 L180,118 L225,125 L270,95 L300,82" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="300" cy="82" r="3" fill="#8b5cf6" />
          <circle cx="300" cy="82" r="6" fill="#8b5cf6" opacity=".2" />
          {([[22,120,22,68],[58,96,22,92],[94,108,22,80],[130,75,22,113],[166,88,22,100],[202,55,22,133],[238,70,22,118]] as const).map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#8b5cf6" opacity=".08" />
          ))}
          <rect x="0" y="0" width="300" height="240" fill="url(#sd)" />
        </svg>
        <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-32">
          <div className="w-8 h-8 rounded-xl border border-violet-500/25 bg-violet-500/10 flex items-center justify-center mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[15px] font-medium text-white">More on the way</h3>
            <span className="text-[10px] uppercase tracking-widest text-violet-300/60 px-2 py-0.5 rounded-full border border-violet-500/25">
              soon
            </span>
          </div>
          <p className="text-sm text-white/45 leading-relaxed">
            Stocks, commodities, and other finance tools. This section will grow as we add them.
          </p>
        </div>
      </MarketBentoCard>
    </>
  )
}
