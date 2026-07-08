import { NextRequest, NextResponse } from 'next/server'
import type { CoinMarket, GlobalMarketData } from '@/types/coingecko'

const COINGECKO = 'https://api.coingecko.com/api/v3'

export const dynamic = 'force-dynamic'
export const revalidate = 30

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page') ?? '1'
  const perPage = request.nextUrl.searchParams.get('per_page') ?? '50'
  const search = request.nextUrl.searchParams.get('search')?.trim()

  try {
    if (search) {
      const searchRes = await fetch(
        `${COINGECKO}/search?query=${encodeURIComponent(search)}`,
        { next: { revalidate: 60 } },
      )
      if (!searchRes.ok) throw new Error('Search failed')
      const searchData = await searchRes.json()
      const ids = (searchData.coins ?? [])
        .slice(0, 10)
        .map((c: { id: string }) => c.id)
        .join(',')

      if (!ids) {
        return NextResponse.json({ coins: [], global: null })
      }

      const coinsRes = await fetch(
        `${COINGECKO}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`,
        { next: { revalidate: 30 } },
      )
      const coins: CoinMarket[] = coinsRes.ok ? await coinsRes.json() : []
      return NextResponse.json({ coins, global: null })
    }

    const [coinsRes, globalRes] = await Promise.all([
      fetch(
        `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`,
        { next: { revalidate: 30 } },
      ),
      fetch(`${COINGECKO}/global`, { next: { revalidate: 30 } }),
    ])

    if (!coinsRes.ok) throw new Error('Markets fetch failed')

    const coins: CoinMarket[] = await coinsRes.json()
    const global: GlobalMarketData | null = globalRes.ok ? await globalRes.json() : null

    return NextResponse.json(
      { coins, global },
      {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 502 })
  }
}
