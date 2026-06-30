"use client";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Copy, Share2, Volume2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DictionaryImage from "./DictionaryImage";
import type { DictionaryEntry } from "@/types/dictionary";
import { getPos, POS_ICON } from "@/lib/dictionary-utils";

interface Suggestion {
  word: string
  score: number
}

// ── static default data — no API call on mount ──────────────
const DEFAULT_DATA: DictionaryEntry[] = [{"word":"serendipity","phonetic":"/ˌsɛ.ɹən.ˈdɪ.pɪ.ti/","phonetics":[{"text":"/ˌsɛ.ɹən.ˈdɪ.pɪ.ti/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-au.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=75857831","license":{"name":"BY-SA 4.0","url":"https://creativecommons.org/licenses/by-sa/4.0"}},{"text":"/ˌsɛ.ɹən.ˈdɪ.pɪ.ti/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-us.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=965947","license":{"name":"BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"}}],"meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"A combination of events which have come together by chance to make a surprisingly good or wonderful outcome.","synonyms":[],"antonyms":["Murphy's law","perfect storm"]},{"definition":"An unsought, unintended, and/or unexpected, but fortunate, discovery and/or learning experience that happens by accident.","synonyms":["chance","luck"],"antonyms":[]}],"synonyms":["chance","luck"],"antonyms":["Murphy's law","perfect storm"]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/serendipity"]}]

export function DictionaryContent() {
  const [query, setQuery] = useState("");
  // ↓ initialize directly with static data — zero API call
  const [data, setData] = useState<DictionaryEntry[]>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ── lookup — only called on explicit search ───────────────
  const lookup = useCallback(async (word: string) => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    // ↓ keep old data visible while loading — no blank state
    setShowSuggestions(false);
    setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`
      );
      if (!res.ok) {
        setError(`No definition found for "${word}".`);
        setLoading(false);
        return;
      }
      const json: DictionaryEntry[] = await res.json();
      setData(json);       // ↓ swap data only when ready
      setError("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── NO useEffect for initial lookup — using static data ───

  // ── suggestions ───────────────────────────────────────────
  const fetchSuggestions = useCallback(async (word: string) => {
    if (!word.trim() || word.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(word)}&max=8`)
      const json: Suggestion[] = await res.json()
      setSuggestions(json)
      setShowSuggestions(json.length > 0)
    } catch {
      setSuggestions([])
    }
  }, [])

  // ── outside click closes dropdown ─────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── input change — debounce suggestions only ──────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setActiveSuggestion(-1)
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handleSearch = () => {
    if (!query.trim()) return
    setShowSuggestions(false)
    lookup(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0) pickSuggestion(suggestions[activeSuggestion].word)
      else handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const pickSuggestion = (word: string) => {
    setQuery(word)
    setShowSuggestions(false)
    setSuggestions([])
    setActiveSuggestion(-1)
    lookup(word)
  }

  const handleWordClick = (w: string) => { setQuery(w); lookup(w); };
  const playAudio = (url: string) => { try { new Audio(url).play(); } catch {} };

  const copyWord = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data[0].word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWord = async () => {
    if (!data) return;
    if (navigator.share) await navigator.share({ title: data[0].word, url: window.location.href });
    else await navigator.clipboard.writeText(data[0].word);
  };

  const allMeanings = data?.flatMap((e) => e.meanings) ?? [];
  const primaryMeaning = allMeanings[0];
  const primaryDef = primaryMeaning?.definitions[0];
  const entry = data?.[0];
  const phonetics = entry?.phonetics ?? [];
  const phoneticText = entry?.phonetic ?? phonetics.find((p) => p.text)?.text ?? "";
  const ukAudio = phonetics.find((p) => p.audio?.includes("au"));   // serendipity has 'au'
  const usAudio = phonetics.find((p) => p.audio?.includes("us")) ?? phonetics.find((p) => p.audio);

  return (
    <>
      <div className="h-full bg-background p-5">
        <div className="max-w-xl mx-auto">

          {/* ── Search + Suggestions ── */}
          <div className="flex gap-2 mb-6 pt-1 pl-1" ref={wrapperRef}>
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search a word — try 'ephemeral'"
                className="h-11 text-base pr-8"
                autoComplete="off"
              />

              {/* clear */}
              {query && (
                <button
                  onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear"
                >
                  <X size={14} />
                </button>
              )}

              {/* suggestion dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute h-[240px] overflow-scroll top-[calc(100%+2px)] left-0 right-0 z-50 bg-popover border border-border rounded-xl shadow-md">
                  {/* <div className="px-3 py-1.5 border-b border-border">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Suggestions
                    </p>
                  </div> */}
                  <ul role="listbox">
                    {suggestions.map((s, i) => (
                      <li
                        key={s.word}
                        role="option"
                        aria-selected={i === activeSuggestion}
                        onMouseDown={() => pickSuggestion(s.word)}
                        onMouseEnter={() => setActiveSuggestion(i)}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 cursor-pointer transition-colors",
                          i === activeSuggestion
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Search size={13} className="text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">
                            {s.word.toLowerCase().startsWith(query.toLowerCase()) ? (
                              <>
                                <span className="font-medium">{s.word.slice(0, query.length)}</span>
                                <span className="text-muted-foreground">{s.word.slice(query.length)}</span>
                              </>
                            ) : s.word}
                          </span>
                        </div>
                        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">↵</kbd>
                      </li>
                    ))}
                  </ul>
                  {/* <div className="px-4 py-2 border-t border-border bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">↑↓ navigate · ↵ select · esc close</p>
                  </div> */}
                </div>
              )}
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 w-28 px-5 gap-2 shrink-0 cursor-pointer"
            >
              {/* ↓ only the button shows loading state */}
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching…</>
                : <><Search size={16} /> Search</>
              }
            </Button>
          </div>

          {/* Error — shown below search, old result still visible */}
          {error && (
            <div className="mb-4 px-4 py-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
              {error}
            </div>
          )}

          {/* ── Result — always visible, data swaps when lookup resolves ── */}
          {data && entry && (
            <div className={cn(
              "border border-border rounded-xl overflow-y-scroll h-[49vh] bg-card transition-opacity duration-200",
              loading && "opacity-60 pointer-events-none"   // ↓ dim old result while loading, no blank flash
            )}>
              <div className="flex flex-row w-full justify-between">

                {/* Word header */}
                <div className="px-5 pt-5 pb-0 w-[60%]">
                  <div className="flex items-start gap-3 mb-1">
                    <div>
                      <h1 className="text-3xl font-medium text-foreground tracking-tight leading-none">
                        {entry.word}
                      </h1>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <button
                        onClick={copyWord}
                        className={cn(
                          "w-8 h-8 rounded-full cursor-pointer border flex items-center justify-center transition-colors",
                          copied
                            ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="Copy word"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={shareWord}
                        className="w-8 h-8 cursor-pointer rounded-full border border-border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Share"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>

                  {phoneticText && (
                    <p className="text-sm text-muted-foreground mb-4">{phoneticText}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { p: ukAudio, label: "AU", flag: "🇦🇺" },
                      { p: usAudio, label: "US", flag: "🇺🇸" },
                    ].map(({ p, label, flag }) =>
                      p?.audio ? (
                        <button
                          key={label}
                          onClick={() => playAudio(p.audio!)}
                          className="flex items-center gap-2.5 px-3 py-2.5 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="text-xl">{flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{p.text ?? "—"}</p>
                          </div>
                          <div className="w-6 h-6 cursor-pointer rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                            <Volume2 size={11} className="text-white" />
                          </div>
                        </button>
                      ) : null
                    )}
                  </div>
                </div>

                <div className="flex w-[40%] justify-center items-center pr-5">
                  <DictionaryImage word={entry.word} />
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="meanings">
                <div className="border-b border-border px-5">
                  <TabsList className="h-auto bg-transparent p-0 gap-5 rounded-none">
                    {["meanings", "synonyms", "examples"].map((t) => (
                      <TabsTrigger
                        key={t}
                        value={t}
                        className="h-10 px-0 border-0 rounded-none border-b-2 cursor-pointer data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-600 text-muted-foreground text-sm capitalize shadow-none"
                        style={{ boxShadow: "none" }}
                      >
                        {t}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="meanings" className="mt-0 p-5 space-y-4">
                  {primaryMeaning && (
                    <div className="bg-teal-50 dark:bg-teal-950 rounded-xl p-4">
                      <p className="text-[10px] font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-3">Primary meaning</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-medium">1</div>
                        <span className={cn("text-xs font-medium", getPos(primaryMeaning.partOfSpeech).text)}>
                          {primaryMeaning.partOfSpeech}
                        </span>
                        <span className="text-[10px] font-medium bg-teal-700 text-teal-50 dark:bg-teal-400 dark:text-teal-950 px-2 py-0.5 rounded-full">most common</span>
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed">{primaryDef?.definition}</p>
                      {primaryMeaning.synonyms.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground mb-2">Synonyms:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {primaryMeaning.synonyms.slice(0, 14).map((s) => (
                              <button key={s} onClick={() => handleWordClick(s)}
                                className="text-xs text-blue-700 cursor-pointer bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
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
                      <p className="text-xs font-medium text-foreground mb-3">All meanings ({allMeanings.length - 1} more)</p>
                      <div className="space-y-2">
                        {allMeanings.slice(1).map((m, i) => {
                          const style = getPos(m.partOfSpeech);
                          const def = m.definitions[0];
                          if (!def) return null;
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium", style.bg, style.text)}>
                                  {POS_ICON[m.partOfSpeech] ?? "?"}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{i + 2}</span>
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border", style.bg, style.text, style.border)}>
                                  {m.partOfSpeech}
                                </Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground leading-snug">{def.definition}</p>
                                {def.example && <p className="text-xs text-blue-600 dark:text-blue-400 italic mt-1">Example: {def.example}</p>}
                                {m.synonyms.length > 0 && <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Synonyms: {m.synonyms.slice(0, 5).join(", ")}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="synonyms" className="mt-0 p-5">
                  {allMeanings.every((m) => !m.synonyms.length && m.definitions.every((d) => !d.synonyms.length)) ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No synonyms found.</p>
                  ) : allMeanings.map((m, i) => {
                    const syns = [...new Set([...m.synonyms, ...m.definitions.flatMap((d) => d.synonyms)])];
                    if (!syns.length) return null;
                    const style = getPos(m.partOfSpeech);
                    return (
                      <div key={i} className="mb-5">
                        <p className={cn("text-[10px] font-medium uppercase tracking-wider mb-3", style.text)}>{m.partOfSpeech}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {syns.slice(0, 18).map((s) => (
                            <button key={s} onClick={() => handleWordClick(s)}
                              className="text-xs text-blue-700 cursor-pointer bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="examples" className="mt-0 p-5 space-y-2">
                  {allMeanings.flatMap((m, mi) =>
                    m.definitions.filter((d) => d.example).map((d, di) => {
                      const style = getPos(m.partOfSpeech);
                      return (
                        <div key={`${mi}-${di}`} className="p-3.5 border border-border rounded-lg bg-card">
                          <Badge variant="outline" className={cn("text-[10px] mb-2 border", style.bg, style.text, style.border)}>
                            {m.partOfSpeech}
                          </Badge>
                          <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{d.definition}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 italic">"{d.example}"</p>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
