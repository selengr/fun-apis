import { NextResponse } from 'next/server'
import { incrementPostViews } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pageId = typeof body.pageId === 'string' ? body.pageId : ''
    const current = typeof body.current === 'number' ? body.current : 0
    if (!pageId) {
      return NextResponse.json({ error: 'pageId required' }, { status: 400 })
    }
    const views = await incrementPostViews(pageId, current)
    return NextResponse.json({ views })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update views' },
      { status: 502 },
    )
  }
}
