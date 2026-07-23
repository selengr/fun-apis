'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  RefreshCw,
  Download,
  X,
  ArrowRight,
} from 'lucide-react'
import {
  FORMAT_CATEGORIES,
  getExtension,
  swapExtension,
  type FormatCategory,
} from '@/types/cloudconvert'
import { cn } from '@/lib/utils'

type Step = 'idle' | 'uploading' | 'converting' | 'done' | 'error'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [category, setCategory] = useState<FormatCategory>('image')
  const [outputFormat, setOutputFormat] = useState('png')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ filename: string; url: string } | null>(null)

  const formats = useMemo(
    () => FORMAT_CATEGORIES.find(c => c.key === category)?.formats ?? [],
    [category],
  )

  const inputExt = file ? getExtension(file.name) || '?' : '···'
  const outputName = file ? swapExtension(file.name, outputFormat) : `output.${outputFormat}`

  const pickFile = useCallback((f: File) => {
    setFile(f)
    setStep('idle')
    setError(null)
    setResult(null)
    const ext = getExtension(f.name)
    const match = FORMAT_CATEGORIES.find(c =>
      c.formats.some(fmt => fmt.value === ext),
    )
    if (match) {
      setCategory(match.key)
      const defaultOut =
        match.formats.find(fmt => fmt.value !== ext)?.value ?? match.formats[0].value
      setOutputFormat(defaultOut)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) pickFile(f)
    },
    [pickFile],
  )

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
    throw new Error('Conversion timed out. Try again.')
  }

  const convert = async () => {
    if (!file || step === 'uploading' || step === 'converting') return
    setError(null)
    setResult(null)
    setStep('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('output_format', outputFormat)

      const res = await fetch('/api/convert', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      setStep('converting')
      const out = await pollJob(json.jobId)
      setResult(out)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('error')
    }
  }

  const reset = () => {
    setFile(null)
    setStep('idle')
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const converting = step === 'uploading' || step === 'converting'
  const sourceLabel = inputExt.toUpperCase()
  const targetLabel = outputFormat.toUpperCase()

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-6 space-y-10">
      {/* Hero morph display */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">
          File morph
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-5 select-none">
          <motion.span
            key={sourceLabel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(2.5rem,12vw,5.5rem)] font-light tracking-tight text-foreground/25 leading-none uppercase"
            style={{ fontFamily: 'var(--font-convert-mono), ui-monospace, monospace' }}
          >
            {sourceLabel}
          </motion.span>
          <ArrowRight className="size-6 sm:size-8 text-foreground/30 shrink-0" />
          <motion.span
            key={targetLabel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(2.5rem,12vw,5.5rem)] font-light tracking-tight text-foreground leading-none uppercase"
            style={{ fontFamily: 'var(--font-convert-mono), ui-monospace, monospace' }}
          >
            {targetLabel}
          </motion.span>
        </div>

        <h1
          className="mt-6 text-2xl md:text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-convert-display), Georgia, serif' }}
        >
          Drop anything. Morph it.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          PDF, images, video, audio, documents, spreadsheets — one stage, one transform.
        </p>
      </motion.header>

      {/* Stage */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) pickFile(f)
          }}
        />

        <div
          onDragOver={e => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={cn(
            'relative overflow-hidden rounded-[1.5rem] border transition-all duration-400',
            dragging
              ? 'border-foreground bg-foreground/[0.04] scale-[1.01]'
              : 'border-border bg-card/40 dark:bg-card/30 backdrop-blur-md',
            !file && 'cursor-pointer hover:border-foreground/30',
          )}
        >
          {/* Scan line while converting */}
          {converting ? (
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/60 to-transparent z-10"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
            />
          ) : null}

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 px-6 text-center min-h-[280px]"
              >
                <div className="size-16 rounded-full border border-dashed border-foreground/20 flex items-center justify-center mb-5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p
                  className="text-xl text-foreground"
                  style={{ fontFamily: 'var(--font-convert-display), Georgia, serif' }}
                >
                  Drop a file onto the stage
                </p>
                <p className="mt-2 text-sm text-muted-foreground">or click to browse · max 25 MB</p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-8 space-y-8"
              >
                {/* File chip */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                      Source
                    </p>
                    <p
                      className="text-xl md:text-2xl text-foreground truncate leading-tight"
                      style={{ fontFamily: 'var(--font-convert-display), Georgia, serif' }}
                    >
                      {file.name}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                      {formatBytes(file.size)} · .{inputExt}
                    </p>
                  </div>
                  {!converting && step !== 'done' ? (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        reset()
                      }}
                      className="size-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>

                {/* Category rails */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Family
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {FORMAT_CATEGORIES.map(c => (
                      <button
                        key={c.key}
                        type="button"
                        disabled={converting || step === 'done'}
                        onClick={e => {
                          e.stopPropagation()
                          setCategory(c.key)
                          setOutputFormat(c.formats[0].value)
                        }}
                        className={cn(
                          'text-sm tracking-wide transition-colors disabled:opacity-40',
                          category === c.key
                            ? 'text-foreground underline underline-offset-4 decoration-foreground/40'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format tiles */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Become
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {formats.map(f => (
                      <button
                        key={f.value}
                        type="button"
                        disabled={converting || step === 'done'}
                        onClick={e => {
                          e.stopPropagation()
                          setOutputFormat(f.value)
                        }}
                        className={cn(
                          'h-14 rounded-xl border font-mono text-sm uppercase tracking-wider transition-all disabled:opacity-40',
                          outputFormat === f.value
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-foreground/30',
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Output
                    </p>
                    <p className="text-sm font-mono text-foreground truncate mt-0.5">{outputName}</p>
                  </div>

                  {step !== 'done' ? (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        convert()
                      }}
                      disabled={converting}
                      className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {converting ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="size-3.5" />
                      )}
                      {step === 'uploading'
                        ? 'Uploading'
                        : step === 'converting'
                          ? 'Morphing'
                          : 'Morph'}
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive text-center rounded-xl border border-destructive/20 bg-destructive/10 py-2.5 px-4"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {step === 'done' && result ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[1.5rem] border border-border bg-card/60 backdrop-blur-md p-8 text-center space-y-5"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Transform complete
            </p>
            <p
              className="text-3xl md:text-4xl text-foreground leading-none"
              style={{ fontFamily: 'var(--font-convert-display), Georgia, serif' }}
            >
              Ready
            </p>
            <p className="text-sm font-mono text-muted-foreground truncate max-w-md mx-auto">
              {result.filename}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
              <a
                href={result.url}
                download={result.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="size-3.5" />
                Download
              </a>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                Morph another
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
