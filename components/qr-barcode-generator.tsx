'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

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

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
    <div className="max-w-3xl mx-auto px-5 md:px-6 space-y-10">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">
          Code stamp
        </p>
        <h1
          className="text-[clamp(2.5rem,10vw,4.5rem)] font-light tracking-tight text-foreground leading-none"
          style={{ fontFamily: 'var(--font-qr-display), Georgia, serif' }}
        >
          Stamp a code
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
          Type a link or message — your QR or barcode appears live. Download PNG or SVG.
        </p>
      </motion.header>

      {/* Giant stamp preview — the focus */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="relative"
      >
        <div
          className={cn(
            'relative mx-auto overflow-hidden rounded-[1.75rem] border border-border bg-card/50 dark:bg-card/40 backdrop-blur-md transition-opacity',
            loading && hasPreview && 'opacity-70',
          )}
        >
          {/* Corner marks — stamp frame */}
          <div className="pointer-events-none absolute top-4 left-4 size-5 border-l-2 border-t-2 border-foreground/20" />
          <div className="pointer-events-none absolute top-4 right-4 size-5 border-r-2 border-t-2 border-foreground/20" />
          <div className="pointer-events-none absolute bottom-4 left-4 size-5 border-l-2 border-b-2 border-foreground/20" />
          <div className="pointer-events-none absolute bottom-4 right-4 size-5 border-r-2 border-b-2 border-foreground/20" />

          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div className="flex items-center gap-4">
              {(['qr', 'barcode'] as const).map(kind => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setActiveCode(kind)}
                  className={cn(
                    'text-[11px] uppercase tracking-[0.22em] transition-colors',
                    activeCode === kind
                      ? 'text-foreground underline underline-offset-4 decoration-foreground/40'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {kind === 'qr' ? 'QR' : 'Barcode'}
                </button>
              ))}
            </div>
            {loading ? (
              <RefreshCw className="size-3.5 text-muted-foreground animate-spin" />
            ) : (
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60"
                style={{ fontFamily: 'var(--font-qr-mono), ui-monospace, monospace' }}
              >
                Live
              </span>
            )}
          </div>

          <div className="flex items-center justify-center min-h-[300px] sm:min-h-[360px] px-8 py-10">
            <AnimatePresence mode="wait">
              {loading && !generated ? (
                <motion.div
                  key="skel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'animate-pulse rounded-2xl bg-muted/50',
                    activeCode === 'qr' ? 'size-56 sm:size-64' : 'h-24 w-full max-w-sm',
                  )}
                />
              ) : hasPreview && generated ? (
                <motion.div
                  key={`${activeCode}-${generated.payload.slice(0, 24)}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    activeCode === 'qr'
                      ? 'w-full max-w-[280px] sm:max-w-[320px] aspect-square [&_svg]:w-full [&_svg]:h-full drop-shadow-sm'
                      : 'w-full max-w-md [&_svg]:w-full [&_svg]:h-auto',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: activeCode === 'qr' ? generated.qrSvg : generated.barcodeSvg,
                  }}
                />
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground text-center max-w-xs"
                  style={{ fontFamily: 'var(--font-qr-display), Georgia, serif' }}
                >
                  Enter something below — your stamp appears here.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Input stage */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {CONTENT_TYPES.map(t => {
            const Icon = t.icon
            const active = contentType === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setContentType(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm transition-colors',
                  active
                    ? 'text-foreground underline underline-offset-4 decoration-foreground/40'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5 opacity-70" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="relative border-b-2 border-foreground/15 focus-within:border-foreground transition-colors pb-3">
          {multiLine ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder={placeholderFor(contentType)}
              rows={3}
              spellCheck={false}
              className="w-full bg-transparent text-xl md:text-2xl font-light tracking-tight text-foreground placeholder:text-muted-foreground/45 outline-none resize-none leading-snug"
              style={{ fontFamily: 'var(--font-qr-display), Georgia, serif' }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder={placeholderFor(contentType)}
              spellCheck={false}
              className="w-full bg-transparent text-xl md:text-2xl font-light tracking-tight text-foreground placeholder:text-muted-foreground/45 outline-none"
              style={{ fontFamily: 'var(--font-qr-display), Georgia, serif' }}
            />
          )}
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            disabled={!hasPreview || loading}
            onClick={downloadPng}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium disabled:opacity-35 hover:opacity-90 transition-opacity"
          >
            <Download className="size-3.5" />
            PNG
          </button>
          <button
            type="button"
            disabled={!hasPreview || loading}
            onClick={downloadSvg}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-foreground disabled:opacity-35 hover:bg-muted/40 transition-colors"
          >
            <Download className="size-3.5" />
            SVG
          </button>
          <button
            type="button"
            disabled={!hasPreview || loading}
            onClick={() => void copyImage()}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground disabled:opacity-35 hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            disabled={!hasPreview || loading}
            onClick={() => void shareImage()}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground disabled:opacity-35 hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
      </motion.section>
    </div>
  )
}
