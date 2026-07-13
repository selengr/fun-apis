import { NextRequest, NextResponse } from 'next/server'
import type { Country, CountriesResponse } from '@/types/restcountries'

const RC_BASE = 'https://api.restcountries.com/countries/v5'
const FREE_BASE = 'https://countries.dev'

const DEMO_KEY = 'rc_live_demo'

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

type FreeCountry = {
  name?: string
  nativeName?: string
  alpha2Code?: string
  alpha3Code?: string
  cioc?: string
  flag?: string
  flags?: { png?: string; svg?: string }
  capital?: string
  region?: string
  subregion?: string
  population?: number
  area?: number
  borders?: string[]
  latlng?: number[]
  currencies?: { code?: string; name?: string; symbol?: string }[]
  languages?: { name?: string; nativeName?: string; iso639_1?: string }[]
  demonym?: string
  timezones?: string[]
  landlocked?: boolean
  callingCodes?: string[]
  topLevelDomain?: string[]
  continents?: string[]
}

function mapFreeCountry(c: FreeCountry): Country {
  const lat = c.latlng?.[0]
  const lng = c.latlng?.[1]
  return {
    names: {
      common: c.name,
      official: c.nativeName || c.name,
    },
    codes: {
      alpha_2: c.alpha2Code,
      alpha_3: c.alpha3Code,
      cioc: c.cioc,
    },
    flag: {
      emoji: c.flag && !c.flag.startsWith('http') ? c.flag : undefined,
      url_png: c.flags?.png,
      url_svg: c.flags?.svg,
    },
    capitals: c.capital ? [{ name: c.capital }] : [],
    region: c.region,
    subregion: c.subregion,
    continents: c.continents,
    population: c.population,
    area: c.area != null ? { kilometers: c.area } : undefined,
    borders: c.borders,
    coordinates: lat != null && lng != null ? { lat, lng } : undefined,
    currencies: (c.currencies ?? [])
      .filter((cur): cur is { code: string; name: string; symbol: string } => Boolean(cur.code && cur.name))
      .map(cur => ({
        code: cur.code!,
        name: cur.name!,
        symbol: cur.symbol ?? cur.code!,
      })),
    languages: (c.languages ?? []).map(l => ({
      name: l.name ?? '',
      native_name: l.nativeName,
      iso639_1: l.iso639_1,
    })),
    demonyms: c.demonym ? { eng: { m: c.demonym, f: c.demonym } } : undefined,
    timezones: c.timezones,
    landlocked: c.landlocked,
    calling_codes: c.callingCodes,
    tlds: c.topLevelDomain,
    links: {
      google_maps:
        lat != null && lng != null
          ? `https://www.google.com/maps?q=${lat},${lng}`
          : undefined,
      wikipedia: c.name
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(c.name)}`
        : undefined,
    },
  }
}

function wrapList(
  objects: Country[],
  limit: number,
  offset: number,
  total = objects.length,
): CountriesResponse {
  const slice = objects.slice(offset, offset + limit)
  return {
    data: {
      objects: slice,
      meta: {
        total,
        count: slice.length,
        limit,
        offset,
        more: offset + slice.length < total,
      },
    },
  }
}

async function fetchFree(path: string) {
  const res = await fetch(`${FREE_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    throw new Error(`countries.dev error (${res.status})`)
  }
  return res.json()
}

async function handleFreeFallback(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const path = searchParams.get('path')?.replace(/^\/+/, '') ?? ''
  const q = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? 24) || 24, 100)
  const offset = Math.max(Number(searchParams.get('offset') ?? 0) || 0, 0)

  let raw: FreeCountry[] = []

  if (path.startsWith('region/')) {
    const region = decodeURIComponent(path.slice('region/'.length))
    const data = await fetchFree(`/region/${encodeURIComponent(region)}`)
    raw = Array.isArray(data) ? data : data ? [data] : []
    if (q) {
      const needle = q.toLowerCase()
      raw = raw.filter(
        c =>
          c.name?.toLowerCase().includes(needle) ||
          c.capital?.toLowerCase().includes(needle) ||
          c.alpha2Code?.toLowerCase() === needle ||
          c.alpha3Code?.toLowerCase() === needle,
      )
    }
  } else if (path === 'name' && q) {
    const data = await fetchFree(`/name/${encodeURIComponent(q)}`)
    raw = Array.isArray(data) ? data : data ? [data] : []
  } else if (path === 'code' && q) {
    const data = await fetchFree(`/alpha/${encodeURIComponent(q)}`)
    raw = Array.isArray(data) ? data : data ? [data] : []
  } else if (path === 'capitals' && q) {
    const data = await fetchFree('/countries')
    const all: FreeCountry[] = Array.isArray(data) ? data : []
    const needle = q.toLowerCase()
    raw = all.filter(c => c.capital?.toLowerCase().includes(needle))
  } else if (q) {
    // Free-text across name / capital / codes
    const data = await fetchFree('/countries')
    const all: FreeCountry[] = Array.isArray(data) ? data : []
    const needle = q.toLowerCase()
    raw = all.filter(
      c =>
        c.name?.toLowerCase().includes(needle) ||
        c.capital?.toLowerCase().includes(needle) ||
        c.alpha2Code?.toLowerCase().includes(needle) ||
        c.alpha3Code?.toLowerCase().includes(needle) ||
        c.region?.toLowerCase().includes(needle) ||
        c.subregion?.toLowerCase().includes(needle),
    )
  } else {
    const data = await fetchFree('/countries')
    raw = Array.isArray(data) ? data : []
  }

  const mapped = raw.map(mapFreeCountry)
  return NextResponse.json(wrapList(mapped, limit, offset, mapped.length), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}

async function handleRestCountries(request: NextRequest, key: string) {
  const { searchParams } = request.nextUrl
  const path = searchParams.get('path')?.replace(/^\/+/, '') ?? ''
  const upstream = new URL(path ? `${RC_BASE}/${path}` : RC_BASE)

  searchParams.forEach((value, param) => {
    if (param === 'path') return
    upstream.searchParams.set(param, value)
  })

  if (!upstream.searchParams.has('response_fields')) {
    upstream.searchParams.set('response_fields', DEFAULT_FIELDS)
  }

  const res = await fetch(upstream.toString(), {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      json?.errors?.[0]?.message ||
      json?.error ||
      json?.message ||
      `REST Countries error (${res.status})`
    return NextResponse.json(
      { errors: [{ message }], ...(json && typeof json === 'object' ? json : {}) },
      { status: res.status },
    )
  }

  return NextResponse.json(json, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}

export async function GET(request: NextRequest) {
  const key = process.env.RESTCOUNTRIES_API_KEY?.trim()
  const useOfficial = Boolean(key && key !== DEMO_KEY)

  try {
    if (useOfficial) {
      return await handleRestCountries(request, key!)
    }
    // Demo key only returns Canada — use free keyless API instead
    return await handleFreeFallback(request)
  } catch (err) {
    return NextResponse.json(
      {
        errors: [
          {
            message:
              err instanceof Error
                ? err.message
                : 'Failed to fetch country data. Check your network.',
          },
        ],
      },
      { status: 502 },
    )
  }
}
