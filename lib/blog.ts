import type { BlogConfigStatus, BlogPost, BlogPostMeta, BlogPostStatus } from '@/types/blog'

/** Current Notion API version (markdown endpoints + PAT). */
export const NOTION_BLOG_VERSION = '2026-03-11'

function getApiKey() {
  return process.env.NOTION_API_KEY?.trim() || null
}

function getDatabaseId() {
  return process.env.NOTION_BLOG_DATABASE_ID?.trim() || null
}

export function blogHeaders() {
  const key = getApiKey()
  if (!key) throw new Error('NOTION_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Notion-Version': NOTION_BLOG_VERSION,
    'Content-Type': 'application/json',
  }
}

function notionPageUrl(id: string) {
  return `https://www.notion.so/${id.replace(/-/g, '')}`
}

function plain(rich?: { plain_text?: string }[] | null) {
  if (!Array.isArray(rich)) return ''
  return rich.map(t => t.plain_text ?? '').join('')
}

function prop(
  properties: Record<string, unknown>,
  names: string[],
): Record<string, unknown> | null {
  for (const name of names) {
    if (properties[name]) return properties[name] as Record<string, unknown>
  }
  // case-insensitive fallback
  const entries = Object.entries(properties)
  for (const name of names) {
    const hit = entries.find(([k]) => k.toLowerCase() === name.toLowerCase())
    if (hit) return hit[1] as Record<string, unknown>
  }
  return null
}

function parseStatus(raw: Record<string, unknown> | null): BlogPostStatus {
  if (!raw) return 'Draft'
  if (raw.type === 'status' && raw.status && typeof raw.status === 'object') {
    const name = (raw.status as { name?: string }).name
    if (name?.toLowerCase() === 'published') return 'Published'
  }
  if (raw.type === 'select' && raw.select && typeof raw.select === 'object') {
    const name = (raw.select as { name?: string }).name
    if (name?.toLowerCase() === 'published') return 'Published'
  }
  if (raw.type === 'checkbox' && raw.checkbox === true) return 'Published'
  return 'Draft'
}

function parseTags(raw: Record<string, unknown> | null): string[] {
  if (!raw || raw.type !== 'multi_select') return []
  const list = raw.multi_select as { name?: string }[] | undefined
  return (list ?? []).map(t => t.name ?? '').filter(Boolean)
}

function parseCover(page: {
  cover?: { type?: string; external?: { url?: string }; file?: { url?: string } } | null
}): string | null {
  const c = page.cover
  if (!c) return null
  if (c.type === 'external') return c.external?.url ?? null
  if (c.type === 'file') return c.file?.url ?? null
  return null
}

export function mapNotionPageToMeta(page: {
  id: string
  url?: string
  last_edited_time?: string
  cover?: { type?: string; external?: { url?: string }; file?: { url?: string } } | null
  properties: Record<string, unknown>
}): BlogPostMeta {
  const titleProp = prop(page.properties, ['Title', 'Name', 'title'])
  const slugProp = prop(page.properties, ['Slug', 'slug'])
  const statusProp = prop(page.properties, ['Status', 'Published', 'status'])
  const dateProp = prop(page.properties, ['Date', 'Published At', 'date'])
  const tagsProp = prop(page.properties, ['Tags', 'tags'])
  const excerptProp = prop(page.properties, ['Excerpt', 'Summary', 'excerpt'])

  const title =
    titleProp?.type === 'title' ? plain(titleProp.title as { plain_text?: string }[]) : 'Untitled'

  let slug =
    slugProp?.type === 'rich_text'
      ? plain(slugProp.rich_text as { plain_text?: string }[])
      : slugProp?.type === 'formula' &&
          slugProp.formula &&
          typeof slugProp.formula === 'object' &&
          (slugProp.formula as { type?: string; string?: string }).type === 'string'
        ? ((slugProp.formula as { string?: string }).string ?? '')
        : ''

  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || page.id.replace(/-/g, '').slice(0, 12)
  }

  const date =
    dateProp?.type === 'date' && dateProp.date && typeof dateProp.date === 'object'
      ? ((dateProp.date as { start?: string }).start ?? null)
      : null

  const excerpt =
    excerptProp?.type === 'rich_text'
      ? plain(excerptProp.rich_text as { plain_text?: string }[]) || null
      : null

  return {
    id: page.id,
    title,
    slug,
    status: parseStatus(statusProp),
    date,
    tags: parseTags(tagsProp),
    excerpt,
    coverUrl: parseCover(page),
    url: page.url ?? notionPageUrl(page.id),
    lastEdited: page.last_edited_time ?? new Date().toISOString(),
  }
}

/** Step 1 health check — PAT works? Database id set? */
export async function getBlogConfigStatus(): Promise<BlogConfigStatus> {
  const hasApiKey = Boolean(getApiKey())
  const hasDatabaseId = Boolean(getDatabaseId())

  if (!hasApiKey) {
    return {
      hasApiKey: false,
      hasDatabaseId: false,
      ready: false,
      userName: null,
      workspaceName: null,
      step: 1,
      message: 'Add NOTION_API_KEY to .env.local',
    }
  }

  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: blogHeaders(),
      cache: 'no-store',
    })
    const json = await res.json()
    if (!res.ok) {
      return {
        hasApiKey: true,
        hasDatabaseId,
        ready: false,
        userName: null,
        workspaceName: null,
        step: 1,
        message: json.message ?? `Notion auth failed (${res.status})`,
      }
    }

    const userName =
      json.bot?.owner?.user?.name ?? json.name ?? 'Notion user'
    const workspaceName = json.bot?.workspace_name ?? null

    if (!hasDatabaseId) {
      return {
        hasApiKey: true,
        hasDatabaseId: false,
        ready: false,
        userName,
        workspaceName,
        step: 2,
        message: 'Create a Blog database in Notion, then set NOTION_BLOG_DATABASE_ID',
      }
    }

    return {
      hasApiKey: true,
      hasDatabaseId: true,
      ready: true,
      userName,
      workspaceName,
      step: 3,
      message: 'Ready to query posts',
    }
  } catch (err) {
    return {
      hasApiKey: true,
      hasDatabaseId,
      ready: false,
      userName: null,
      workspaceName: null,
      step: 1,
      message: err instanceof Error ? err.message : 'Failed to reach Notion',
    }
  }
}

export async function listPublishedPosts(limit = 24): Promise<BlogPostMeta[]> {
  const databaseId = getDatabaseId()
  if (!databaseId) throw new Error('NOTION_BLOG_DATABASE_ID is not set')

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: blogHeaders(),
    body: JSON.stringify({
      page_size: Math.min(limit, 100),
      sorts: [{ property: 'Date', direction: 'descending' }],
      // Prefer Status = Published when the property exists; Notion errors if missing —
      // caller can fall back without filter.
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Published' } },
          { property: 'Status', select: { equals: 'Published' } },
          { property: 'Published', checkbox: { equals: true } },
        ],
      },
    }),
    next: { revalidate: 60 },
  })

  const json = await res.json()

  // If filter fails (property type mismatch), retry unfiltered and filter client-side
  if (!res.ok) {
    const retry = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: blogHeaders(),
      body: JSON.stringify({
        page_size: Math.min(limit, 100),
        sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
      }),
      next: { revalidate: 60 },
    })
    const retryJson = await retry.json()
    if (!retry.ok) {
      throw new Error(retryJson.message ?? json.message ?? 'Failed to query blog database')
    }
    return (retryJson.results ?? [])
      .map(mapNotionPageToMeta)
      .filter((p: BlogPostMeta) => p.status === 'Published')
  }

  return (json.results ?? []).map(mapNotionPageToMeta)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const databaseId = getDatabaseId()
  if (!databaseId) throw new Error('NOTION_BLOG_DATABASE_ID is not set')

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: blogHeaders(),
    body: JSON.stringify({
      page_size: 1,
      filter: {
        property: 'Slug',
        rich_text: { equals: slug },
      },
    }),
    next: { revalidate: 60 },
  })

  let json = await res.json()

  if (!res.ok || !json.results?.length) {
    // Fallback: fetch recent and match slug client-side
    const all = await listPublishedPosts(50)
    const meta = all.find(p => p.slug === slug)
    if (!meta) return null
    const markdown = await getPageMarkdown(meta.id)
    return { ...meta, markdown }
  }

  const page = json.results[0]
  const meta = mapNotionPageToMeta(page)
  const markdown = await getPageMarkdown(meta.id)
  return { ...meta, markdown }
}

export async function getPageMarkdown(pageId: string): Promise<string> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}/markdown`, {
    headers: blogHeaders(),
    next: { revalidate: 60 },
  })
  const json = await res.json()
  if (!res.ok) {
    // Older fallbacks: empty body rather than hard fail listing
    if (res.status === 404 || res.status === 400) return ''
    throw new Error(json.message ?? `Failed to load markdown (${res.status})`)
  }
  return typeof json.markdown === 'string' ? json.markdown : ''
}
