import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.restcountries.com/countries/v5'

const DEFAULT_FIELDS = [
  'names.common',
  'names.official',
  'codes.alpha_2',
  'codes.alpha_3',
  'flag.emoji',
  'flag.url_png',
  'flag.colors.dominant',
  'flag.colors.prominent',
  'capitals',
  'region',
  'subregion',
  'continents',
  'population',
  'area.kilometers',
  'borders',
  'coordinates',
  'currencies',
  'languages',
  'demonyms',
  'timezones',
  'landlocked',
  'memberships',
  'calling_codes',
  'tlds',
  'cars.driving_side',
  'units.measurement_system',
  'links.wikipedia',
  'links.google_maps',
].join(',')

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const key = process.env.RESTCOUNTRIES_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'REST Countries API key not configured' }, { status: 500 })
  }

  const { searchParams } = request.nextUrl
  const path = searchParams.get('path')?.replace(/^\/+/, '') ?? ''

  const upstream = new URL(path ? `${BASE}/${path}` : BASE)

  searchParams.forEach((value, key) => {
    if (key === 'path') return
    upstream.searchParams.set(key, value)
  })

  if (!upstream.searchParams.has('response_fields')) {
    upstream.searchParams.set('response_fields', DEFAULT_FIELDS)
  }

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status })
    }

    return NextResponse.json(json, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch country data' }, { status: 502 })
  }
}
