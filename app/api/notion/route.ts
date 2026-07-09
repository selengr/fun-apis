import { NextRequest, NextResponse } from 'next/server'
import { createNotionNote, getNotionConfigStatus, listNotionNotes } from '@/lib/notion'

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getNotionConfigStatus()
  if (!status.configured) {
    return NextResponse.json({ configured: false, notes: [] })
  }

  try {
    const notes = await listNotionNotes()
    return NextResponse.json({ ...status, notes })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load notes'
    return NextResponse.json({ ...status, notes: [], error: message })
  }
}

export async function POST(request: NextRequest) {
  const status = getNotionConfigStatus()
  if (!status.configured) {
    return NextResponse.json(
      { error: 'Notion is not configured. Add NOTION_API_KEY and NOTION_DATABASE_ID to .env.local' },
      { status: 503 },
    )
  }

  try {
    const { title, body } = await request.json()
    if (typeof body !== 'string') {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 })
    }

    const page = await createNotionNote(typeof title === 'string' ? title : '', body)
    return NextResponse.json(page)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create note'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
