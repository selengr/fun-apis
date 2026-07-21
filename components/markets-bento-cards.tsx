'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CoinMarket } from '@/types/coingecko'
import { formatPct, formatUsd } from '@/lib/crypto-format'

const REFRESH_MS = 30_000

const CARD_IMAGES = {
  crypto:
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
  forex:
    'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
  soon:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
} as const

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
  image,
  wash = 'from-[#0f1419]/45 via-[#0f1419]/55 to-[#0f1419]/92',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  image: string
  wash?: string
}) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-white/10 overflow-hidden transition-all duration-700 ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${wash}`} />
      <div className="absolute inset-0 bg-[#0f1419]/25" />
      {children}
    </div>
  )
}

function pctColor(pct: number) {
  if (Number.isNaN(pct)) return 'rgba(255,255,255,0.5)'
  return pct >= 0 ? '#6ee7b7' : '#fda4af'
}

function sampleSparkline(prices: number[], count = 11): number[] {
  if (prices.length <= count) return prices
  const step = (prices.length - 1) / (count - 1)
  return Array.from({ length: count }, (_, i) => prices[Math.round(i * step)])
}

function buildChartPaths(
  prices: number[],
  width = 300,
  yBottom = 150,
  yRange = 90,
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
      <text x={x} y="22" fill={pairColor} fontSize="8.5" fontFamily="monospace" opacity=".85">
        {pairLabel}
      </text>
      <text x={priceX} y="38" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="700">
        {price}
      </text>
      <text x={pctX} y="38" fill={pctColor(change)} fontSize="9" fontFamily="monospace">
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
    ? buildChartPaths(btc.sparkline_in_7d.price)
    : null
  const forexChart = eurSeries.length >= 2
    ? buildChartPaths(eurSeries, 300, 145, 80)
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
      {/* Crypto */}
      <Link href="/crypto" className="col-span-12 md:col-span-4 block">
        <MarketBentoCard
          className="p-0 min-h-[240px] h-full cursor-pointer"
          delay={120}
          image={CARD_IMAGES.crypto}
          wash="from-[#0c1210]/30 via-[#0c1210]/50 to-[#0c1210]/92"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 240"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity=".28" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
            </defs>
            {btcChart ? (
              <>
                <path d={btcChart.fill} fill="url(#cg)" />
                <path d={btcChart.line} fill="none" stroke="#6ee7b7" strokeWidth="1.6" />
                <circle cx={btcChart.lastX} cy={btcChart.lastY} r="3" fill="#6ee7b7" />
              </>
            ) : null}
            <PriceLabel x={16} pairLabel="BTC / USD" pairColor="#a7f3d0" price={btcPrice} pct={btcPct} pctX={88} />
            <PriceLabel x={168} pairLabel="ETH / USD" pairColor="#e7e5e4" price={ethPrice} pct={ethPct} pctX={236} />
          </svg>

          <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-28">
            <p className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Crypto</p>
            <h3 className="text-[15px] font-light text-white mb-2">Live crypto prices</h3>
            <p className="text-sm text-white/55 leading-relaxed">
              Bitcoin, Ethereum, and the top coins — updated every 30 seconds.
            </p>
          </div>
        </MarketBentoCard>
      </Link>

      {/* Forex */}
      <Link href="/forex" className="col-span-12 md:col-span-4 block">
        <MarketBentoCard
          className="p-0 min-h-[240px] h-full cursor-pointer"
          delay={160}
          image={CARD_IMAGES.forex}
          wash="from-[#0a1411]/35 via-[#0a1411]/55 to-[#0a1411]/93"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 240"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity=".3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {forexChart ? (
              <>
                <path d={forexChart.fill} fill="url(#fg)" />
                <path d={forexChart.line} fill="none" stroke="#6ee7b7" strokeWidth="1.6" />
                <circle cx={forexChart.lastX} cy={forexChart.lastY} r="3" fill="#6ee7b7" />
              </>
            ) : null}
            <PriceLabel x={16} pairLabel="EUR / USD" pairColor="#a7f3d0" price={eurPrice} pct={eurPct} pctX={78} />
            <PriceLabel x={158} pairLabel="GBP / USD" pairColor="#a7f3d0" price={gbpPrice} pct={gbpPct} pctX={230} />
          </svg>

          <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-28">
            <p className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Forex</p>
            <h3 className="text-[15px] font-light text-white mb-2">Exchange rates</h3>
            <p className="text-sm text-white/55 leading-relaxed">
              Live FX pairs, conversion, and history charts.
            </p>
          </div>
        </MarketBentoCard>
      </Link>

      {/* Soon */}
      <MarketBentoCard
        className="col-span-12 md:col-span-4 p-0 min-h-[240px]"
        delay={200}
        image={CARD_IMAGES.soon}
        wash="from-[#12110f]/40 via-[#12110f]/60 to-[#12110f]/94"
      >
        <div className="relative z-10 flex flex-col justify-end h-full p-6 min-h-[240px]">
          <p className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-2">Soon</p>
          <h3 className="text-[15px] font-light text-white mb-2">More markets</h3>
          <p className="text-sm text-white/55 leading-relaxed">
            Stocks, commodities, and other finance tools will land here next.
          </p>
        </div>
      </MarketBentoCard>
    </>
  )
}
