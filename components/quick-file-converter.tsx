'use client'

import { useRef, useState } from 'react'
import { Download, Loader2, Upload, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      await new Promise(r => setTimeout(r, 2000))
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
  const ext = file?.name.split('.').pop()?.toUpperCase() ?? '···'

  return (
    <div className="flex flex-col h-full gap-5">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) pickFile(f)
        }}
      />

      {/* Morph readout */}
      <div className="flex items-center justify-center gap-3 select-none py-2">
        <span className="font-mono text-2xl md:text-3xl tracking-tight text-foreground/30 uppercase">
          {ext}
        </span>
        <ArrowRight className="size-4 text-muted-foreground/50" />
        <span className="font-mono text-2xl md:text-3xl tracking-tight text-foreground uppercase">
          PNG
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) pickFile(f)
        }}
        className={cn(
          'relative flex-1 flex flex-col items-center justify-center gap-2 min-h-[140px] rounded-2xl border border-dashed transition-all cursor-pointer',
          dragging
            ? 'border-foreground bg-foreground/[0.04]'
            : 'border-border/70 bg-background/50 hover:border-foreground/30',
        )}
      >
        <Upload className="size-5 text-muted-foreground/70" />
        {file ? (
          <span className="text-sm text-foreground truncate max-w-[90%] px-3">{file.name}</span>
        ) : (
          <>
            <span className="text-sm text-foreground/80">Drop a file</span>
            <span className="text-[11px] text-muted-foreground/60">or click · → PNG</span>
          </>
        )}
      </button>

      {step === 'done' && result ? (
        <a
          href={result.url}
          download={result.filename}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="size-3.5" />
          Download PNG
        </a>
      ) : (
        <button
          type="button"
          onClick={convert}
          disabled={!file || working}
          className="inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-35 disabled:pointer-events-none transition-opacity cursor-pointer"
        >
          {working ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Morphing…
            </>
          ) : (
            <>
              <ArrowRight className="size-3.5" />
              Morph to PNG
            </>
          )}
        </button>
      )}

      {error ? <p className="text-[11px] text-destructive text-center">{error}</p> : null}
    </div>
  )
}
