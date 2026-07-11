import { NextRequest, NextResponse } from 'next/server'
import { fetchCoverImage } from '@/lib/covers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  const isbn = searchParams.get('isbn')
  const size = (searchParams.get('size') ?? 'M').toUpperCase() as 'S' | 'M' | 'L'

  if (!id && !isbn) {
    return NextResponse.json({ error: 'id or isbn required' }, { status: 400 })
  }

  const result = await fetchCoverImage({
    id: id ? Number(id) : undefined,
    isbn: isbn ?? undefined,
    size: ['S', 'M', 'L'].includes(size) ? size : 'M',
  })

  if (!result) {
    return new NextResponse(null, { status: 404 })
  }

  return new NextResponse(result.body, {
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  })
}
