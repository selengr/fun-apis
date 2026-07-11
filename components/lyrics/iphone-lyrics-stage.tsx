'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Share2,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Check,
  Signal,
  Wifi,
  Battery,
} from 'lucide-react'
import type { LyricsResult } from '@/types/lyrics'
import { shareText } from '@/lib/lyrics'
import { cn } from '@/lib/utils'

interface IPhoneLyricsStageProps {
  result: LyricsResult | null
  loading: boolean
  error: string | null
}

function gradientFor(artist: string, title: string) {
  let h = 0
  for (const c of `${artist}${title}`) h = (h * 31 + c.charCodeAt(0)) % 360
  return `linear-gradient(145deg, hsl(${h} 45% 42%) 0%, hsl(${(h + 40) % 360} 55% 28%) 50%, hsl(${(h + 80) % 360} 40% 18%) 100%)`
}

export function IPhoneLyricsStage({ result, loading, error }: IPhoneLyricsStageProps) {
  const [stageDark, setStageDark] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = async () => {
    if (!shellRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await shellRef.current.requestFullscreen()
    }
  }

  const copyLyrics = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.lyrics)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* cancelled */ }
  }

  const shareLyrics = async () => {
    if (!result) return
    const text = shareText(result)
    try {
      if (navigator.share) {
        await navigator.share({ title: `${result.title} — ${result.artist}`, text })
      } else {
        await navigator.clipboard.writeText(text)
      }
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* cancelled */ }
  }

  const bg = result ? gradientFor(result.artist, result.title) : undefined

  return (
    <div
      ref={shellRef}
      className={cn(
        'relative mx-auto w-full max-w-[340px] transition-all duration-500',
        fullscreen && 'max-w-none flex items-center justify-center min-h-screen bg-black p-6',
      )}
    >
      {/* Device shadow */}
      <div
        className={cn(
          'absolute inset-x-6 bottom-[-18px] h-8 rounded-[100%] bg-black/25 blur-2xl',
          fullscreen && 'hidden',
        )}
        aria-hidden
      />

      {/* iPhone frame */}
      <div
        className={cn(
          'relative overflow-hidden rounded-[3rem] p-[10px]',
          'bg-gradient-to-b from-[#3a3a3c] via-[#1c1c1e] to-[#0a0a0a]',
          'shadow-[0_50px_100px_-30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]',
          'ring-1 ring-white/10',
          fullscreen ? 'w-full max-w-[390px]' : 'w-full',
        )}
      >
        {/* Side buttons (decorative) */}
        <div className="absolute left-[-2px] top-[28%] h-8 w-[3px] rounded-l bg-[#2c2c2e]" aria-hidden />
        <div className="absolute left-[-2px] top-[38%] h-14 w-[3px] rounded-l bg-[#2c2c2e]" aria-hidden />
        <div className="absolute left-[-2px] top-[52%] h-14 w-[3px] rounded-l bg-[#2c2c2e]" aria-hidden />
        <div className="absolute right-[-2px] top-[42%] h-20 w-[3px] rounded-r bg-[#2c2c2e]" aria-hidden />

        {/* Screen */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[2.35rem]',
            'min-h-[620px] flex flex-col',
            stageDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f2f2f7] text-[#1c1c1e]',
          )}
        >
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 z-30 -translate-x-1/2 h-[26px] w-[100px] rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

          {/* Status bar */}
          <div className="relative z-20 flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold tracking-tight">
            <span className="tabular-nums">9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="size-3" />
              <Wifi className="size-3" />
              <Battery className="size-3.5" />
            </div>
          </div>

          {/* Album art / gradient header */}
          <div
            className="relative mx-4 mt-6 aspect-square max-h-[180px] overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: bg ?? 'linear-gradient(145deg, #6366f1, #312e81)' }}
          >
            <div className="absolute inset-0 bg-black/20" />
            {result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Now playing</p>
                <p className="mt-2 text-xl font-semibold leading-tight drop-shadow-md line-clamp-2">
                  {result.title}
                </p>
                <p className="mt-1 text-sm opacity-80">{result.artist}</p>
              </div>
            )}
            {!result && !loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                Search a song
              </div>
            )}
          </div>

          {/* Lyrics body */}
          <div className="relative flex-1 min-h-[280px] mt-5 px-5 pb-24">
            {loading && (
              <div className="space-y-3 pt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-3 animate-pulse rounded-full',
                      stageDark ? 'bg-white/10' : 'bg-black/8',
                      i % 3 === 0 ? 'w-[85%]' : i % 3 === 1 ? 'w-full' : 'w-[70%]',
                    )}
                  />
                ))}
              </div>
            )}

            {error && !loading && (
              <p
                className={cn(
                  'pt-8 text-center text-[15px] leading-relaxed font-light',
                  stageDark ? 'text-white/50' : 'text-black/45',
                )}
              >
                {error}
              </p>
            )}

            <AnimatePresence mode="wait">
              {result && !loading && (
                <motion.div
                  key={`${result.artist}-${result.title}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-full max-h-[320px] overflow-y-auto scrollbar-thin pr-1"
                >
                  <div className="space-y-1 py-2">
                    {result.lines.map((line, i) =>
                      line === '' ? (
                        <div key={i} className="h-4" />
                      ) : (
                        <p
                          key={i}
                          className={cn(
                            'text-[17px] leading-[1.55] font-light tracking-[-0.01em] transition-colors duration-300',
                            stageDark ? 'text-white/55 hover:text-white/90' : 'text-black/45 hover:text-black/80',
                            i === 0 && (stageDark ? 'text-white text-[19px] font-normal' : 'text-black text-[19px] font-normal'),
                          )}
                        >
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && !loading && !error && (
              <p
                className={cn(
                  'pt-10 text-center text-sm font-light leading-relaxed',
                  stageDark ? 'text-white/35' : 'text-black/35',
                )}
              >
                Enter artist & song above.
                <br />
                Read along — great for English practice.
              </p>
            )}
          </div>

          {/* iOS-style bottom bar */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 z-20 border-t backdrop-blur-xl',
              stageDark
                ? 'border-white/10 bg-black/75'
                : 'border-black/8 bg-white/80',
            )}
          >
            <div className="flex items-center justify-around px-2 py-3">
              <StageAction
                label="Copy"
                onClick={() => void copyLyrics()}
                disabled={!result}
                dark={stageDark}
                active={copied}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </StageAction>
              <StageAction
                label="Share"
                onClick={() => void shareLyrics()}
                disabled={!result}
                dark={stageDark}
                active={shared}
              >
                <Share2 className="size-4" />
              </StageAction>
              <StageAction
                label={stageDark ? 'Light' : 'Dark'}
                onClick={() => setStageDark(d => !d)}
                dark={stageDark}
              >
                {stageDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </StageAction>
              <StageAction
                label={fullscreen ? 'Exit' : 'Full'}
                onClick={() => void toggleFullscreen()}
                dark={stageDark}
              >
                {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </StageAction>
            </div>
            <div className="mx-auto mb-2 h-1 w-28 rounded-full bg-white/20" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}

function StageAction({
  label,
  onClick,
  disabled,
  dark,
  active,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  dark: boolean
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 min-w-[56px] py-1 rounded-xl transition-all cursor-pointer disabled:opacity-30',
        active
          ? dark
            ? 'text-emerald-400'
            : 'text-emerald-600'
          : dark
            ? 'text-white/70 hover:text-white'
            : 'text-black/55 hover:text-black',
      )}
    >
      {children}
      <span className="text-[9px] font-medium tracking-wide">{label}</span>
    </button>
  )
}
