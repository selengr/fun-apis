'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, Globe2, Sparkles, Volume2, ArrowUpRight, Lock } from 'lucide-react'
import { PixelIcon } from '@/components/pixel-icon'
import { RevealText } from '@/components/reveal-text'

const IMAGE_MASK = {
  maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 88%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 88%)',
} as const

const ENGLISH_TOOLS = [
  {
    n: '01',
    title: 'Classic Dictionary',
    desc: 'Definitions, phonetics, and examples in a refined reading experience.',
    href: '/dictionary',
    live: true,
    icon: BookOpen,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png',
    imagePosition: 'object-top',
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png',
    imagePosition: 'object-top',
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png',
    imagePosition: 'object-top',
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png',
    imagePosition: 'object-top',
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

      {/* Card image */}
      <div className="relative h-48 overflow-hidden pointer-events-none">
        <img
          src={tool.image}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${tool.imagePosition} scale-105 group-hover:scale-110 transition-transform duration-700`}
          style={IMAGE_MASK}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
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
      id="workflow"
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

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground/50">
          Wiktionary · Free Dictionary · Wikipedia Commons
        </p>
      </div>
    </section>
  )
}
