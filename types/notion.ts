export interface NotionNote {
  id: string
  title: string
  url: string
  createdAt: string
  preview?: string
}

export interface NotionCreateResponse {
  id: string
  url: string
  title: string
}

export interface NotionConfigStatus {
  configured: boolean
  mode: 'database' | 'page' | null
}
