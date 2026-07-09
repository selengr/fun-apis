import type { NotionNote } from '@/types/notion'

const NOTION_VERSION = '2022-06-28'

function getHeaders() {
  const key = process.env.NOTION_API_KEY
  if (!key) throw new Error('Notion API key not configured')
  return {
    Authorization: `Bearer ${key}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

function notionPageUrl(id: string) {
  return `https://www.notion.so/${id.replace(/-/g, '')}`
}

function getParent() {
  const databaseId = process.env.NOTION_DATABASE_ID
  const pageId = process.env.NOTION_PARENT_PAGE_ID
  if (databaseId) return { type: 'database' as const, id: databaseId }
  if (pageId) return { type: 'page' as const, id: pageId }
  throw new Error('Set NOTION_DATABASE_ID or NOTION_PARENT_PAGE_ID in .env.local')
}

function bodyToBlocks(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [] },
      },
    ]
  }

  return paragraphs.map(text => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }],
    },
  }))
}

function extractTitle(properties: Record<string, unknown>): string {
  for (const val of Object.values(properties)) {
    const prop = val as { type?: string; title?: { plain_text?: string }[] }
    if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text
    }
  }
  return 'Untitled'
}

export function getNotionConfigStatus() {
  const hasKey = Boolean(process.env.NOTION_API_KEY)
  const hasDb = Boolean(process.env.NOTION_DATABASE_ID)
  const hasPage = Boolean(process.env.NOTION_PARENT_PAGE_ID)
  return {
    configured: hasKey && (hasDb || hasPage),
    mode: hasDb ? ('database' as const) : hasPage ? ('page' as const) : null,
  }
}

export async function createNotionNote(title: string, body: string) {
  const parent = getParent()
  const safeTitle = title.trim() || 'Untitled'
  const headers = getHeaders()

  const payload: Record<string, unknown> = {
    parent:
      parent.type === 'database'
        ? { database_id: parent.id }
        : { page_id: parent.id },
    children: bodyToBlocks(body),
  }

  if (parent.type === 'database') {
    const titleProp = process.env.NOTION_TITLE_PROPERTY || 'Name'
    payload.properties = {
      [titleProp]: {
        title: [{ text: { content: safeTitle.slice(0, 2000) } }],
      },
    }
  } else {
    payload.properties = {
      title: {
        title: [{ text: { content: safeTitle.slice(0, 2000) } }],
      },
    }
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message ?? 'Failed to create Notion page')
  }

  return {
    id: json.id as string,
    url: (json.url as string) ?? notionPageUrl(json.id),
    title: safeTitle,
  }
}

export async function listNotionNotes(limit = 12): Promise<NotionNote[]> {
  const parent = getParent()
  const headers = getHeaders()

  if (parent.type === 'page') {
    const res = await fetch(
      `https://api.notion.com/v1/blocks/${parent.id}/children?page_size=${limit}`,
      { headers, cache: 'no-store' },
    )
    const json = await res.json()
    if (!res.ok) throw new Error(json.message ?? 'Failed to list pages')

    return (json.results ?? [])
      .filter((b: { type: string }) => b.type === 'child_page')
      .map((b: { id: string; child_page?: { title?: string }; created_time?: string }) => ({
        id: b.id,
        title: b.child_page?.title ?? 'Untitled',
        url: notionPageUrl(b.id),
        createdAt: b.created_time ?? new Date().toISOString(),
      }))
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${parent.id}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      page_size: limit,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
    cache: 'no-store',
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Failed to query database')

  return (json.results ?? []).map(
    (page: { id: string; properties: Record<string, unknown>; created_time?: string; url?: string }) => ({
      id: page.id,
      title: extractTitle(page.properties),
      url: page.url ?? notionPageUrl(page.id),
      createdAt: page.created_time ?? new Date().toISOString(),
    }),
  )
}
