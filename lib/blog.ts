import type { BlogConfigStatus, BlogPost, BlogPostMeta, BlogPostStatus } from '@/types/blog'
import {
  NOTION_VERSION,
  notionApiKey,
  notionHeaders,
  notionPageUrl,
  resolveDataSourceId,
} from '@/lib/notion-client'

export const NOTION_BLOG_VERSION = NOTION_VERSION

function getDatabaseId() {
  return process.env.NOTION_BLOG_DATABASE_ID?.trim() || null
}

export function blogHeaders() {
  return notionHeaders()
}

let cachedBlogDataSourceId: string | null = null

async function blogDataSourceId() {
  const databaseId = getDatabaseId()
  if (!databaseId) throw new Error('NOTION_BLOG_DATABASE_ID is not set')
  if (!cachedBlogDataSourceId) {
    cachedBlogDataSourceId = await resolveDataSourceId(databaseId)
  }
  return cachedBlogDataSourceId
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
    slug =
      title
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

export async function getBlogConfigStatus(): Promise<BlogConfigStatus> {
  const hasApiKey = Boolean(notionApiKey())
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
      headers: notionHeaders(),
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

    const userName = json.bot?.owner?.user?.name ?? json.name ?? 'Notion user'
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

async function queryDataSource(body: Record<string, unknown>) {
  const dataSourceId = await blogDataSourceId()
  const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify(body),
    next: { revalidate: 60 },
  })
  const json = await res.json()
  return { res, json }
}

export async function listPublishedPosts(limit = 24): Promise<BlogPostMeta[]> {
  if (!getDatabaseId()) throw new Error('NOTION_BLOG_DATABASE_ID is not set')

  const { res, json } = await queryDataSource({
    page_size: Math.min(limit, 100),
    sorts: [{ property: 'Date', direction: 'descending' }],
    filter: {
      or: [
        { property: 'Status', status: { equals: 'Published' } },
        { property: 'Status', select: { equals: 'Published' } },
        { property: 'Published', checkbox: { equals: true } },
      ],
    },
  })

  if (!res.ok) {
    const retry = await queryDataSource({
      page_size: Math.min(limit, 100),
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    })
    if (!retry.res.ok) {
      throw new Error(retry.json.message ?? json.message ?? 'Failed to query blog data source')
    }
    return (retry.json.results ?? [])
      .map(mapNotionPageToMeta)
      .filter((p: BlogPostMeta) => p.status === 'Published')
  }

  return (json.results ?? []).map(mapNotionPageToMeta)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!getDatabaseId()) throw new Error('NOTION_BLOG_DATABASE_ID is not set')

  const { res, json } = await queryDataSource({
    page_size: 1,
    filter: {
      property: 'Slug',
      rich_text: { equals: slug },
    },
  })

  if (!res.ok || !json.results?.length) {
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
    headers: notionHeaders(),
    next: { revalidate: 60 },
  })
  const json = await res.json()
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) return ''
    throw new Error(json.message ?? `Failed to load markdown (${res.status})`)
  }
  return typeof json.markdown === 'string' ? json.markdown : ''
}

/** Create a blog post row under the Blog data source (markdown body). */
export async function createBlogPost(input: {
  title: string
  slug: string
  markdown: string
  status?: BlogPostStatus
  excerpt?: string
  tags?: string[]
  date?: string
}) {
  const dataSourceId = await blogDataSourceId()
  const title = input.title.trim() || 'Untitled'
  const slug = input.slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const status = input.status ?? 'Draft'

  const properties: Record<string, unknown> = {
    Title: {
      title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
    },
    Slug: {
      rich_text: [{ type: 'text', text: { content: slug.slice(0, 200) } }],
    },
    Status: {
      status: { name: status },
    },
  }

  if (input.excerpt) {
    properties.Excerpt = {
      rich_text: [{ type: 'text', text: { content: input.excerpt.slice(0, 2000) } }],
    }
  }
  if (input.tags?.length) {
    properties.Tags = {
      multi_select: input.tags.map(name => ({ name })),
    }
  }
  if (input.date) {
    properties.Date = {
      date: { start: input.date },
    }
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: dataSourceId },
      properties,
      markdown: input.markdown.includes(title)
        ? input.markdown
        : `# ${title}\n\n${input.markdown}`,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    // Retry Status as select if status property type differs
    if (String(json.message ?? '').toLowerCase().includes('status')) {
      properties.Status = { select: { name: status } }
      const retry = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          parent: { type: 'data_source_id', data_source_id: dataSourceId },
          properties,
          markdown: input.markdown,
        }),
      })
      const retryJson = await retry.json()
      if (!retry.ok) throw new Error(retryJson.message ?? json.message ?? 'Failed to create post')
      return mapNotionPageToMeta(retryJson)
    }
    throw new Error(json.message ?? 'Failed to create post')
  }

  return mapNotionPageToMeta(json)
}
