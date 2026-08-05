import type { NotionNote } from '@/types/notion'
import {
  notionHeaders,
  notionPageUrl,
  notionApiKey,
  resolveDataSourceId,
  retrieveNotionPage,
} from '@/lib/notion-client'

export { retrieveNotionPage }

function getParent() {
  const databaseId = process.env.NOTION_DATABASE_ID
  const pageId = process.env.NOTION_PARENT_PAGE_ID
  if (databaseId) return { type: 'database' as const, id: databaseId }
  if (pageId) return { type: 'page' as const, id: pageId }
  throw new Error('Set NOTION_DATABASE_ID or NOTION_PARENT_PAGE_ID in .env.local')
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
  const hasKey = Boolean(notionApiKey())
  const hasDb = Boolean(process.env.NOTION_DATABASE_ID)
  const hasPage = Boolean(process.env.NOTION_PARENT_PAGE_ID)
  return {
    configured: hasKey && (hasDb || hasPage),
    mode: hasDb ? ('database' as const) : hasPage ? ('page' as const) : null,
  }
}

/**
 * Create a note page under a data source (database) or parent page.
 * Uses markdown body (2026 API) instead of manual children blocks.
 */
export async function createNotionNote(title: string, body: string) {
  const parent = getParent()
  const safeTitle = title.trim() || 'Untitled'
  const headers = notionHeaders()

  const markdown = `# ${safeTitle}\n\n${body.trim()}`

  let parentPayload: Record<string, unknown>
  let properties: Record<string, unknown>

  if (parent.type === 'database') {
    const dataSourceId = await resolveDataSourceId(parent.id)
    parentPayload = {
      type: 'data_source_id',
      data_source_id: dataSourceId,
    }
    const titleProp = process.env.NOTION_TITLE_PROPERTY || 'Name'
    properties = {
      [titleProp]: {
        title: [{ type: 'text', text: { content: safeTitle.slice(0, 2000) } }],
      },
    }
  } else {
    parentPayload = {
      type: 'page_id',
      page_id: parent.id,
    }
    properties = {
      title: {
        title: [{ type: 'text', text: { content: safeTitle.slice(0, 2000) } }],
      },
    }
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: parentPayload,
      properties,
      markdown,
    }),
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
  const headers = notionHeaders()

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

  const dataSourceId = await resolveDataSourceId(parent.id)
  const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      page_size: limit,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
    cache: 'no-store',
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Failed to query data source')

  return (json.results ?? []).map(
    (page: {
      id: string
      properties: Record<string, unknown>
      created_time?: string
      url?: string
    }) => ({
      id: page.id,
      title: extractTitle(page.properties),
      url: page.url ?? notionPageUrl(page.id),
      createdAt: page.created_time ?? new Date().toISOString(),
    }),
  )
}
