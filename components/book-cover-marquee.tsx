"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { resolveBookCoverImage } from "@/lib/openlibrary"
import type { BookCard } from "@/types/openlibrary"
import { cn } from "@/lib/utils"

/** Visual weight tiers — staggered columns feel alive */
const SIZE_TIERS = [
  { w: "w-[88px] md:w-[108px]", h: "h-[132px] md:h-[162px]", ring: "ring-white/10" },
  { w: "w-[104px] md:w-[128px]", h: "h-[156px] md:h-[192px]", ring: "ring-white/12" },
  { w: "w-[120px] md:w-[148px]", h: "h-[180px] md:h-[222px]", ring: "ring-white/15" },
  { w: "w-[136px] md:w-[168px]", h: "h-[204px] md:h-[252px]", ring: "ring-white/18" },
  { w: "w-[152px] md:w-[188px]", h: "h-[228px] md:h-[282px]", ring: "ring-white/20" },
] as const

/** Column heights — wave silhouette like the reference grid */
const COLUMN_COUNTS = [5, 8, 6, 9, 7, 8, 5, 9, 6, 8, 7, 5, 8, 6, 9, 7, 8, 5]

type MarqueeBook = BookCard & { coverSrc: string; coverFallback?: string }

function BookTile({
  book,
  sizeIndex,
  priority,
}: {
  book: MarqueeBook
  sizeIndex: number
  priority?: boolean
}) {
  const tier = SIZE_TIERS[sizeIndex % SIZE_TIERS.length]
  const [src, setSrc] = useState(book.coverSrc)

  useEffect(() => {
    setSrc(book.coverSrc)
  }, [book.coverSrc])

  return (
    <Link
      href={`/books?q=${encodeURIComponent(book.title)}`}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-2xl md:rounded-3xl",
        "bg-neutral-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]",
        "ring-1 transition-all duration-500 ease-out",
        "hover:z-10 hover:-translate-y-1 hover:scale-[1.04]",
        "hover:shadow-[0_28px_60px_-16px_rgba(99,102,241,0.35)]",
        tier.w,
        tier.h,
        tier.ring,
      )}
      title={book.title}
    >
      <img
        src={src}
        alt={book.title}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={() => {
          if (book.coverFallback && src !== book.coverFallback) setSrc(book.coverFallback)
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1">
        <p className="line-clamp-2 text-[10px] font-medium leading-tight text-white md:text-[11px]">
          {book.title}
        </p>
      </div>
      <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-white/10 p-1 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="size-3 text-white/90" />
      </div>
    </Link>
  )
}

function buildColumns(books: MarqueeBook[], reverse = false) {
  if (books.length === 0) return []

  const counts = reverse ? [...COLUMN_COUNTS].reverse() : COLUMN_COUNTS
  let cursor = 0

  return counts.map((count, colIndex) => {
    const column: { book: MarqueeBook; sizeIndex: number }[] = []
    for (let i = 0; i < count; i++) {
      const book = books[cursor % books.length]
      const sizeIndex = (colIndex * 3 + i * 2) % SIZE_TIERS.length
      column.push({ book, sizeIndex })
      cursor++
    }
    return column
  })
}

function MarqueeRow({
  books,
  direction,
  duration,
  reversePattern,
}: {
  books: MarqueeBook[]
  direction: "left" | "right"
  duration: number
  reversePattern?: boolean
}) {
  const columns = useMemo(
    () => buildColumns(books, reversePattern),
    [books, reversePattern],
  )

  const track = (
    <div className="flex items-end gap-3 md:gap-4 px-3 md:px-4">
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col gap-3 md:gap-4"
          style={{
            paddingBottom: colIndex % 3 === 0 ? 0 : colIndex % 3 === 1 ? 24 : 12,
            paddingTop: colIndex % 4 === 0 ? 20 : colIndex % 4 === 2 ? 36 : 0,
          }}
        >
          {column.map(({ book, sizeIndex }, i) => (
            <BookTile
              key={`${colIndex}-${i}-${book.title}`}
              book={book}
              sizeIndex={sizeIndex}
              priority={colIndex < 4 && i < 2}
            />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative flex overflow-hidden py-2">
      <div
        className="flex shrink-0 will-change-transform"
        style={{
          animation: `${direction === "left" ? "bookMarqueeLeft" : "bookMarqueeRight"} ${duration}s linear infinite`,
        }}
      >
        {track}
        {track}
      </div>
    </div>
  )
}

export function BookCoverMarquee() {
  const [books, setBooks] = useState<MarqueeBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/books?action=trending&limit=15", { cache: "no-store" })
        const json = await res.json()
        if (cancelled) return

        const mapped: MarqueeBook[] = ((json.books ?? []) as BookCard[])
          .map(book => {
            const coverSrc = resolveBookCoverImage(book, "L")
            if (!coverSrc) return null
            return {
              ...book,
              coverSrc,
              coverFallback: book.isbn
                ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`
                : undefined,
            }
          })
          .filter((b): b is MarqueeBook => b !== null)

        setBooks(mapped.length > 0 ? mapped : [])
      } catch {
        if (!cancelled) setBooks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative overflow-hidden border-y border-border bg-[#0a0a0b] py-14 md:py-20">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 30%, rgba(99,102,241,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 80% 70%, rgba(236,72,153,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 45%)
          `,
        }}
      />

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0b] to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0b] to-transparent md:w-32" />

      <div className="relative z-[1] mb-8 px-6 md:mb-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-400/80">
              Curated shelf
            </p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-tight text-white md:text-4xl">
              Psychology, code &amp; habits —{" "}
              <span className="italic text-white/55">in motion</span>
            </h2>
          </div>
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            Explore all books
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden px-6 opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 animate-pulse rounded-2xl bg-white/10"
              style={{
                width: 100 + (i % 3) * 28,
                height: 150 + (i % 4) * 36,
                marginTop: (i % 3) * 16,
              }}
            />
          ))}
        </div>
      ) : books.length === 0 ? null : (
        <div className="space-y-4 md:space-y-6 motion-reduce:[&_*]:!animate-none">
          <MarqueeRow books={books} direction="left" duration={55} />
          <MarqueeRow books={[...books].reverse()} direction="right" duration={48} reversePattern />
        </div>
      )}

      <style>{`
        @keyframes bookMarqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes bookMarqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
