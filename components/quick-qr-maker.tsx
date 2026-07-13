'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, ArrowUpRight } from 'lucide-react'
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
        const dataUrl = await generateQrPng(value, 280)
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
    <div className="space-y-2.5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="paste link or text"
        className="w-full rounded-lg border border-border/60 bg-muted/50 px-3 py-2.5 text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-border focus:bg-muted/70 transition-colors"
        aria-label="QR content"
      />

      <div className="flex items-center justify-center py-1.5 min-h-[80px] rounded-lg border border-border/50 bg-muted/40">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={png} alt="QR preview" className="size-[65px] rounded-sm bg-white" />
        ) : (
          <span className="text-[10px] text-muted-foreground/45 font-mono">
            qr.ready 
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (png) downloadDataUrl(png, 'qr-code.png')
        }}
        disabled={!png}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-black/85 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <Download className="size-3" />
        Download PNG
      </button>

    </div>
  )
}
