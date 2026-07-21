import { NextRequest, NextResponse } from 'next/server'
import {
  OL_API,
  OL_UA,
  FALLBACK_TRENDING,
  mapSearchDoc,
  mapWorkDetail,
} from '@/lib/openlibrary'
import type { BookCard, OLAuthor, OLSearchDoc, OLSearchResponse, OLWork } from '@/types/openlibrary'

export const dynamic = 'force-dynamic'

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function olFetch(path: string, retries = 2): Promise<unknown> {
  let lastErr: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)
    try {
      const res = await fetch(`${OL_API}${path}`, {
        headers: {
          'User-Agent': OL_UA,
          Accept: 'application/json',
        },
        signal: ctrl.signal,
        cache: 'no-store',
      })
      clearTimeout(timer)

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Open Library error ${res.status}`)
        await sleep(400 * (attempt + 1))
        continue
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Open Library error ${res.status}`)
      }

      return await res.json()
    } catch (err) {
      clearTimeout(timer)
      lastErr = err instanceof Error ? err : new Error('Open Library request failed')
      if (attempt < retries) await sleep(350 * (attempt + 1))
    }
  }

  throw lastErr ?? new Error('Open Library request failed')
}

/**
 * Fetch trending books without verifying covers via download.
 * Cover HEAD/GET checks were the main failure behind VPN/proxy.
 */
async function fetchTrendingBooks(limit: number): Promise<{ books: BookCard[]; fallback: boolean }> {
  const fetchLimit = Math.min(Math.max(limit * 2, 24), 40)
  const fields =
    'key,title,author_name,author_key,first_publish_year,cover_i,edition_count,language,subject,number_of_pages_median,ratings_average,ratings_count,want_to_read_count,already_read_count,currently_reading_count,isbn'

  const attempts = [
    `/search.json?q=subject:fiction&sort=readinglog&limit=${fetchLimit}&fields=${fields}`,
    `/search.json?q=subject:literature&sort=readinglog&limit=${fetchLimit}&fields=${fields}`,
    `/search.json?q=english&sort=readinglog&limit=${fetchLimit}&fields=${fields}`,
  ]

  for (const path of attempts) {
    try {
      const data = (await olFetch(path)) as OLSearchResponse
      const books = (data.docs ?? [])
        .map(mapSearchDoc)
        .filter(b => b.coverId && b.title)
        .slice(0, limit)

      if (books.length > 0) return { books, fallback: false }
    } catch {
      // try next query
    }
  }

  return { books: FALLBACK_TRENDING.slice(0, limit), fallback: true }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? 'search'

  try {
    if (action === 'search' || action === 'suggest') {
      const q = (searchParams.get('q') ?? '').trim()
      if (!q) return NextResponse.json({ books: [], total: 0 })

      const limit = action === 'suggest' ? '8' : (searchParams.get('limit') ?? '18')
      const fields = [
        'key', 'title', 'author_name', 'author_key', 'first_publish_year',
        'cover_i', 'edition_count', 'language', 'subject', 'isbn', 'publisher',
        'number_of_pages_median', 'ratings_average', 'ratings_count',
        'want_to_read_count', 'already_read_count', 'currently_reading_count',
        'ebook_access', 'has_fulltext',
      ].join(',')

      try {
        const data = (await olFetch(
          `/search.json?q=${encodeURIComponent(q)}&limit=${limit}&fields=${fields}`,
        )) as OLSearchResponse

        return NextResponse.json({
          books: (data.docs ?? []).map(mapSearchDoc),
          total: data.numFound ?? 0,
          q,
        })
      } catch {
        return NextResponse.json({ books: [], total: 0, q, offline: true })
      }
    }

    if (action === 'trending') {
      const limit = Math.min(Number(searchParams.get('limit') ?? '15') || 15, 30)
      const { books, fallback } = await fetchTrendingBooks(limit)
      return NextResponse.json({ books, fallback })
    }

    if (action === 'work') {
      const id = (searchParams.get('id') ?? '').replace('/works/', '')
      if (!id) return NextResponse.json({ error: 'Work id required' }, { status: 400 })

      const work = (await olFetch(`/works/${id}.json`)) as OLWork
      const authorKey = work.authors?.[0]?.author?.key?.replace('/authors/', '')

      const [searchData, author] = await Promise.all([
        olFetch(
          `/search.json?q=key:/works/${id}&limit=1&fields=key,title,author_name,author_key,first_publish_year,cover_i,edition_count,language,subject,isbn,publisher,number_of_pages_median,ratings_average,ratings_count,want_to_read_count,already_read_count,currently_reading_count,ebook_access`,
        ) as Promise<OLSearchResponse>,
        authorKey
          ? (olFetch(`/authors/${authorKey}.json`) as Promise<OLAuthor>).catch(() => null)
          : Promise.resolve(null),
      ])

      const searchDoc: OLSearchDoc | null = searchData.docs?.[0] ?? null
      const book = mapWorkDetail(work, searchDoc, author)

      if (author?.name && book.authors.length === 0) {
        book.authors = [author.name]
      }

      let similar: ReturnType<typeof mapSearchDoc>[] = []
      const subject = book.subjects?.[0]
      if (subject) {
        try {
          const sim = (await olFetch(
            `/search.json?q=subject:${encodeURIComponent(subject)}&limit=10&fields=key,title,author_name,author_key,first_publish_year,cover_i,edition_count,ratings_average,ratings_count,want_to_read_count,already_read_count,currently_reading_count,number_of_pages_median`,
          )) as OLSearchResponse
          similar = (sim.docs ?? [])
            .map(mapSearchDoc)
            .filter(b => b.workKey !== book.workKey)
            .slice(0, 8)
        } catch {
          similar = []
        }
      }

      return NextResponse.json({ book, similar, author })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    if ((searchParams.get('action') ?? 'search') === 'trending') {
      const limit = Math.min(Number(searchParams.get('limit') ?? '15') || 15, 30)
      return NextResponse.json({
        books: FALLBACK_TRENDING.slice(0, limit),
        fallback: true,
      })
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Open Library request failed' },
      { status: 502 },
    )
  }
}
