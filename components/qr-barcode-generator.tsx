'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  Barcode,
  Link2,
  Mail,
  Phone,
  Type,
  Download,
  Copy,
  Check,
  Share2,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  type ContentType,
  buildPayload,
  validateInput,
  placeholderFor,
  generateQrSvg,
  generateQrPng,
  generateBarcodeSvg,
  generateBarcodePng,
  downloadDataUrl,
  downloadText,
  copyImageDataUrl,
} from '@/lib/qr-barcode'

const CONTENT_TYPES: { id: ContentType; label: string; icon: typeof Type }[] = [
  { id: 'url', label: 'Link', icon: Link2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
]

type CodeKind = 'qr' | 'barcode'

type Generated = {
  payload: string
  qrSvg: string
  qrPng: string
  barcodeSvg: string
  barcodePng: string
}

function PreviewSkeleton({ kind }: { kind: CodeKind }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className={cn(
          'animate-pulse rounded-2xl bg-muted/60',
          kind === 'qr' ? 'size-56 sm:size-64' : 'h-28 w-full max-w-md',
        )}
      />
    </div>
  )
}

export function QrBarcodeGenerator() {
  const [contentType, setContentType] = useState<ContentType>('url')
  const [rawInput, setRawInput] = useState('https://example.com')
  const [activeCode, setActiveCode] = useState<CodeKind>('qr')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [copied, setCopied] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genIdRef = useRef(0)

  const generate = useCallback(async (type: ContentType, raw: string) => {
    const validationError = validateInput(type, raw)
    if (validationError) {
      setError(validationError)
      setGenerated(null)
      setLoading(false)
      return
    }

    const payload = buildPayload(type, raw)
    const id = ++genIdRef.current
    setLoading(true)
    setError(null)

    try {
      const [qrSvg, qrPng, barcodeSvg, barcodePng] = await Promise.all([
        generateQrSvg(payload),
        generateQrPng(payload),
        generateBarcodeSvg(payload),
        generateBarcodePng(payload),
      ])

      if (id !== genIdRef.current) return
      setGenerated({ payload, qrSvg, qrPng, barcodeSvg, barcodePng })
    } catch {
      if (id !== genIdRef.current) return
      setError('Could not generate. Try shorter content.')
      setGenerated(null)
    } finally {
      if (id === genIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void generate(contentType, rawInput), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [contentType, rawInput, generate])

  const flashCopied = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPng = () => {
    if (!generated) return
    const url = activeCode === 'qr' ? generated.qrPng : generated.barcodePng
    downloadDataUrl(url, activeCode === 'qr' ? 'qr-code.png' : 'barcode.png')
  }

  const downloadSvg = () => {
    if (!generated) return
    const svg = activeCode === 'qr' ? generated.qrSvg : generated.barcodeSvg
    downloadText(svg, activeCode === 'qr' ? 'qr-code.svg' : 'barcode.svg')
  }

  const copyImage = async () => {
    if (!generated) return
    const png = activeCode === 'qr' ? generated.qrPng : generated.barcodePng
    const ok = await copyImageDataUrl(png)
    if (ok) flashCopied()
    else {
      await navigator.clipboard.writeText(generated.payload)
      flashCopied()
    }
  }

  const shareImage = async () => {
    if (!generated) return
    const title = activeCode === 'qr' ? 'QR Code' : 'Barcode'
    const png = activeCode === 'qr' ? generated.qrPng : generated.barcodePng
    try {
      if (navigator.share) {
        const res = await fetch(png)
        const blob = await res.blob()
        const file = new File([blob], `${activeCode}.png`, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title, files: [file] })
          return
        }
        await navigator.share({ title, text: generated.payload })
        return
      }
      await copyImage()
    } catch {
      /* cancelled */
    }
  }

  const hasPreview = Boolean(generated) && !error
  const multiLine = contentType === 'text'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 pt-6">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* ── Section 1: Input ── */}
        <section className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col">
          <h2 className="text-lg font-medium text-foreground mb-1">Your content</h2>
          <p className="text-sm text-muted-foreground mb-6">What should the code contain?</p>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {CONTENT_TYPES.map(t => {
              const Icon = t.icon
              const active = contentType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setContentType(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer',
                    active
                      ? 'border-foreground/20 bg-foreground text-background shadow-sm'
                      : 'border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-foreground/15',
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              )
            })}
          </div>

          {multiLine ? (
            <Textarea
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder={placeholderFor(contentType)}
              rows={5}
              className="resize-none text-base rounded-xl flex-1 min-h-[140px]"
            />
          ) : (
            <Input
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder={placeholderFor(contentType)}
              className="h-12 text-base rounded-xl"
            />
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ── Section 2: Preview + Export ── */}
        <section className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Preview</h2>
              <p className="text-sm text-muted-foreground">Updates as you type</p>
            </div>
            {loading && <RefreshCw className="size-4 text-muted-foreground animate-spin shrink-0" />}
          </div>

          <div className="flex rounded-xl border border-border p-1 bg-muted/40 mb-6">
            <button
              type="button"
              onClick={() => setActiveCode('qr')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all cursor-pointer',
                activeCode === 'qr'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <QrCode className="size-4" />
              QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveCode('barcode')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all cursor-pointer',
                activeCode === 'barcode'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Barcode className="size-4" />
              Barcode
            </button>
          </div>

          <div
            className={cn(
              'flex-1 flex items-center justify-center rounded-xl border border-dashed border-border bg-background/60 min-h-[260px] px-6 py-8 transition-opacity',
              loading && hasPreview && 'opacity-50',
            )}
          >
            {loading && !generated ? (
              <PreviewSkeleton kind={activeCode} />
            ) : hasPreview && generated ? (
              activeCode === 'qr' ? (
                <div
                  className="w-full max-w-[260px] sm:max-w-[280px] aspect-square [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: generated.qrSvg }}
                />
              ) : (
                <div
                  className="w-full max-w-md [&_svg]:w-full [&_svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: generated.barcodeSvg }}
                />
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Enter valid content on the left to see your code here.
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!hasPreview || loading}
              onClick={downloadPng}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2.5 h-14 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="size-5" />
              Download PNG
            </button>
            <button
              type="button"
              disabled={!hasPreview || loading}
              onClick={downloadSvg}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2.5 h-14 rounded-xl border-2 border-foreground/15 bg-background text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="size-5" />
              Download SVG
            </button>
            <button
              type="button"
              disabled={!hasPreview || loading}
              onClick={() => void copyImage()}
              className="flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              disabled={!hasPreview || loading}
              onClick={() => void shareImage()}
              className="flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
