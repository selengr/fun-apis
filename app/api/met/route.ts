import { NextRequest, NextResponse } from 'next/server'
import { mapArtwork, MET_API, MET_UA } from '@/lib/met'
import type { MetObjectRaw, MetSearchRaw } from '@/types/met'

export const dynamic = 'force-dynamic'

const BATCH = 6
const MAX_RESULTS = 24

async function metFetch(path: string) {
  const res = await fetch(`${MET_API}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': MET_UA,
    },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Met API error ${res.status}`)
  }
  return res.json()
}

async function hydrateIds(ids: number[], limit: number): Promise<ReturnType<typeof mapArtwork>[]> {
  const artworks: NonNullable<ReturnType<typeof mapArtwork>>[] = []
  let cursor = 0

  while (artworks.length < limit && cursor < ids.length) {
    const slice = ids.slice(cursor, cursor + BATCH)
    cursor += BATCH

    const results = await Promise.all(
      slice.map(id =>
        metFetch(`/objects/${id}`)
          .then(o => mapArtwork(o as MetObjectRaw))
          .catch(() => null),
      ),
    )

    for (const a of results) {
      if (a) artworks.push(a)
      if (artworks.length >= limit) break
    }
  }

  return artworks
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? 'search'

  try {
    if (action === 'object') {
      const id = searchParams.get('id')
      if (!id || !/^\d+$/.test(id)) {
        return NextResponse.json({ error: 'Valid object id required' }, { status: 400 })
      }
      const raw = (await metFetch(`/objects/${id}`)) as MetObjectRaw
      const artwork = mapArtwork(raw)
      if (!artwork) {
        return NextResponse.json({ error: 'No image available for this object' }, { status: 404 })
      }
      return NextResponse.json({ artwork })
    }

    if (action === 'search' || action === 'featured' || action === 'suggest') {
      const q =
        action === 'featured'
          ? (searchParams.get('q') ?? 'van Gogh').trim() || 'van Gogh'
          : (searchParams.get('q') ?? '').trim()

      if (!q) return NextResponse.json({ artworks: [], total: 0, q: '' })

      const defaultLimit = action === 'suggest' ? 6 : MAX_RESULTS
      const limit = Math.min(
        Number(searchParams.get('limit') ?? defaultLimit) || defaultLimit,
        MAX_RESULTS,
      )

      const params = new URLSearchParams({
        q,
        hasImages: 'true',
      })

      const search = (await metFetch(`/search?${params}`)) as MetSearchRaw
      const ids = search.objectIDs ?? []
      const artworks = await hydrateIds(ids, limit)

      return NextResponse.json({
        artworks,
        total: search.total ?? 0,
        q,
      })
    }

    if (action === 'departments') {
      const data = await metFetch('/departments')
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Met Museum request failed' },
      { status: 502 },
    )
  }
}
