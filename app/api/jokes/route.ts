import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://v2.jokeapi.dev'
const UA = 'fun-apis/1.0 (https://github.com)'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const endpoint = searchParams.get('endpoint') ?? 'joke'

  let url: URL

  if (endpoint === 'info') {
    url = new URL(`${BASE}/info`)
  } else if (endpoint === 'categories') {
    url = new URL(`${BASE}/categories`)
  } else {
    const category = searchParams.get('category') ?? 'Any'
    url = new URL(`${BASE}/joke/${encodeURIComponent(category)}`)
  }

  searchParams.forEach((value, key) => {
    if (key === 'endpoint' || key === 'category') return
    url.searchParams.set(key, value)
  })

  if (!url.searchParams.has('safe-mode')) {
    url.searchParams.set('safe-mode', '')
  }
  if (!url.searchParams.has('blacklistFlags')) {
    url.searchParams.set('blacklistFlags', 'nsfw,religious,political,racist,sexist,explicit')
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      cache: 'no-store',
    })

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status })
    }

    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: true, message: 'Failed to fetch jokes' }, { status: 502 })
  }
}
