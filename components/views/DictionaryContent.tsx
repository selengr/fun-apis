'use client'
import { useState } from 'react'
import { Search, Copy, Share2, Volume2, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { DictionaryEntry } from '@/types/dictionary'
import { getPos, POS_ICON } from '@/lib/dictionary-utils'

interface Props {
  query: string
  setQuery: (q: string) => void
  data: DictionaryEntry[] | null
  loading: boolean
  error: string
  lookup: (word: string) => void
}

export function DictionaryContent({ query, setQuery, data, loading, error, lookup }: Props) {
  const [copied, setCopied] = useState(false)

  const handleSearch = () => lookup(query)
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch() }
  const handleWordClick = (w: string) => { setQuery(w); lookup(w) }
  const playAudio = (url: string) => { try { new Audio(url).play() } catch {} }

  const copyWord = async () => {
    if (!data) return
    await navigator.clipboard.writeText(data[0].word)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWord = async () => {
    if (!data) return
    if (navigator.share) await navigator.share({ title: data[0].word, url: window.location.href })
    else await navigator.clipboard.writeText(data[0].word)
  }

  const allMeanings = data?.flatMap(e => e.meanings) ?? []
  const primaryMeaning = allMeanings[0]
  const primaryDef = primaryMeaning?.definitions[0]
  const entry = data?.[0]
  const phonetics = entry?.phonetics ?? []
  const phoneticText = entry?.phonetic ?? phonetics.find(p => p.text)?.text ?? ''
  const ukAudio = phonetics.find(p => p.audio?.includes('uk'))
  const usAudio = phonetics.find(p => p.audio?.includes('us')) ?? phonetics.find(p => p.audio)

  return (
    <>
      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search a word — try 'serendipity'"
          className="h-11 text-base"
        />
        <Button onClick={handleSearch} disabled={loading} className="h-11 px-5 gap-2 shrink-0">
          <Search size={16} />
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="p-5 space-y-3">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="h-14 bg-muted rounded-lg" />
              <div className="h-14 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {data && !loading && entry && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">

          {/* Word header */}
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-start gap-3 mb-1">
              <div className="flex-1">
                <h1 className="text-3xl font-medium text-foreground tracking-tight leading-none">
                  {entry.word}
                </h1>
              </div>
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={copyWord}
                  className={cn(
                    'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
                    copied
                      ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                      : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="Copy word"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={shareWord}
                  className="w-8 h-8 rounded-full border border-border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Share"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>

            {phoneticText && (
              <p className="text-sm text-muted-foreground mb-4">{phoneticText}</p>
            )}

            {/* Audio buttons */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { p: ukAudio, label: 'UK', flag: '🇬🇧' },
                { p: usAudio, label: 'US', flag: '🇺🇸' },
              ].map(({ p, label, flag }) => p?.audio ? (
                <button
                  key={label}
                  onClick={() => playAudio(p.audio!)}
                  className="flex items-center gap-2.5 px-3 py-2.5 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-xl">{flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.text ?? '—'}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Volume2 size={11} className="text-white" />
                  </div>
                </button>
              ) : null)}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="meanings">
            <div className="border-b border-border px-5">
              <TabsList className="h-auto bg-transparent p-0 gap-5 rounded-none">
                {['meanings', 'synonyms', 'examples'].map(t => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="h-10 px-0 border-0 rounded-none border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-600 text-muted-foreground text-sm capitalize shadow-none"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Meanings */}
            <TabsContent value="meanings" className="mt-0 p-5 space-y-4">
              {primaryMeaning && (
                <div className="bg-teal-50 dark:bg-teal-950 rounded-xl p-4">
                  <p className="text-[10px] font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-3">
                    Primary meaning
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-medium">1</div>
                    <span className={cn('text-xs font-medium', getPos(primaryMeaning.partOfSpeech).text)}>
                      {primaryMeaning.partOfSpeech}
                    </span>
                    <span className="text-[10px] font-medium bg-teal-700 text-teal-50 dark:bg-teal-400 dark:text-teal-950 px-2 py-0.5 rounded-full">
                      most common
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-3 leading-relaxed">{primaryDef?.definition}</p>
                  {primaryMeaning.synonyms.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">Synonyms:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {primaryMeaning.synonyms.slice(0, 14).map(s => (
                          <button
                            key={s}
                            onClick={() => handleWordClick(s)}
                            className="text-xs text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {allMeanings.length > 1 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-3">
                    All meanings ({allMeanings.length - 1} more)
                  </p>
                  <div className="space-y-2">
                    {allMeanings.slice(1).map((m, i) => {
                      const style = getPos(m.partOfSpeech)
                      const def = m.definitions[0]
                      if (!def) return null
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-2 shrink-0 pt-0.5">
                            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium', style.bg, style.text)}>
                              {POS_ICON[m.partOfSpeech] ?? '?'}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{i + 2}</span>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 border', style.bg, style.text, style.border)}>
                              {m.partOfSpeech}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-snug">{def.definition}</p>
                            {def.example && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 italic mt-1">Example: {def.example}</p>
                            )}
                            {m.synonyms.length > 0 && (
                              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                                Synonyms: {m.synonyms.slice(0, 5).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Synonyms */}
            <TabsContent value="synonyms" className="mt-0 p-5">
              {allMeanings.map((m, i) => {
                const syns = [...new Set([...m.synonyms, ...m.definitions.flatMap(d => d.synonyms)])]
                if (!syns.length) return null
                const style = getPos(m.partOfSpeech)
                return (
                  <div key={i} className="mb-5">
                    <p className={cn('text-[10px] font-medium uppercase tracking-wider mb-3', style.text)}>
                      {m.partOfSpeech}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {syns.slice(0, 18).map(s => (
                        <button
                          key={s}
                          onClick={() => handleWordClick(s)}
                          className="text-xs text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            {/* Examples */}
            <TabsContent value="examples" className="mt-0 p-5 space-y-2">
              {allMeanings.flatMap((m, mi) =>
                m.definitions.filter(d => d.example).map((d, di) => {
                  const style = getPos(m.partOfSpeech)
                  return (
                    <div key={`${mi}-${di}`} className="p-3.5 border border-border rounded-lg bg-card">
                      <Badge variant="outline" className={cn('text-[10px] mb-2 border', style.bg, style.text, style.border)}>
                        {m.partOfSpeech}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{d.definition}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 italic">"{d.example}"</p>
                    </div>
                  )
                })
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLink size={11} />
              Source:
              <a href={entry.sourceUrls?.[0]} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Wiktionary <ExternalLink size={10} />
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              License:
              <a href={entry.license?.url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline">
                {entry.license?.name}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}