import { NextRequest, NextResponse } from 'next/server'
import { FRANKFURTER_API, dateRangeForPeriod } from '@/lib/frankfurter'
import type { ForexPeriod, FrankfurterCurrency, FrankfurterRate, FrankfurterRatePoint } from '@/types/frankfurter'

export const dynamic = 'force-dynamic'

const UA = 'fun-apis/1.0 (forex; contact: github.com)'

async function frankfurterFetch(path: string) {
  const res = await fetch(`${FRANKFURTER_API}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message ?? 'Frankfurter request failed')
  }
  return json
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? 'rate'

  try {
    if (action === 'currencies') {
      const data = await frankfurterFetch('/v2/currencies')
      const currencies: FrankfurterCurrency[] = Array.isArray(data) ? data : []
      return NextResponse.json({ currencies })
    }

    const base = (searchParams.get('base') ?? 'USD').toUpperCase()
    const quote = (searchParams.get('quote') ?? 'EUR').toUpperCase()

    if (base === quote) {
      return NextResponse.json({ error: 'Base and quote must differ' }, { status: 400 })
    }

    if (action === 'rate') {
      const data: FrankfurterRate = await frankfurterFetch(`/v2/rate/${base}/${quote}`)
      return NextResponse.json({ rate: data })
    }

    if (action === 'latest') {
      const quotes = searchParams.get('quotes') ?? 'EUR,GBP,JPY,CHF,CAD,AUD'
      const params = new URLSearchParams({ base, quotes })

      const from = new Date()
      from.setDate(from.getDate() - 2)
      params.set('from', from.toISOString().slice(0, 10))

      const data: FrankfurterRatePoint[] = await frankfurterFetch(`/v2/rates?${params}`)
      const rows = Array.isArray(data) ? data : []

      const grouped = new Map<string, FrankfurterRatePoint[]>()
      for (const row of rows) {
        const list = grouped.get(row.quote) ?? []
        list.push(row)
        grouped.set(row.quote, list)
      }

      const rates = [...grouped.entries()].map(([quote, points]) => {
        const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        return {
          quote,
          rate: last.rate,
          date: last.date,
          change: sorted.length > 1 ? ((last.rate - first.rate) / first.rate) * 100 : 0,
        }
      })

      const latestDate = rates.reduce((max, r) => (r.date > max ? r.date : max), '')

      return NextResponse.json(
        { base, date: latestDate, rates, fetchedAt: new Date().toISOString() },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    if (action === 'series') {
      const days = (searchParams.get('days') ?? 'today') as ForexPeriod
      const { from, to, group } = dateRangeForPeriod(days)
      const params = new URLSearchParams({
        base,
        quotes: quote,
        from,
        to,
      })
      if (group) params.set('group', group)

      const [data, latest] = await Promise.all([
        frankfurterFetch(`/v2/rates?${params}`) as Promise<FrankfurterRatePoint[]>,
        frankfurterFetch(`/v2/rate/${base}/${quote}`) as Promise<FrankfurterRate>,
      ])

      const map = new Map<string, number>()
      for (const p of Array.isArray(data) ? data : []) {
        if (p.quote === quote) map.set(p.date, p.rate)
      }
      // Always include the latest official rate (today's session when published)
      if (latest?.date && typeof latest.rate === 'number') {
        map.set(latest.date, latest.rate)
      }

      let series = [...map.entries()]
        .map(([date, rate]) => ({ date, rate }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Today view: keep only the latest session (+ previous for change %)
      if (days === 'today' && series.length > 2) {
        series = series.slice(-2)
      }

      return NextResponse.json({
        series,
        base,
        quote,
        from,
        to,
        latestDate: latest?.date ?? series[series.length - 1]?.date ?? null,
        period: days,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Forex fetch failed' },
      { status: 502 },
    )
  }
}
