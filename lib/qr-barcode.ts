export type ContentType = 'text' | 'url' | 'email' | 'phone' | 'custom'

export type ExportFormat = 'svg' | 'png'
export type CodeKind = 'qr' | 'barcode'
export type PreviewTab = 'both' | 'qr' | 'barcode'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s().-]{7,20}$/

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function buildPayload(type: ContentType, raw: string): string {
  const value = raw.trim()
  switch (type) {
    case 'url':
      return normalizeUrl(value)
    case 'email':
      return value.includes('@') ? `mailto:${value}` : value
    case 'phone':
      return `tel:${value.replace(/\s/g, '')}`
    case 'text':
    case 'custom':
    default:
      return value
  }
}

export function validateInput(type: ContentType, raw: string): string | null {
  const value = raw.trim()
  if (!value) return 'Please enter some content to encode.'

  switch (type) {
    case 'url': {
      try {
        const url = new URL(normalizeUrl(value))
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must use http or https.'
        }
      } catch {
        return 'Enter a valid URL (e.g. example.com or https://example.com).'
      }
      break
    }
    case 'email':
      if (!EMAIL_RE.test(value)) return 'Enter a valid email address.'
      break
    case 'phone':
      if (!PHONE_RE.test(value)) return 'Enter a valid phone number.'
      break
    case 'text':
    case 'custom':
      if (value.length > 2000) return 'Text is too long (max 2,000 characters).'
      break
  }

  if (value.length > 800) {
    return 'Content may be too long for a reliable barcode. QR code is recommended.'
  }

  return null
}

export function placeholderFor(type: ContentType): string {
  switch (type) {
    case 'url':
      return 'https://yoursite.com or example.com'
    case 'email':
      return 'hello@company.com'
    case 'phone':
      return '+1 (555) 123-4567'
    case 'custom':
      return 'Any custom string, JSON, or identifier…'
    default:
      return 'Enter plain text to encode'
  }
}

export function labelFor(type: ContentType): string {
  switch (type) {
    case 'url':
      return 'Website URL'
    case 'email':
      return 'Email address'
    case 'phone':
      return 'Phone number'
    case 'custom':
      return 'Custom content'
    default:
      return 'Text'
  }
}

export async function generateQrSvg(payload: string): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toString(payload, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1c1917', light: '#ffffff00' },
  })
}

export async function generateQrPng(payload: string, width = 640): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(payload, {
    margin: 2,
    width,
    errorCorrectionLevel: 'M',
    color: { dark: '#1c1917', light: '#ffffff' },
  })
}

async function loadJsBarcode() {
  const mod = await import('jsbarcode')
  return mod.default
}

export async function generateBarcodeSvg(payload: string): Promise<string> {
  const JsBarcode = await loadJsBarcode()
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  JsBarcode(svg, payload, {
    format: 'CODE128',
    displayValue: true,
    font: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: 14,
    textMargin: 6,
    margin: 12,
    lineColor: '#1c1917',
    background: 'transparent',
    width: 2,
    height: 72,
  })
  return new XMLSerializer().serializeToString(svg)
}

export async function generateBarcodePng(payload: string): Promise<string> {
  const JsBarcode = await loadJsBarcode()
  const canvas = document.createElement('canvas')
  JsBarcode(canvas, payload, {
    format: 'CODE128',
    displayValue: true,
    font: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: 14,
    textMargin: 6,
    margin: 16,
    lineColor: '#1c1917',
    background: '#ffffff',
    width: 2,
    height: 80,
  })
  return canvas.toDataURL('image/png')
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function downloadText(content: string, filename: string, mime = 'image/svg+xml') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  downloadDataUrl(url, filename)
  URL.revokeObjectURL(url)
}

export async function copyImageDataUrl(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    return true
  } catch {
    return false
  }
}
