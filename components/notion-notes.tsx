'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Database,
  FileText,
  CheckCircle2,
  Sparkles,
  CloudUpload,
  LayoutList,
} from 'lucide-react'
import type { NotionNote } from '@/types/notion'

const DRAFT_KEY = 'fun-apis-notion-draft'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function NotionNotes() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notes, setNotes] = useState<NotionNote[]>([])
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'database' | 'page' | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed.title) setTitle(parsed.title)
        if (parsed.body) setBody(parsed.body)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body }))
    }, 400)
    return () => clearTimeout(t)
  }, [title, body])

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/notion', { cache: 'no-store' })
      const json = await res.json()
      setConfigured(json.configured)
      setMode(json.mode ?? null)
      setNotes(json.notes ?? [])
      if (json.error) setError(json.error)
    } catch {
      setError('Could not reach Notion')
      setConfigured(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const createNote = async () => {
    if (!body.trim() && !title.trim()) return
    if (creating) return

    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() || 'Untitled', body }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create note')

      setSuccess({ url: json.url, title: json.title })
      setTitle('')
      setBody('')
      localStorage.removeItem(DRAFT_KEY)
      await loadNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
      {/* Stats / status strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {[
          {
            icon: Database,
            label: 'Sync target',
            value: configured ? (mode === 'database' ? 'Database' : 'Page') : 'Not set',
            sub: configured ? 'Connected to Notion' : 'Add API keys',
            accent: 'from-zinc-500/15 to-transparent',
          },
          {
            icon: LayoutList,
            label: 'Notes',
            value: String(notes.length),
            sub: 'in your workspace',
            accent: 'from-stone-500/15 to-transparent',
          },
          {
            icon: CloudUpload,
            label: 'Action',
            value: 'Create',
            sub: 'push to Notion instantly',
            accent: 'from-neutral-500/15 to-transparent',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-4 ${i === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <s.icon className="size-3.5" />
                <span className="text-[10px] uppercase tracking-[0.15em]">{s.label}</span>
              </div>
              <p className="text-xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {!configured && !loading && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-2">Connect Notion first</p>
          <p>Add these to <code className="text-xs bg-muted/50 px-1 py-0.5 rounded">.env.local</code>:</p>
          <pre className="mt-3 text-xs font-mono bg-card/60 border border-border/50 rounded-xl p-4 overflow-x-auto text-foreground/80">
{`NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=your_database_id
# optional: NOTION_TITLE_PROPERTY=Name`}
          </pre>
          <p className="mt-3 text-xs">
            Create an integration at{' '}
            <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              notion.so/my-integrations
            </a>
            , then share your database with it.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* Editor — Notion-like */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:col-span-3 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3" />
              New note
            </span>
            <span className="text-[10px] text-muted-foreground/70 font-mono">draft · auto-saved</span>
          </div>

          <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Untitled"
              disabled={!configured || creating}
              className="w-full bg-transparent text-2xl md:text-3xl font-light tracking-tight text-foreground placeholder:text-muted-foreground/40 outline-none border-none disabled:opacity-50"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Start writing…"
              disabled={!configured || creating}
              rows={10}
              className="mt-4 w-full flex-1 bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground/40 outline-none border-none resize-none disabled:opacity-50 min-h-[180px]"
            />
          </div>

          <div className="px-5 py-4 border-t border-border/40 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              Creates a page{mode === 'database' ? ' in your database' : ' under your Notion page'}
            </p>
            <button
              type="button"
              onClick={createNote}
              disabled={!configured || creating || (!title.trim() && !body.trim())}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-foreground text-background text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
            >
              {creating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Syncing…
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create in Notion
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Synced notes list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Synced notes
            </span>
            <button
              type="button"
              onClick={loadNotes}
              disabled={loading}
              className="size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-3 max-h-[420px] overflow-y-auto">
            {loading && notes.length === 0 ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 px-4 text-muted-foreground">
                <FileText className="size-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Create one and it appears here</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {notes.map((note, i) => (
                  <motion.li
                    key={note.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/20 px-3 py-3 transition-all cursor-pointer"
                    >
                      <span className="text-lg mt-0.5 shrink-0">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:underline">
                          {note.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

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

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-card/80 to-teal-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Created in Notion</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{success.title}</p>
              </div>
            </div>
            <a
              href={success.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors cursor-pointer shrink-0"
            >
              Open in Notion
              <ExternalLink className="size-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-[11px] text-muted-foreground">
        Synced via{' '}
        <a
          href="https://developers.notion.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Notion API
        </a>
        {' '}· pages & databases
      </p>
    </div>
  )
}
