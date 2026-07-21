'use client'

import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PixelIcon } from '@/components/pixel-icon'
import { RevealText } from '@/components/reveal-text'
import { cn } from '@/lib/utils'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

type Tool = {
  n: string
  title: string
  whisper: string
  desc: string
  href: string | null
  live: boolean
  image: string
  imageAlt: string
  glyph: string
  phonetic: string
  ink: string
  span: string
}

const ENGLISH_TOOLS: Tool[] = [
  {
    n: '01',
    title: 'Classic Dictionary',
    whisper: 'Look up',
    desc: 'Definitions, phonetics, and examples — a quiet reading room for every word.',
    href: '/dictionary',
    live: true,
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Open book with printed pages',
    glyph: 'Aa',
    phonetic: '/ˈwɜːrd/',
    ink: 'from-[#1a1410]/25 via-[#1a1410]/55 to-[#1a1410]/95',
    span: 'md:col-span-7 md:row-span-2 min-h-[420px] md:min-h-[520px]',
  },
  {
    n: '02',
    title: 'Wiktionary',
    whisper: 'Translate',
    desc: 'Etymology, native audio, and meanings across languages.',
    href: '/wiktionary',
    live: true,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'People learning together',
    glyph: '文',
    phonetic: 'あ · Ω · ñ',
    ink: 'from-[#0e1418]/30 via-[#0e1418]/60 to-[#0e1418]/96',
    span: 'md:col-span-5 min-h-[260px] md:min-h-[250px]',
  },
  {
    n: '03',
    title: 'Grammar Atelier',
    whisper: 'Soon',
    desc: 'Tense maps and sentence refinement.',
    href: null,
    live: false,
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80',
    imageAlt: 'Handwriting on paper',
    glyph: 'S—V',
    phonetic: 'subject · verb',
    ink: 'from-[#141210]/35 via-[#141210]/65 to-[#141210]/96',
    span: 'md:col-span-5 min-h-[240px]',
  },
  {
    n: '04',
    title: 'Pronunciation',
    whisper: 'Soon',
    desc: 'Accent training with studio voice comparisons.',
    href: null,
    live: false,
    image:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
    imageAlt: 'Studio microphone',
    glyph: 'ə',
    phonetic: '/ʃ/ · /θ/ · /æ/',
    ink: 'from-[#101018]/30 via-[#101018]/60 to-[#101018]/96',
    span: 'md:col-span-7 min-h-[240px] md:min-h-[250px]',
  },
]

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.28em] uppercase font-sans text-foreground/55 bg-foreground/[0.04] border border-foreground/10">
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
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function EnglishCard({ tool, delay }: { tool: Tool; delay: number }) {
  const { ref, inView } = useInView()
  const tall = tool.span.includes('row-span')

  const inner = (
    <article
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-[1.35rem] border border-white/10 h-full',
        tool.span,
        tool.live ? 'cursor-pointer' : 'opacity-90',
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tool.image}
        alt={tool.imageAlt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${tool.ink}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

      {/* Giant typographic watermark */}
      <div
        className={cn(
          'pointer-events-none absolute select-none text-white/[0.12] leading-none transition-all duration-700 ease-out group-hover:text-white/[0.18] group-hover:-translate-y-2 group-hover:translate-x-1',
          tall
            ? 'right-[-4%] top-[8%] text-[11rem] md:text-[14rem]'
            : 'right-[-2%] top-[4%] text-[7rem] md:text-[8.5rem]',
        )}
        style={{ fontFamily: display.style.fontFamily }}
        aria-hidden
      >
        {tool.glyph}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] tracking-[0.35em] uppercase text-white/45">
            {tool.n} · {tool.whisper}
          </span>
          {tool.live ? (
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-all duration-500 group-hover:bg-white group-hover:text-stone-900">
              <ArrowUpRight className="size-3.5" />
            </span>
          ) : (
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/35">Locked</span>
          )}
        </div>

        <div className={cn('mt-auto', tall && 'max-w-md')}>
          <p
            className="mb-3 text-sm italic text-white/55 transition-all duration-500 group-hover:text-white/80"
            style={{ fontFamily: display.style.fontFamily }}
          >
            {tool.phonetic}
          </p>
          <h3
            className={cn(
              'font-light tracking-tight text-white leading-[1.05]',
              tall ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl',
            )}
            style={{ fontFamily: display.style.fontFamily }}
          >
            {tool.title}
          </h3>
          <p
            className={cn(
              'mt-3 text-sm text-white/55 leading-relaxed',
              tall ? 'max-w-sm' : 'line-clamp-2',
            )}
          >
            {tool.desc}
          </p>
          {tool.live ? (
            <p className="mt-5 text-[10px] tracking-[0.28em] uppercase text-white/70 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
              Open tool
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )

  if (tool.href) {
    return (
      <Link
        href={tool.href}
        className={cn('block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-[1.35rem]', tool.span)}
      >
        <div className="h-full [&>article]:min-h-[inherit] [&>article]:md:min-h-[inherit]">
          {/* reset span on inner so grid placement stays on Link */}
          {(() => {
            const { span: _s, ...rest } = { span: tool.span }
            void _s
            void rest
            return null
          })()}
          <article
            ref={ref}
            className={cn(
              'group relative overflow-hidden rounded-[1.35rem] border border-white/10 h-full min-h-[inherit]',
              tool.live ? 'cursor-pointer' : 'opacity-90',
              tool.span.includes('420') && 'min-h-[420px] md:min-h-[520px]',
              tool.span.includes('260') && 'min-h-[260px] md:min-h-[250px]',
              tool.n === '03' && 'min-h-[240px]',
              tool.n === '04' && 'min-h-[240px] md:min-h-[250px]',
            )}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.image}
              alt={tool.imageAlt}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${tool.ink}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
            <div
              className={cn(
                'pointer-events-none absolute select-none text-white/[0.12] leading-none transition-all duration-700 ease-out group-hover:text-white/[0.18] group-hover:-translate-y-2 group-hover:translate-x-1',
                tall
                  ? 'right-[-4%] top-[8%] text-[11rem] md:text-[14rem]'
                  : 'right-[-2%] top-[4%] text-[7rem] md:text-[8.5rem]',
              )}
              style={{ fontFamily: display.style.fontFamily }}
              aria-hidden
            >
              {tool.glyph}
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] tracking-[0.35em] uppercase text-white/45">
                  {tool.n} · {tool.whisper}
                </span>
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-all duration-500 group-hover:bg-white group-hover:text-stone-900">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
              <div className={cn('mt-auto', tall && 'max-w-md')}>
                <p
                  className="mb-3 text-sm italic text-white/55 transition-all duration-500 group-hover:text-white/80"
                  style={{ fontFamily: display.style.fontFamily }}
                >
                  {tool.phonetic}
                </p>
                <h3
                  className={cn(
                    'font-light tracking-tight text-white leading-[1.05]',
                    tall ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl',
                  )}
                  style={{ fontFamily: display.style.fontFamily }}
                >
                  {tool.title}
                </h3>
                <p
                  className={cn(
                    'mt-3 text-sm text-white/55 leading-relaxed',
                    tall ? 'max-w-sm' : 'line-clamp-2',
                  )}
                >
                  {tool.desc}
                </p>
                <p className="mt-5 text-[10px] tracking-[0.28em] uppercase text-white/70 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  Open tool
                </p>
              </div>
            </div>
          </article>
        </div>
      </Link>
    )
  }

  return inner
}

export function EnglishSuiteSection() {
  return (
    <section
      id="english"
      className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-border overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-24 left-0 w-[420px] h-[420px] rounded-full bg-stone-400/10 dark:bg-white/[0.03] blur-[110px]" />
        <div className="absolute bottom-0 right-10 w-[380px] h-[300px] rounded-full bg-sky-900/5 dark:bg-sky-400/[0.04] blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-14 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4">
              <Tag>English Suite</Tag>
            </div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-[3.4rem] font-light tracking-tight leading-[1.08]">
              {'Enjoy English.'}
            </RevealText>
            <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
              Language tools dressed like posters — dictionary and Wiktionary live now.
            </p>
          </div>
          <p
            className="hidden md:block text-6xl lg:text-7xl italic text-foreground/[0.07] leading-none select-none"
            style={{ fontFamily: display.style.fontFamily }}
            aria-hidden
          >
            lexicon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 auto-rows-fr">
          {ENGLISH_TOOLS.map((tool, i) => (
            <EnglishCard key={tool.n} tool={tool} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  )
}
