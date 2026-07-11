import { NextRequest, NextResponse } from 'next/server'
import {
  OL_API,
  OL_UA,
  mapSearchDoc,
  mapWorkDetail,
} from '@/lib/openlibrary'
import { coverIsAvailable } from '@/lib/covers'
import type { OLAuthor, OLSearchDoc, OLSearchResponse, OLWork } from '@/types/openlibrary'

export const dynamic = 'force-dynamic'

async function olFetch(path: string) {
  const res = await fetch(`${OL_API}${path}`, {
    headers: {
      'User-Agent': OL_UA,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Open Library error ${res.status}`)
  }
  return res.json()
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

      const data = (await olFetch(
        `/search.json?q=${encodeURIComponent(q)}&limit=${limit}&fields=${fields}`,
      )) as OLSearchResponse

      return NextResponse.json({
        books: (data.docs ?? []).map(mapSearchDoc),
        total: data.numFound ?? 0,
        q,
      })
    }

    if (action === 'trending') {
      const limit = Math.min(Number(searchParams.get('limit') ?? '15') || 15, 30)
      const fetchLimit = Math.min(limit * 5, 80)
      const data = (await olFetch(
        `/search.json?q=subject:fiction&sort=readinglog&limit=${fetchLimit}&fields=key,title,author_name,author_key,first_publish_year,cover_i,edition_count,language,subject,number_of_pages_median,ratings_average,ratings_count,want_to_read_count,already_read_count,currently_reading_count,isbn`,
      )) as OLSearchResponse

      const candidates = (data.docs ?? [])
        .map(mapSearchDoc)
        .filter(b => b.coverId)

      const verified: ReturnType<typeof mapSearchDoc>[] = []

      for (let i = 0; i < candidates.length && verified.length < limit; i += 8) {
        const batch = candidates.slice(i, i + 8)
        const checks = await Promise.all(
          batch.map(async b => ({
            b,
            ok: await coverIsAvailable(b.coverId, b.isbn?.[0]),
          })),
        )
        for (const { b, ok } of checks) {
          if (ok && verified.length < limit) verified.push(b)
        }
      }

      return NextResponse.json({ books: verified })
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
        const sim = (await olFetch(
          `/search.json?q=subject:${encodeURIComponent(subject)}&limit=10&fields=key,title,author_name,author_key,first_publish_year,cover_i,edition_count,ratings_average,ratings_count,want_to_read_count,already_read_count,currently_reading_count,number_of_pages_median`,
        )) as OLSearchResponse
        similar = (sim.docs ?? [])
          .map(mapSearchDoc)
          .filter(b => b.workKey !== book.workKey)
          .slice(0, 8)
      }

      return NextResponse.json({ book, similar, author })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Open Library request failed' },
      { status: 502 },
    )
  }
}
