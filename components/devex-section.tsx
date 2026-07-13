"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Dices, Loader2 } from "lucide-react"
import { SpinWheel } from "@/components/jokes-hub"
import type { Joke, JokeResponse } from "@/types/jokeapi"
import type { PoetryPoem } from "@/types/poetry"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    num: "01",
    title: "Cat Facts",
    desc: "Curious truths about cats",
    label: "catfact.ninja",
    moreHref: "/animal-facts",
    moreLabel: "More animal facts",
    spinLabel: "Spin for a cat fact",
  },
  {
    num: "02",
    title: "Dog Facts",
    desc: "Loyal lore about dogs",
    label: "dog-facts api",
    moreHref: "/animal-facts",
    moreLabel: "More animal facts",
    spinLabel: "Spin for a dog fact",
  },
  {
    num: "03",
    title: "Jokes",
    desc: "Spin for a laugh",
    label: "jokeapi",
    moreHref: "/jokes",
    moreLabel: "More jokes",
    spinLabel: "Spin for a joke",
  },
  {
    num: "04",
    title: "Poetry",
    desc: "A verse for the moment",
    label: "poetrydb",
    moreHref: "/poetry",
    moreLabel: "More poetry",
    spinLabel: "Spin for a poem",
  },
] as const

const PANEL_H = "h-[360px]"

const CAT_SEGMENTS = [
  { emoji: "🐱", color: "#fb7185" },
  { emoji: "😺", color: "#f472b6" },
  { emoji: "🐈", color: "#e879f9" },
  { emoji: "🐈‍⬛", color: "#a78bfa" },
  { emoji: "😸", color: "#f9a8d4" },
  { emoji: "😻", color: "#fda4af" },
]

const DOG_SEGMENTS = [
  { emoji: "🐶", color: "#f59e0b" },
  { emoji: "🐕", color: "#d97706" },
  { emoji: "🦮", color: "#ea580c" },
  { emoji: "🐕‍🦺", color: "#b45309" },
  { emoji: "🐩", color: "#fbbf24" },
  { emoji: "🐺", color: "#78716c" },
]

const POEM_SEGMENTS = [
  { emoji: "📜", color: "#a78bfa" },
  { emoji: "🪶", color: "#818cf8" },
  { emoji: "✨", color: "#c084fc" },
  { emoji: "🌙", color: "#6366f1" },
  { emoji: "📖", color: "#e879f9" },
  { emoji: "💫", color: "#8b5cf6" },
]

type WheelSegment = { emoji: string; color: string }

function ThemeSpinWheel({
  segments,
  spinning,
  landedIndex,
  onSpin,
}: {
  segments: WheelSegment[]
  spinning: boolean
  landedIndex: number | null
  onSpin: () => void
}) {
  const slice = 360 / segments.length
  const wheelGradient = `conic-gradient(from -90deg, ${segments
    .map((seg, i) => `${seg.color} ${i * slice}deg ${(i + 1) * slice}deg`)
    .join(", ")})`

  return (
    <button
      type="button"
      onClick={onSpin}
      disabled={spinning}
      aria-label="Spin"
      className="relative size-24 shrink-0 cursor-pointer disabled:cursor-not-allowed"
    >
      <motion.div
        animate={{
          rotate: spinning
            ? 1080 + Math.random() * 360
            : landedIndex != null
              ? landedIndex * slice
              : 0,
        }}
        transition={{
          duration: spinning ? 2.2 : 0.5,
          ease: spinning ? [0.2, 0.8, 0.2, 1] : "easeOut",
        }}
        className="absolute inset-0 rounded-full border-2 border-white/40 dark:border-white/10 overflow-hidden shadow-inner"
        style={{ transformOrigin: "center", background: wheelGradient }}
      >
        {segments.map((seg, i) => {
          const angle = slice * i + slice / 2
          return (
            <div
              key={`${seg.emoji}-${i}`}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span className="text-sm mt-1.5 drop-shadow-sm select-none">{seg.emoji}</span>
            </div>
          )
        })}
        <div className="absolute inset-2.5 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm">
          <span className="text-lg">
            {landedIndex != null ? segments[landedIndex]?.emoji ?? "✦" : "✦"}
          </span>
        </div>
      </motion.div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-amber-500 z-10 pointer-events-none" />
    </button>
  )
}

function isJoke(data: JokeResponse): data is Joke {
  return !data.error && "id" in data && !("jokes" in data)
}

function jokeText(joke: Joke | null) {
  if (!joke) return ""
  if (joke.type === "twopart") return `${joke.setup}\n\n${joke.delivery}`
  return joke.joke ?? ""
}

export function DevExSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)

  const [catFact, setCatFact] = useState("")
  const [dogFact, setDogFact] = useState("")
  const [joke, setJoke] = useState<Joke | null>(null)
  const [poem, setPoem] = useState<PoetryPoem | null>(null)

  const [catLoading, setCatLoading] = useState(false)
  const [dogLoading, setDogLoading] = useState(false)
  const [jokeLoading, setJokeLoading] = useState(false)
  const [poemLoading, setPoemLoading] = useState(false)

  const [jokeSpinning, setJokeSpinning] = useState(false)
  const [jokeLanded, setJokeLanded] = useState<string | null>(null)
  const [catSpinning, setCatSpinning] = useState(false)
  const [catLanded, setCatLanded] = useState<number | null>(null)
  const [dogSpinning, setDogSpinning] = useState(false)
  const [dogLanded, setDogLanded] = useState<number | null>(null)
  const [poemSpinning, setPoemSpinning] = useState(false)
  const [poemLanded, setPoemLanded] = useState<number | null>(null)

  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSwapRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTransitions = useCallback(() => {
    if (transitionRef.current) {
      clearTimeout(transitionRef.current)
      transitionRef.current = null
    }
    if (autoSwapRef.current) {
      clearTimeout(autoSwapRef.current)
      autoSwapRef.current = null
    }
  }, [])

  const stopAuto = useCallback(() => {
    clearTransitions()
    setAutoPlay(false)
    setVisible(true)
  }, [clearTransitions])

  const goToStep = useCallback(
    (i: number) => {
      clearTransitions()
      setVisible(false)
      transitionRef.current = setTimeout(() => {
        setActive(i)
        setVisible(true)
        transitionRef.current = null
      }, 180)
    },
    [clearTransitions],
  )

  const fetchCat = useCallback(async () => {
    setCatLoading(true)
    try {
      const res = await fetch("https://catfact.ninja/fact", { cache: "no-store" })
      if (!res.ok) throw new Error("cat failed")
      const data = await res.json()
      setCatFact(data.fact ?? "")
    } catch {
      setCatFact("Could not fetch a cat fact. Try again.")
    } finally {
      setCatLoading(false)
    }
  }, [])

  const fetchDog = useCallback(async () => {
    setDogLoading(true)
    try {
      const res = await fetch("/api/dog-facts", { cache: "no-store" })
      if (!res.ok) throw new Error("dog failed")
      const data = await res.json()
      if (data?.error) throw new Error(data.error)
      const fact = Array.isArray(data) ? data[0]?.fact : data?.fact
      setDogFact(fact || "No dog fact found.")
    } catch {
      setDogFact("Could not fetch a dog fact. Try again.")
    } finally {
      setDogLoading(false)
    }
  }, [])

  const fetchJoke = useCallback(async (category = "Any") => {
    setJokeLoading(true)
    try {
      const res = await fetch(`/api/jokes?category=${encodeURIComponent(category)}`, {
        cache: "no-store",
      })
      const json: JokeResponse = await res.json()
      if (!res.ok || !isJoke(json)) throw new Error("joke failed")
      setJoke(json)
    } catch {
      setJoke(null)
    } finally {
      setJokeLoading(false)
    }
  }, [])

  const fetchPoem = useCallback(async (next = false) => {
    setPoemLoading(true)
    try {
      const action = next ? "next" : "today"
      const res = await fetch(`/api/poetry?action=${action}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.poem) throw new Error("poem failed")
      setPoem(data.poem as PoetryPoem)
    } catch {
      setPoem(null)
    } finally {
      setPoemLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCat()
    void fetchDog()
    void fetchJoke()
    void fetchPoem()
  }, [fetchCat, fetchDog, fetchJoke, fetchPoem])

  function selectStep(i: number) {
    clearTransitions()
    setAutoPlay(false)
    if (i === active) {
      setVisible(true)
      return
    }
    goToStep(i)
  }

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(() => {
      setVisible(false)
      autoSwapRef.current = setTimeout(() => {
        setActive((prev) => (prev + 1) % STEPS.length)
        setVisible(true)
        autoSwapRef.current = null
      }, 180)
    }, 4200)
    return () => {
      clearInterval(interval)
      if (autoSwapRef.current) {
        clearTimeout(autoSwapRef.current)
        autoSwapRef.current = null
      }
    }
  }, [autoPlay])

  useEffect(() => {
    return () => clearTransitions()
  }, [clearTransitions])

  const runSpin = (
    spinning: boolean,
    setSpinning: (v: boolean) => void,
    setLanded: (v: number | null) => void,
    segmentCount: number,
    onDone: () => void | Promise<void>,
  ) => {
    if (spinning) return
    stopAuto()
    setSpinning(true)
    setLanded(null)
    const landed = Math.floor(Math.random() * segmentCount)
    setTimeout(async () => {
      setLanded(landed)
      setSpinning(false)
      await onDone()
    }, 2200)
  }

  const spinCat = () =>
    runSpin(catSpinning, setCatSpinning, setCatLanded, CAT_SEGMENTS.length, fetchCat)

  const spinDog = () =>
    runSpin(dogSpinning, setDogSpinning, setDogLanded, DOG_SEGMENTS.length, fetchDog)

  const spinPoem = () =>
    runSpin(poemSpinning, setPoemSpinning, setPoemLanded, POEM_SEGMENTS.length, () =>
      fetchPoem(true),
    )

  const spinForJoke = async () => {
    if (jokeSpinning) return
    stopAuto()
    setJokeSpinning(true)
    setJokeLanded(null)
    const cats = ["Programming", "Pun", "Misc", "Dark", "Spooky", "Christmas"]
    const landed = cats[Math.floor(Math.random() * cats.length)]
    setTimeout(async () => {
      setJokeLanded(landed)
      setJokeSpinning(false)
      await fetchJoke(landed)
    }, 2200)
  }

  const step = STEPS[active]
  const spinningNow =
    (active === 0 && catSpinning) ||
    (active === 1 && dogSpinning) ||
    (active === 2 && jokeSpinning) ||
    (active === 3 && poemSpinning)

  const contentLoading =
    (active === 0 && catLoading && !catFact) ||
    (active === 1 && dogLoading && !dogFact) ||
    (active === 2 && jokeLoading && !joke) ||
    (active === 3 && poemLoading && !poem)

  return (
    <section id="devex" className="py-32 px-6 md:px-12 lg:px-20 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-[10px] tracking-widest text-muted-foreground uppercase">
            Diversions
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05] text-foreground">
            Facts, jokes &amp; verse.<br />
            Take a breath.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
          <div className={cn("flex flex-col gap-3", PANEL_H)}>
            {STEPS.map((s, i) => {
              const selected = active === i
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => selectStep(i)}
                  className={cn(
                    "flex-1 min-h-0 text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden",
                    selected
                      ? "bg-muted border-foreground/25 shadow-sm ring-1 ring-foreground/10"
                      : "bg-card/70 border-border hover:bg-muted/40",
                  )}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200",
                        selected
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {s.num}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-light transition-colors duration-200",
                          selected ? "text-foreground" : "text-foreground/70",
                        )}
                      >
                        {s.title}
                      </p>
                      <p className="text-xs mt-0.5 text-muted-foreground line-clamp-1">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div
            className={cn(
              "lg:col-span-2 rounded-2xl border border-border bg-card/70 p-6 md:p-8 flex flex-col overflow-hidden",
              PANEL_H,
            )}
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div
                className="text-[10px] tracking-widest uppercase text-muted-foreground transition-all duration-200"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(4px)",
                  transition: "opacity 200ms ease, filter 200ms ease",
                }}
              >
                {step.label}
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, d) => (
                  <button
                    key={d}
                    type="button"
                    aria-label={`Go to step ${d + 1}`}
                    onClick={() => selectStep(d)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                      d === active ? "bg-foreground/50" : "bg-muted-foreground/25",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-border bg-muted/40 p-5 flex flex-col overflow-hidden">
              <div
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(6px)",
                  transform: visible ? "translateY(0)" : "translateY(6px)",
                  transition:
                    "opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="flex flex-row gap-4 items-center flex-1 min-h-0 overflow-hidden">
                  {active === 0 && (
                    <ThemeSpinWheel
                      segments={CAT_SEGMENTS}
                      spinning={catSpinning}
                      landedIndex={catLanded}
                      onSpin={spinCat}
                    />
                  )}
                  {active === 1 && (
                    <ThemeSpinWheel
                      segments={DOG_SEGMENTS}
                      spinning={dogSpinning}
                      landedIndex={dogLanded}
                      onSpin={spinDog}
                    />
                  )}
                  {active === 2 && (
                    <SpinWheel
                      compact
                      hideButton
                      spinning={jokeSpinning}
                      landed={jokeLanded}
                      onSpin={spinForJoke}
                    />
                  )}
                  {active === 3 && (
                    <ThemeSpinWheel
                      segments={POEM_SEGMENTS}
                      spinning={poemSpinning}
                      landedIndex={poemLanded}
                      onSpin={spinPoem}
                    />
                  )}

                  <div className="flex-1 min-w-0 min-h-0 overflow-y-auto self-stretch flex flex-col justify-center py-0.5">
                    {contentLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : active === 2 ? (
                      <p className="text-[13px] leading-relaxed text-foreground/80 whitespace-pre-line font-light">
                        {jokeText(joke) || "Spin the wheel for a joke."}
                      </p>
                    ) : active === 3 ? (
                      poem ? (
                        <>
                          <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-2 shrink-0">
                            {poem.title}
                            <span className="opacity-50"> · </span>
                            {poem.author}
                          </p>
                          <div className="space-y-1">
                            {poem.lines.slice(0, 8).map((line, i) => (
                              <p
                                key={i}
                                className="text-[13px] leading-relaxed text-foreground/80 font-light italic"
                              >
                                {line || "\u00A0"}
                              </p>
                            ))}
                            {poem.lines.length > 8 && (
                              <p className="text-[11px] text-muted-foreground pt-1">…</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Spin for a poem.</p>
                      )
                    ) : (
                      <p className="text-[13px] md:text-[14px] leading-relaxed text-foreground/80 font-light">
                        {active === 0 ? catFact : dogFact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (active === 0) spinCat()
                      else if (active === 1) spinDog()
                      else if (active === 2) void spinForJoke()
                      else spinPoem()
                    }}
                    disabled={spinningNow}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-[11px] tracking-wide hover:from-amber-500/25 hover:to-orange-500/15 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Dices className={`size-3.5 ${spinningNow ? "animate-spin" : ""}`} />
                    {spinningNow ? "Spinning…" : step.spinLabel}
                  </button>

                  <Link
                    href={step.moreHref}
                    onClick={stopAuto}
                    className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  >
                    {step.moreLabel}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
