/** Shared Notion API helpers — version 2026-03-11 (data sources + markdown). */

export const NOTION_VERSION = '2026-03-11'

export function notionApiKey() {
  return process.env.NOTION_API_KEY?.trim() || null
}

export function notionHeaders() {
  const key = notionApiKey()
  if (!key) throw new Error('NOTION_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

export function notionPageUrl(id: string) {
  return `https://www.notion.so/${id.replace(/-/g, '')}`
}

/**
 * Resolve a database container ID → first data source ID.
 * Required for create/query under Notion-Version ≥ 2025-09-03.
 */
export async function resolveDataSourceId(databaseId: string): Promise<string> {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers: notionHeaders(),
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message ?? `Failed to retrieve database (${res.status})`)
  }

  const sources = json.data_sources as { id?: string; name?: string }[] | undefined
  const id = sources?.[0]?.id
  if (!id) {
    // Fallback: some responses still treat the database id as the collection
    throw new Error(
      'No data_sources on this database. Open it in Notion and confirm it is a full-page database.',
    )
  }
  return id
}

export async function retrieveNotionPage(pageId: string) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: notionHeaders(),
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message ?? `Failed to retrieve page (${res.status})`)
  }
  return json
}
