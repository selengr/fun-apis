import { NextRequest, NextResponse } from 'next/server'
import {
  FEATURED_POETS,
  MOODS,
  POETRYDB,
  normalizePoem,
  pickDailyIndex,
} from '@/lib/poetry'
import type { PoetryMood, PoetryPoem } from '@/types/poetry'

export const dynamic = 'force-dynamic'

const UA = 'fun-apis/1.0 (Daily Poetry; contact@example.com)'

async function poetryFetch(path: string) {
  const res = await fetch(`${POETRYDB}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
    next: { revalidate: 3600 },
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || (json && json.status === 404)) {
    throw new Error(json?.reason ?? `PoetryDB error ${res.status}`)
  }
  return json
}

function asPoems(data: unknown): PoetryPoem[] {
  if (!Array.isArray(data)) return []
  return data
    .filter((p): p is PoetryPoem => p && typeof p === 'object' && 'title' in p)
    .map(normalizePoem)
    .filter(p => p.lines.length > 0 && p.lines.length <= 60)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? 'today'

  try {
    if (action === 'authors') {
      const data = await poetryFetch('/author')
      return NextResponse.json({ authors: data.authors ?? FEATURED_POETS })
    }

    if (action === 'today') {
      // Stable daily poem: pull a pool from a featured poet, pick by date seed
      const poet = FEATURED_POETS[pickDailyIndex(FEATURED_POETS.length, 'poet')]
      const pool = asPoems(await poetryFetch(`/author/${encodeURIComponent(poet)}`))
      const poem = pool[pickDailyIndex(pool.length, poet)] ?? pool[0]
      if (!poem) {
        const fallback = asPoems(await poetryFetch('/random/1'))
        return NextResponse.json({ poem: fallback[0] ?? null, poet, source: 'random' })
      }
      return NextResponse.json({ poem, poet, source: 'daily' })
    }

    if (action === 'random' || action === 'next') {
      const mood = searchParams.get('mood') as PoetryMood | null
      if (mood) {
        const q = MOODS.find(m => m.id === mood)?.query ?? 'love'
        const data = asPoems(
          await poetryFetch(`/lines,poemcount/${encodeURIComponent(q)};12`),
        )
        if (data.length) {
          const poem = data[Math.floor(Math.random() * data.length)]
          return NextResponse.json({ poem, mood })
        }
      }
      const data = asPoems(await poetryFetch('/random/1'))
      return NextResponse.json({ poem: data[0] ?? null, mood: mood ?? null })
    }

    if (action === 'mood') {
      const mood = (searchParams.get('mood') ?? 'romantic') as PoetryMood
      const q = MOODS.find(m => m.id === mood)?.query ?? 'love'
      const data = asPoems(
        await poetryFetch(`/lines,poemcount/${encodeURIComponent(q)};16`),
      )
      const poem = data[Math.floor(Math.random() * Math.max(data.length, 1))] ?? null
      return NextResponse.json({ poem, poems: data.slice(0, 8), mood })
    }

    if (action === 'discover') {
      const [love, nature, hope, random] = await Promise.all([
        poetryFetch('/lines,poemcount/love;6').then(asPoems).catch(() => []),
        poetryFetch('/lines,poemcount/nature;6').then(asPoems).catch(() => []),
        poetryFetch('/lines,poemcount/hope;6').then(asPoems).catch(() => []),
        poetryFetch('/random/6').then(asPoems).catch(() => []),
      ])
      return NextResponse.json({
        popular: love.slice(0, 6),
        nature: nature.slice(0, 6),
        hope: hope.slice(0, 6),
        trending: random.slice(0, 6),
        poets: FEATURED_POETS,
      })
    }

    if (action === 'author') {
      const name = searchParams.get('name') ?? 'Emily Dickinson'
      const poems = asPoems(await poetryFetch(`/author/${encodeURIComponent(name)}`))
      return NextResponse.json({
        author: name,
        poems: poems.slice(0, 8),
        count: poems.length,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Poetry fetch failed' },
      { status: 502 },
    )
  }
}
