'use client'
import { useState, useEffect, useCallback } from 'react'
import { Copy, Share2, Search, Check, Volume2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Phonetic {
  text?: string
  audio?: string
}

interface Definition {
  definition: string
  example?: string
  synonyms: string[]
  antonyms: string[]
}

interface Meaning {
  partOfSpeech: string
  definitions: Definition[]
  synonyms: string[]
  antonyms: string[]
}

interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics: Phonetic[]
  meanings: Meaning[]
}

interface DictionaryModalProps {
  isOpen: boolean
  onClose: () => void
  word?: string
}

const POS_STYLES: Record<string, string> = {
  noun:      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  verb:      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  adjective: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  adverb:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
}

export default function DictionaryModal({ isOpen, onClose, word = 'cat' }: DictionaryModalProps) {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [activePOS, setActivePOS] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentWord, setCurrentWord] = useState(word)

  const allMeanings = entries.flatMap(e => e.meanings)
  const uniquePOS = [...new Map(allMeanings.map(m => [m.partOfSpeech, m])).values()]
  const activeMeaning = allMeanings.find(m => m.partOfSpeech === activePOS)
  const phonetics = entries[0]?.phonetics ?? []
  const ukAudio = phonetics.find(p => p.audio?.includes('uk'))?.audio
  const usAudio = phonetics.find(p => p.audio?.includes('us'))?.audio ?? phonetics.find(p => p.audio)?.audio
  const phoneticText = entries[0]?.phonetic ?? phonetics[0]?.text ?? ''

  const fetchWord = useCallback(async (w: string) => {
    setLoading(true)
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w}`)
      const data: DictionaryEntry[] = await res.json()
      if (Array.isArray(data)) {
        setEntries(data)
        setActivePOS(data[0]?.meanings[0]?.partOfSpeech ?? '')
        setCurrentWord(w)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) fetchWord(word)
  }, [isOpen, word, fetchWord])

  const playAudio = (url?: string) => {
    if (url) new Audio(url).play().catch(() => {})
  }

  const handleCopy = async () => {
    const def = activeMeaning?.definitions[0]?.definition ?? ''
    await navigator.clipboard.writeText(`${currentWord}: ${def}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const def = activeMeaning?.definitions[0]?.definition ?? ''
    const text = `${currentWord} (${activePOS}): ${def}`
    if (navigator.share) await navigator.share({ title: currentWord, text })
    else await navigator.clipboard.writeText(text)
  }

  const RANDOM_WORDS = ['serendipity','ephemeral','melancholy','luminous','petrichor','sonder','hiraeth','vellichor']
  const fetchRandom = () => {
    const w = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]
    fetchWord(w)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-background">

        {/* Header */}
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-medium tracking-tight text-foreground leading-none mb-2">
                {loading ? (
                  <span className="animate-pulse text-muted-foreground">...</span>
                ) : currentWord}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {phoneticText && (
                  <span className="text-sm text-muted-foreground font-serif">{phoneticText}</span>
                )}
                {ukAudio && (
                  <button
                    onClick={() => playAudio(ukAudio)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                  >
                    <Volume2 size={10} /> UK
                  </button>
                )}
                {usAudio && (
                  <button
                    onClick={() => playAudio(usAudio)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                  >
                    <Volume2 size={10} /> US
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* POS tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {uniquePOS.map(m => (
              <button
                key={m.partOfSpeech}
                onClick={() => setActivePOS(m.partOfSpeech)}
                className={cn(
                  'text-[11px] font-medium px-3 py-1 rounded-full border transition-all',
                  activePOS === m.partOfSpeech
                    ? POS_STYLES[m.partOfSpeech] ?? 'bg-secondary text-secondary-foreground border-border'
                    : 'text-muted-foreground border-border bg-transparent hover:bg-secondary'
                )}
              >
                {m.partOfSpeech}
              </button>
            ))}
          </div>

          <div className="border-t border-border mt-4" />
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[320px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-border">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeMeaning?.definitions.slice(0, 6).map((def, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-medium text-muted-foreground flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{def.definition}</p>
                {def.example && (
                  <p className="text-xs text-muted-foreground italic mt-1 pl-2 border-l-2 border-border">
                    "{def.example}"
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Synonyms */}
          {(activeMeaning?.synonyms?.length ?? 0) > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Synonyms
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeMeaning!.synonyms.slice(0, 8).map(s => (
                  <button
                    key={s}
                    onClick={() => fetchWord(s)}
                    className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full hover:bg-purple-100 transition-colors dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Antonyms */}
          {(activeMeaning?.antonyms?.length ?? 0) > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Antonyms
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeMeaning!.antonyms.slice(0, 6).map(a => (
                  <span
                    key={a}
                    className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Search size={11} />
            Free Dictionary API
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={cn(
                'h-8 text-xs gap-1.5',
                copied && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
              )}
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 text-xs gap-1.5">
              <Share2 size={12} /> Share
            </Button>
            <Button size="sm" onClick={fetchRandom} className="h-8 text-xs gap-1.5">
              <Search size={12} /> New word
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}