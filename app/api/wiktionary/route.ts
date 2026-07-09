import { NextRequest, NextResponse } from 'next/server'
import { lookupWord, suggestWords } from '@/lib/wiktionary'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const endpoint = searchParams.get('endpoint')

  try {
    if (endpoint === 'suggest') {
      const q = searchParams.get('q') ?? ''
      const suggestions = await suggestWords(q)
      return NextResponse.json({ suggestions })
    }

    const word = searchParams.get('word') ?? searchParams.get('q') ?? ''
    if (!word.trim()) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const entry = await lookupWord(word)
    return NextResponse.json(entry)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Wiktionary lookup failed'
    const status = message.includes('No Wiktionary entry') ? 404 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
