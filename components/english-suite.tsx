'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, Globe2, Sparkles, Volume2, ArrowUpRight, Lock } from 'lucide-react'
import { PixelIcon } from '@/components/pixel-icon'
import { RevealText } from '@/components/reveal-text'

/* ------------------------------------------------------------------ */
/*  Card illustrations — one signature line-art SVG per tool           */
/*  All use currentColor for line work so they inherit the card's      */
/*  amber/stone text color in both light and dark mode. Accent marks   */
/*  use a fixed amber-500 (#f59e0b), which reads fine on both themes.  */
/* ------------------------------------------------------------------ */

function DictionaryArt() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" fill="none">
      {/* open book */}
      <path d="M40 56 Q140 40 196 60 L196 176 Q140 158 40 172 Z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M360 56 Q260 40 204 60 L204 176 Q260 158 360 172 Z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M196 60 L204 60" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />

      {/* left page: headword + phonetic + definition rules */}
      <text x="56" y="82" fontFamily="Georgia, serif" fontStyle="italic" fontSize="17" fill="currentColor" fillOpacity="0.85">word</text>
      <text x="100" y="82" fontFamily="Georgia, serif" fontSize="11" fill="currentColor" fillOpacity="0.45">/wɜːrd/</text>
      <line x1="56" y1="98" x2="182" y2="98" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
      <line x1="56" y1="112" x2="170" y2="112" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="56" y1="126" x2="178" y2="126" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="56" y1="140" x2="150" y2="140" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

      {/* right page: secondary entry */}
      <text x="222" y="82" fontFamily="Georgia, serif" fontStyle="italic" fontSize="14" fill="currentColor" fillOpacity="0.6">verb</text>
      <line x1="222" y1="96" x2="340" y2="96" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="222" y1="110" x2="320" y2="110" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
      <line x1="222" y1="124" x2="332" y2="124" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />

      {/* bookmark ribbon accent */}
      <path d="M300 40 L322 40 L322 76 L311 66 L300 76 Z" fill="#f59e0b" fillOpacity="0.85" />
    </svg>
  )
}

function WiktionaryArt() {
  const glyphs = [
    { ch: 'A', x: 200, y: 26 },
    { ch: 'あ', x: 300, y: 66 },
    { ch: 'Я', x: 312, y: 150 },
    { ch: 'ñ', x: 96, y: 158 },
    { ch: 'Ω', x: 82, y: 68 },
  ]
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" fill="none">
      {/* globe */}
      <circle cx="200" cy="110" r="58" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <ellipse cx="200" cy="110" rx="24" ry="58" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <ellipse cx="200" cy="110" rx="58" ry="20" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="142" y1="110" x2="258" y2="110" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="200" y1="52" x2="200" y2="168" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />

      {/* orbiting translation nodes */}
      {glyphs.map((g, i) => (
        <g key={i}>
          <line
            x1="200" y1="110" x2={g.x} y2={g.y}
            stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4"
          />
          <circle cx={g.x} cy={g.y} r="15" fill="#f59e0b" fillOpacity={i === 0 ? 0.9 : 0.22} stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1" />
          <text x={g.x} y={g.y + 5} fontFamily="Georgia, serif" fontSize="13" textAnchor="middle" fill={i === 0 ? '#1c1917' : 'currentColor'} fillOpacity={i === 0 ? 0.85 : 0.75}>
            {g.ch}
          </text>
        </g>
      ))}
    </svg>
  )
}

function GrammarArt() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" fill="none">
      {/* Reed–Kellogg style sentence diagram */}
      <line x1="70" y1="120" x2="330" y2="120" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
      <line x1="190" y1="98" x2="190" y2="142" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
      <line x1="150" y1="120" x2="150" y2="134" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />
      <line x1="260" y1="120" x2="260" y2="134" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />

      {/* modifier branches */}
      <line x1="118" y1="120" x2="90" y2="150" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.1" />
      <line x1="300" y1="120" x2="330" y2="150" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.1" />
      <line x1="220" y1="120" x2="220" y2="146" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

      {/* small labels */}
      <text x="105" y="112" fontFamily="Georgia, serif" fontSize="10" letterSpacing="1.5" fill="currentColor" fillOpacity="0.45">SUBJ</text>
      <text x="205" y="112" fontFamily="Georgia, serif" fontSize="10" letterSpacing="1.5" fill="currentColor" fillOpacity="0.45">VERB</text>
      <text x="285" y="112" fontFamily="Georgia, serif" fontSize="10" letterSpacing="1.5" fill="currentColor" fillOpacity="0.45">OBJ</text>

      {/* nib / pen accent, top-left */}
      <g transform="translate(52 44) rotate(-28)">
        <path d="M0 0 L26 0 L13 34 Z" fill="#f59e0b" fillOpacity="0.85" />
        <line x1="13" y1="6" x2="13" y2="26" stroke="#1c1917" strokeOpacity="0.3" strokeWidth="1" />
      </g>
    </svg>
  )
}

function PronunciationArt() {
  const bars = [10, 22, 34, 18, 40, 26, 14, 32, 20, 8]
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" fill="none">
      {/* soundwave rings from a source point */}
      <circle cx="66" cy="110" r="5" fill="#f59e0b" fillOpacity="0.9" />
      <circle cx="66" cy="110" r="20" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <circle cx="66" cy="110" r="34" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="66" cy="110" r="48" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

      {/* waveform bars */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={130 + i * 20}
          y={110 - h / 2}
          width="6"
          rx="3"
          height={h}
          fill="currentColor"
          fillOpacity={0.2 + (h / 40) * 0.4}
        />
      ))}

      {/* floating IPA symbols */}
      <text x="140" y="56" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="currentColor" fillOpacity="0.4">ə</text>
      <text x="300" y="70" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="currentColor" fillOpacity="0.4">ʃ</text>
      <text x="330" y="150" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="currentColor" fillOpacity="0.4">θ</text>
    </svg>
  )
}

const ENGLISH_TOOLS = [
  {
    n: '01',
    title: 'Classic Dictionary',
    desc: 'Definitions, phonetics, and examples in a refined reading experience.',
    href: '/dictionary',
    live: true,
    icon: BookOpen,
    Art: DictionaryArt,
    accent: 'from-amber-500/20 via-stone-500/5 to-transparent',
    border: 'group-hover:border-amber-500/35',
    glow: 'group-hover:shadow-[0_24px_80px_rgba(201,169,98,0.12)]',
    badge: 'Open',
  },
  {
    n: '02',
    title: 'Wiktionary',
    desc: 'Multilingual translations, native audio, etymology, and Wikipedia context.',
    href: '/wiktionary',
    live: true,
    icon: Globe2,
    Art: WiktionaryArt,
    accent: 'from-amber-600/25 via-amber-900/5 to-stone-900/10',
    border: 'group-hover:border-amber-400/40',
    glow: 'group-hover:shadow-[0_28px_90px_rgba(201,169,98,0.18)]',
    badge: 'Premium',
  },
  {
    n: '03',
    title: 'Grammar Atelier',
    desc: 'Elegant grammar guidance, tense maps, and sentence refinement.',
    href: null,
    live: false,
    icon: Sparkles,
    Art: GrammarArt,
    accent: 'from-stone-500/10 to-transparent',
    border: '',
    glow: '',
    badge: 'Soon',
  },
  {
    n: '04',
    title: 'Pronunciation Studio',
    desc: 'Immersive accent training with studio-quality voice comparisons.',
    href: null,
    live: false,
    icon: Volume2,
    Art: PronunciationArt,
    accent: 'from-stone-500/10 to-transparent',
    border: '',
    glow: '',
    badge: 'Soon',
  },
] as const

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.28em] uppercase font-sans text-amber-800/70 dark:text-amber-200/50 bg-amber-500/10 border border-amber-500/15">
      {children}
    </span>
  )
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true)
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function EnglishCard({
  tool,
  delay,
}: {
  tool: (typeof ENGLISH_TOOLS)[number]
  delay: number
}) {
  const { ref, inView } = useInView()
  const Icon = tool.icon
  const Art = tool.Art
  const inner = (
    <article
      ref={ref}
      className={`group relative flex flex-col min-h-[340px] overflow-hidden rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-gradient-to-b from-white/80 to-stone-50/60 dark:from-white/[0.04] dark:to-black/40 backdrop-blur-sm transition-all duration-500 ${tool.border} ${tool.glow} ${tool.live ? 'cursor-pointer' : 'opacity-75'}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms, box-shadow 0.4s ease, border-color 0.4s ease`,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-60 pointer-events-none`} />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        {tool.live ? (
          <span className="text-[9px] uppercase tracking-[0.25em] text-amber-700/80 dark:text-amber-300/70 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 backdrop-blur-sm">
            {tool.badge}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 backdrop-blur-sm">
            <Lock className="size-2.5" />
            {tool.badge}
          </span>
        )}
      </div>

      {/* Card illustration */}
      <div className="relative h-48 overflow-hidden pointer-events-none text-amber-800/70 dark:text-amber-200/55">
        <Art />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="size-14 rounded-2xl border border-amber-500/20 bg-white/60 dark:bg-black/40 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <Icon className="size-6 text-amber-800/70 dark:text-amber-200/60" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col px-7 pb-7 pt-3">
        <span className="font-pixel text-[10px] text-muted-foreground/50 tracking-[0.35em]">{tool.n}</span>
        <h3 className="mt-3 text-2xl font-light text-foreground tracking-tight leading-tight">
          {tool.title}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{tool.desc}</p>
        <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]">
          {tool.live ? (
            <span className="text-amber-800/80 dark:text-amber-200/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1.5">
              Enter
              <ArrowUpRight className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
          ) : (
            <span className="text-muted-foreground/50">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  )

  if (tool.href) {
    return (
      <Link href={tool.href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 rounded-2xl">
        {inner}
      </Link>
    )
  }

  return inner
}

export function EnglishSuiteSection() {
  return (
    <section
      id="english"
      className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-amber-900/10 dark:border-amber-100/10 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-amber-200/15 dark:bg-amber-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] rounded-full bg-stone-300/20 dark:bg-stone-800/15 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-16 md:mb-20">
          <PixelIcon type="workflow" size={40} />
          <div className="mt-4">
            <Tag>English Suite</Tag>
          </div>
          <RevealText className="mt-5 text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-tight leading-[1.08]">
            {'Enjoy English.'}
          </RevealText>
          <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg">
            A curated collection of language tools — from a classic dictionary to Wiktionary.
            Native pronunciation and an experience worthy of the language.
          </p>
          <div className="mt-8 h-px w-20 bg-gradient-to-r from-amber-500/60 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {ENGLISH_TOOLS.map((tool, i) => (
            <EnglishCard key={tool.n} tool={tool} delay={i * 80} />
          ))}
        </div>

      </div>
    </section>
  )
}