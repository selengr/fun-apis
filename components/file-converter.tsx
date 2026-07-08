'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  ArrowDown,
  RefreshCw,
  Download,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Table2,
  FileType,
  X,
  Sparkles,
} from 'lucide-react'
import {
  FORMAT_CATEGORIES,
  getExtension,
  swapExtension,
  type FormatCategory,
} from '@/types/cloudconvert'

type Step = 'idle' | 'uploading' | 'converting' | 'done' | 'error'

const CATEGORY_ICONS: Record<FormatCategory, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileType,
  spreadsheet: Table2,
}

const CATEGORY_ACCENTS: Record<FormatCategory, string> = {
  pdf: 'from-rose-500/20 to-transparent',
  image: 'from-sky-500/20 to-transparent',
  video: 'from-violet-500/20 to-transparent',
  audio: 'from-emerald-500/20 to-transparent',
  document: 'from-amber-500/20 to-transparent',
  spreadsheet: 'from-teal-500/20 to-transparent',
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ name }: { name: string }) {
  const ext = getExtension(name)
  const cat = FORMAT_CATEGORIES.find(c => c.formats.some(f => f.value === ext))
  const Icon = cat ? CATEGORY_ICONS[cat.key] : FileText
  return <Icon className="size-8 text-muted-foreground" />
}

export function FileConverter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [category, setCategory] = useState<FormatCategory>('pdf')
  const [outputFormat, setOutputFormat] = useState('pdf')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ filename: string; url: string } | null>(null)

  const formats = useMemo(
    () => FORMAT_CATEGORIES.find(c => c.key === category)?.formats ?? [],
    [category],
  )

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
      const defaultOut = match.formats.find(fmt => fmt.value !== ext)?.value ?? match.formats[0].value
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

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">
      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: FileText, label: 'PDF', sub: 'documents', accent: CATEGORY_ACCENTS.pdf },
          { icon: ImageIcon, label: 'Image', sub: 'png · jpg · webp', accent: CATEGORY_ACCENTS.image },
          { icon: Film, label: 'Video', sub: 'mp4 · webm', accent: CATEGORY_ACCENTS.video },
          { icon: Music, label: 'Audio', sub: 'mp3 · wav', accent: CATEGORY_ACCENTS.audio },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-4"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <s.icon className="size-4 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main converter card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground px-3 py-1.5 rounded-full border border-border/60 bg-card/50">
              <Sparkles className="size-3" />
              File converter
            </p>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
              dragging
                ? 'border-sky-500/60 bg-sky-500/5 scale-[1.01]'
                : file
                  ? 'border-border/50 bg-muted/10 cursor-default'
                  : 'border-border/60 hover:border-border hover:bg-muted/10'
            }`}
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

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 px-6 text-center"
                >
                  <div className="size-14 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-center mb-4">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Drop a file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse · max 25 MB</p>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 p-5"
                >
                  <div className="size-14 rounded-xl border border-border/50 bg-card/60 flex items-center justify-center shrink-0">
                    <FileIcon name={file.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                  {!converting && step !== 'done' && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); reset() }}
                      className="size-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Arrow */}
          {file && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="size-10 rounded-full border border-border/60 bg-card/60 flex items-center justify-center">
                <ArrowDown className={`size-4 text-muted-foreground ${converting ? 'animate-bounce' : ''}`} />
              </div>
            </motion.div>
          )}

          {/* Format selection */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground text-center">
                Convert to
              </p>

              <div className="flex flex-wrap justify-center gap-1.5">
                {FORMAT_CATEGORIES.map(c => {
                  const Icon = CATEGORY_ICONS[c.key]
                  return (
                    <button
                      key={c.key}
                      type="button"
                      disabled={converting || step === 'done'}
                      onClick={() => {
                        setCategory(c.key)
                        setOutputFormat(c.formats[0].value)
                      }}
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        category === c.key
                          ? 'bg-foreground text-background border-foreground font-medium'
                          : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
                      }`}
                    >
                      <Icon className="size-3" />
                      {c.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {formats.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    disabled={converting || step === 'done'}
                    onClick={() => setOutputFormat(f.value)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border font-mono uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      outputFormat === f.value
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-semibold'
                        : 'bg-card/40 text-muted-foreground border-border/60 hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Output file</p>
                <p className="text-sm font-mono font-medium text-foreground mt-0.5 truncate">{outputName}</p>
              </div>
            </motion.div>
          )}

          {/* Convert button */}
          {file && step !== 'done' && (
            <motion.button
              type="button"
              onClick={convert}
              disabled={!file || converting}
              whileHover={{ scale: converting ? 1 : 1.02 }}
              whileTap={{ scale: converting ? 1 : 0.98 }}
              className="w-full h-12 rounded-2xl bg-foreground text-background font-medium text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {step === 'uploading' && (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Uploading…
                </>
              )}
              {step === 'converting' && (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Converting…
                </>
              )}
              {(step === 'idle' || step === 'error') && (
                <>
                  <RefreshCw className="size-4" />
                  Convert
                </>
              )}
            </motion.button>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400 text-center rounded-xl border border-red-500/20 bg-red-500/10 py-2 px-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {step === 'done' && result && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-card/80 to-teal-500/5 p-6 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="inline-flex"
                >
                  <CheckCircle2 className="size-10 text-emerald-500" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-foreground">Conversion complete</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{result.filename}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <a
                    href={result.url}
                    download={result.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Download className="size-4" />
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl border border-border/60 text-sm hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    Convert another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  )
}
