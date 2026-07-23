'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { generateQrPng, downloadDataUrl } from '@/lib/qr-barcode'

export function QuickQrMaker() {
  const [text, setText] = useState('')
  const [png, setPng] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genIdRef = useRef(0)

  useEffect(() => {
    const value = text.trim()
    if (!value) {
      setPng(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const id = ++genIdRef.current
      try {
        const dataUrl = await generateQrPng(value, 360)
        if (id === genIdRef.current) setPng(dataUrl)
      } catch {
        if (id === genIdRef.current) setPng(null)
      }
    }, 280)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [text])

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="relative flex-1 flex items-center justify-center min-h-[160px] rounded-2xl border border-border/60 bg-background/60 dark:bg-background/40">
        <div className="pointer-events-none absolute top-3 left-3 size-3 border-l border-t border-foreground/25" />
        <div className="pointer-events-none absolute top-3 right-3 size-3 border-r border-t border-foreground/25" />
        <div className="pointer-events-none absolute bottom-3 left-3 size-3 border-l border-b border-foreground/25" />
        <div className="pointer-events-none absolute bottom-3 right-3 size-3 border-r border-b border-foreground/25" />

        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={png}
            alt="QR preview"
            className="size-[120px] md:size-[140px] rounded-md bg-white shadow-sm"
          />
        ) : (
          <p className="text-sm text-muted-foreground/50 font-mono tracking-wide">awaiting ink…</p>
        )}
      </div>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="paste a link or message"
        className="w-full bg-transparent border-b border-foreground/15 focus:border-foreground pb-2 text-base font-light tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40 transition-colors"
        aria-label="QR content"
      />

      <button
        type="button"
        onClick={() => {
          if (png) downloadDataUrl(png, 'qr-code.png')
        }}
        disabled={!png}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-35 disabled:pointer-events-none transition-opacity cursor-pointer"
      >
        <Download className="size-3.5" />
        Download PNG
      </button>
    </div>
  )
}
