export interface CloudConvertFile {
  filename: string
  url: string
  size?: number
}

export interface CloudConvertTask {
  id: string
  name: string
  operation: string
  status: string
  message?: string
  code?: string
  result?: {
    files?: CloudConvertFile[]
    form?: {
      url: string
      parameters: Record<string, string>
    }
  }
}

export interface CloudConvertJob {
  id: string
  status: 'waiting' | 'processing' | 'finished' | 'error'
  tasks: CloudConvertTask[]
}

export type FormatCategory = 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'spreadsheet'

export const FORMAT_CATEGORIES: {
  key: FormatCategory
  label: string
  emoji: string
  formats: { value: string; label: string }[]
}[] = [
  {
    key: 'pdf',
    label: 'PDF',
    emoji: '📄',
    formats: [
      { value: 'pdf', label: 'PDF' },
      { value: 'png', label: 'PNG' },
      { value: 'jpg', label: 'JPG' },
      { value: 'docx', label: 'DOCX' },
      { value: 'txt', label: 'TXT' },
    ],
  },
  {
    key: 'image',
    label: 'Image',
    emoji: '🖼️',
    formats: [
      { value: 'png', label: 'PNG' },
      { value: 'jpg', label: 'JPG' },
      { value: 'webp', label: 'WebP' },
      { value: 'gif', label: 'GIF' },
      { value: 'svg', label: 'SVG' },
      { value: 'pdf', label: 'PDF' },
      { value: 'ico', label: 'ICO' },
    ],
  },
  {
    key: 'video',
    label: 'Video',
    emoji: '🎬',
    formats: [
      { value: 'mp4', label: 'MP4' },
      { value: 'webm', label: 'WebM' },
      { value: 'avi', label: 'AVI' },
      { value: 'mov', label: 'MOV' },
      { value: 'mkv', label: 'MKV' },
      { value: 'gif', label: 'GIF' },
    ],
  },
  {
    key: 'audio',
    label: 'Audio',
    emoji: '🎵',
    formats: [
      { value: 'mp3', label: 'MP3' },
      { value: 'wav', label: 'WAV' },
      { value: 'ogg', label: 'OGG' },
      { value: 'aac', label: 'AAC' },
      { value: 'flac', label: 'FLAC' },
      { value: 'm4a', label: 'M4A' },
    ],
  },
  {
    key: 'document',
    label: 'Document',
    emoji: '📝',
    formats: [
      { value: 'pdf', label: 'PDF' },
      { value: 'docx', label: 'DOCX' },
      { value: 'doc', label: 'DOC' },
      { value: 'txt', label: 'TXT' },
      { value: 'html', label: 'HTML' },
      { value: 'odt', label: 'ODT' },
      { value: 'rtf', label: 'RTF' },
    ],
  },
  {
    key: 'spreadsheet',
    label: 'Spreadsheet',
    emoji: '📊',
    formats: [
      { value: 'xlsx', label: 'XLSX' },
      { value: 'xls', label: 'XLS' },
      { value: 'csv', label: 'CSV' },
      { value: 'ods', label: 'ODS' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
]

export function getExtension(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export function swapExtension(name: string, newExt: string) {
  const base = name.replace(/\.[^/.]+$/, '')
  return `${base}.${newExt}`
}
