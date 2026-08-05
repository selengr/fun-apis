export type BlogPostStatus = 'Draft' | 'Published'

export interface BlogPostMeta {
  id: string
  title: string
  slug: string
  status: BlogPostStatus
  date: string | null
  tags: string[]
  summary: string | null
  introduction: string | null
  conclusion: string | null
  authorName: string
  authorImage: string | null
  bannerImage: string | null
  views: number
  readingMinutes: number | null
  featured: boolean
  coverUrl: string | null
  url: string
  lastEdited: string
}

export interface BlogPost extends BlogPostMeta {
  markdown: string
}

export interface BlogConfigStatus {
  hasApiKey: boolean
  hasDatabaseId: boolean
  ready: boolean
  userName: string | null
  workspaceName: string | null
  step: 1 | 2 | 3
  message: string
  databaseId?: string | null
  dataSourceId?: string | null
}
