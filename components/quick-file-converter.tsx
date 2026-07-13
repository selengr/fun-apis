'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, Upload } from 'lucide-react'

type Step = 'idle' | 'working' | 'done' | 'error'

const OUTPUT = 'png'

export function QuickFileConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ filename: string; url: string } | null>(null)

  const pickFile = (f: File) => {
    setFile(f)
    setStep('idle')
    setError(null)
    setResult(null)
  }

  const pollJob = async (jobId: string): Promise<{ filename: string; url: string }> => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const res = await fetch(`/api/convert?jobId=${jobId}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Status check failed')
      if (json.status === 'finished' && json.files?.[0]) {
        return { filename: json.files[0].filename, url: json.files[0].url }
      }
      if (json.status === 'error') throw new Error(json.error ?? 'Conversion failed')
    }
    throw new Error('Timed out')
  }

  const convert = async () => {
    if (!file || step === 'working') return
    setError(null)
    setResult(null)
    setStep('working')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('output_format', OUTPUT)

      const res = await fetch('/api/convert', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      const out = await pollJob(json.jobId)
      setResult(out)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setStep('error')
    }
  }

  const working = step === 'working'

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pickFile(f)
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) pickFile(f)
        }}
        className={`w-full rounded-xl border border-dashed px-3 py-4 transition-all cursor-pointer md:h-[135px] ${
          dragging
            ? 'border-foreground/40 bg-muted/70'
            : 'border-border/70 bg-muted/30 hover:bg-muted/50 hover:border-border'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Upload className="size-4 text-muted-foreground/70" />
          {file ? (
            <span className="text-[11px] text-foreground truncate max-w-full px-1">{file.name}</span>
          ) : (
            <>
              <span className="text-[11px] text-foreground/80">Drop a file</span>
              <span className="text-[10px] text-muted-foreground/60">or click to browse</span>
            </>
          )}
        </div>
      </button>

      {step === 'done' && result ? (
        <a
          href={result.url}
          download={result.filename}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground text-background text-[11px] font-medium tracking-wide hover:opacity-90 transition-opacity"
        >
          <Download className="size-3.5" />
          Download PNG
        </a>
      ) : (
        <button
          type="button"
          onClick={convert}
          disabled={!file || working}
          className="w-full flex items-center justify-center gap-1.5 py-[9px] rounded-lg bg-foreground text-background text-[11px] font-medium tracking-wide hover:opacity-90 disabled:opacity-45 disabled:pointer-events-none transition-opacity cursor-pointer"
        >
          {working ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Converting…
            </>
          ) : (
            'Convert to PNG'
          )}
        </button>
      )}

      {error && <p className="text-[9px] text-red-500/80 leading-snug">{error}</p>}
    </div>
  )
}
