import { NextRequest, NextResponse } from 'next/server'

const DICT_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en'
const UA = 'fun-apis/1.0 (dictionary; contact: github.com)'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const endpoint = searchParams.get('endpoint')

  try {
    if (endpoint === 'suggest') {
      const q = searchParams.get('q') ?? ''
      if (!q.trim() || q.length < 2) {
        return NextResponse.json({ suggestions: [] })
      }
      const res = await fetch(
        `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`,
        { headers: { 'User-Agent': UA }, cache: 'no-store' },
      )
      const json = await res.json()
      return NextResponse.json({ suggestions: json })
    }

    const word = searchParams.get('word') ?? ''
    if (!word.trim()) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const res = await fetch(`${DICT_BASE}/${encodeURIComponent(word.trim())}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      cache: 'no-store',
    })

    const json = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: json.title ?? `No definition found for "${word}"` },
        { status: res.status === 404 ? 404 : 502 },
      )
    }

    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'Dictionary lookup failed' }, { status: 502 })
  }
}
