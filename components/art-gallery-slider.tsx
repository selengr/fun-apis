"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtworkCard } from "./artwork-card"
import { NavigationDots } from "./navigation-dots"
import { artworks as mockArtworks } from "@/_mockes/artworks"
import { useSliderNavigation } from "@/hooks/use-slider-navigation"
import { useSliderDrag } from "@/hooks/use-slider-drag"
import { useSliderWheel } from "@/hooks/use-slider-wheel"
import { useColorExtraction, useCurrentColors } from "@/hooks/use-color-extraction"
import type { Artwork } from "@/types/artwork"
import { booksToSlides } from "@/lib/book-slides"
import type { BookCard } from "@/types/openlibrary"

interface ArtGallerySliderProps {
  /** When true, fetches trending books from Open Library */
  variant?: "art" | "books"
  items?: Artwork[]
  onItemSelect?: (item: Artwork) => void
}

export function ArtGallerySlider({
  variant = "art",
  items: itemsProp,
  onItemSelect,
}: ArtGallerySliderProps) {
  const router = useRouter()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [bookSlides, setBookSlides] = useState<Artwork[]>([])
  const [booksLoading, setBooksLoading] = useState(variant === "books")
  const [slideWidth, setSlideWidth] = useState(432)

  useEffect(() => {
    // step = card width + gap → 350 + 64 (desktop) / 300 + 32 (mobile)
    const update = () => setSlideWidth(window.innerWidth > 768 ? 414 : 332)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (variant !== "books") return

    let cancelled = false
    const ctrl = new AbortController()

    async function load(attempt = 0) {
      setBooksLoading(true)
      try {
        const res = await fetch(`/api/books?action=trending&limit=15&t=${Date.now()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        })
        const json = await res.json()
        const slides = booksToSlides((json.books ?? []) as BookCard[])
        if (cancelled) return

        if (slides.length === 0 && attempt < 1) {
          // One quick retry — OL is flaky behind some VPNs
          await new Promise(r => setTimeout(r, 600))
          if (!cancelled) return load(attempt + 1)
        }

        setBookSlides(slides)
      } catch {
        if (cancelled || ctrl.signal.aborted) return
        if (attempt < 1) {
          await new Promise(r => setTimeout(r, 600))
          if (!cancelled) return load(attempt + 1)
        }
        // API always returns curated fallback now; keep empty only if aborted
        setBookSlides([])
      } finally {
        if (!cancelled) setBooksLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [variant])

  const items =
    itemsProp ?? (variant === "books" ? bookSlides : mockArtworks)

  const { currentIndex, goToNext, goToPrev, goToSlide } = useSliderNavigation({
    totalSlides: Math.max(items.length, 1),
    enableKeyboard: true,
  })

  const { isDragging, dragX, handleDragStart, handleDragMove, handleDragEnd } = useSliderDrag({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  })

  useSliderWheel({
    sliderRef,
    onScrollLeft: goToNext,
    onScrollRight: goToPrev,
  })

  const colors = useColorExtraction(items)
  const currentColors = useCurrentColors(colors, items[currentIndex]?.id)

  const handleSelect = useCallback(
    (artwork: Artwork) => {
      if (onItemSelect) {
        onItemSelect(artwork)
        return
      }
      if (artwork.searchQuery) {
        router.push(`/books?q=${encodeURIComponent(artwork.searchQuery)}`)
      }
    },
    [onItemSelect, router],
  )

  const isBooks = variant === "books"

  return (
    <div className="relative h-full w-full overflow-hidden bg-black py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, ${currentColors[0]}66 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, ${currentColors[1]}66 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${currentColors[2]}44 0%, transparent 70%),
              linear-gradient(180deg, #0a0a0a 0%, #111111 100%)
            `,
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 backdrop-blur-3xl" />

      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {isBooks ? (
            <div>
              <h2 className="font-serif text-2xl md:text-4xl font-light tracking-tight text-white/90 max-w-md leading-snug">
                Find a book worth
                <span className="block italic text-white/60">reading tonight</span>
              </h2>
            </div>
          ) : (
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white/90">Gallery</h1>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {isBooks && (
            <Link
              href="/books"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white transition-colors"
            >
              All books
              <ArrowRight className="size-3" />
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="text-sm text-white/60">{String(currentIndex + 1).padStart(2, "0")}</span>
            <span className="text-white/30">/</span>
            <span className="text-sm text-white/40">{String(items.length).padStart(2, "0")}</span>
          </div>
        </motion.div>
      </header>

      {booksLoading ? (
        <div className="relative flex h-full min-h-[420px] w-full items-center">
          <div className="flex items-center gap-8 px-[calc(50vw-150px)] md:gap-16 md:px-[calc(50vw-175px)]">
            <Skeleton className="h-[300px] w-[300px] shrink-0 rounded-2xl bg-white/8 opacity-40 md:h-[350px] md:w-[350px]" />
            <div className="relative shrink-0">
              <Skeleton className="h-[300px] w-[300px] rounded-2xl bg-white/12 md:h-[350px] md:w-[350px]" />
              <div className="absolute inset-x-3 bottom-3 space-y-2 p-6">
                <Skeleton className="h-3 w-12 rounded bg-white/10" />
                <Skeleton className="h-7 w-48 rounded-lg bg-white/12 md:h-8 md:w-56" />
                <Skeleton className="h-4 w-32 rounded bg-white/8" />
              </div>
            </div>
            <Skeleton className="h-[300px] w-[300px] shrink-0 rounded-2xl bg-white/8 opacity-40 md:h-[350px] md:w-[350px]" />
          </div>
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-2 rounded-full bg-white/20 ${i === 2 ? "w-6" : "w-2"}`}
              />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-full min-h-[420px] items-center justify-center text-white/40 text-sm">
          No books with covers found
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="relative flex h-full w-full cursor-grab items-center active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <motion.div
            className="flex items-center gap-8 px-[calc(50vw-150px)] md:gap-16 md:px-[calc(50vw-175px)]"
            animate={{
              x: -currentIndex * slideWidth + dragX,
            }}
            transition={isDragging ? { duration: 0 } : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            {items.map((artwork, index) => (
              <ArtworkCard
                key={`${artwork.id}-${artwork.title}`}
                artwork={artwork}
                isActive={index === currentIndex}
                dragOffset={dragX}
                index={index}
                currentIndex={currentIndex}
                onSelect={isBooks || artwork.searchQuery ? handleSelect : undefined}
              />
            ))}
          </motion.div>
        </div>
      )}

      {!booksLoading && items.length > 0 && (
        <NavigationDots total={items.length} current={currentIndex} onSelect={goToSlide} colors={currentColors} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-8 hidden items-center gap-3 text-white/30 md:flex"
      >
        <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">←</kbd>
        <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">→</kbd>
        <span className="text-xs">{isBooks ? "" : "navigate"}</span>
      </motion.div>
    </div>
  )
}
