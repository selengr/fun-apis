"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { UnsplashPhotoView } from "@/types/unsplash"

/** Compact square tiles — closer to the reference grid */
const SIZE_PX = [36, 40, 44, 48, 52] as const

const COLUMN_COUNTS = [4, 6, 5, 7, 4, 6, 5, 7, 4, 6, 5, 7, 4, 6]

const SEARCH_QUERIES = [
  "psychology brain",
  "programming code",
  "books reading",
  "science laboratory",
  "habits journal",
  "english study",
  "computer workspace",
  "mindfulness",
]

type GridPhoto = UnsplashPhotoView & { squareSrc: string }

function squareUrl(url: string, size: number) {
  const base = url.split("?")[0]
  return `${base}?auto=format&fit=crop&w=${size}&h=${size}&q=80`
}

function PhotoTile({
  photo,
  sizePx,
  priority,
}: {
  photo: GridPhoto
  sizePx: number
  priority?: boolean
}) {
  const src = squareUrl(photo.urls.small, sizePx * 2)

  return (
    <a
      href={photo.links.html}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-xl",
        "bg-neutral-950/90 ring-1 ring-border/40",
        "transition-transform duration-300 hover:scale-105 hover:ring-border/80",
      )}
      style={{ width: sizePx, height: sizePx }}
      title={photo.alt}
    >
      <img
        src={src}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover"
      />
    </a>
  )
}

function buildColumns(photos: GridPhoto[], reverse = false) {
  if (photos.length === 0) return []

  const counts = reverse ? [...COLUMN_COUNTS].reverse() : COLUMN_COUNTS
  let cursor = 0

  return counts.map((count, colIndex) => {
    const column: { photo: GridPhoto; sizePx: number }[] = []
    for (let i = 0; i < count; i++) {
      const photo = photos[cursor % photos.length]
      const sizePx = SIZE_PX[(colIndex + i) % SIZE_PX.length]
      column.push({ photo, sizePx })
      cursor++
    }
    return column
  })
}

function MarqueeRow({
  photos,
  direction,
  duration,
  reversePattern,
}: {
  photos: GridPhoto[]
  direction: "left" | "right"
  duration: number
  reversePattern?: boolean
}) {
  const columns = useMemo(
    () => buildColumns(photos, reversePattern),
    [photos, reversePattern],
  )

  const track = (
    <div className="flex items-end gap-2 px-2">
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col gap-2"
          style={{
            paddingBottom: colIndex % 3 === 1 ? 10 : 0,
            paddingTop: colIndex % 3 === 2 ? 14 : colIndex % 4 === 0 ? 6 : 0,
          }}
        >
          {column.map(({ photo, sizePx }, i) => (
            <PhotoTile
              key={`${colIndex}-${i}-${photo.id}`}
              photo={photo}
              sizePx={sizePx}
              priority={colIndex < 3 && i < 2}
            />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 will-change-transform"
        style={{
          animation: `${direction === "left" ? "unsplashMarqueeLeft" : "unsplashMarqueeRight"} ${duration}s linear infinite`,
        }}
      >
        {track}
        {track}
      </div>
    </div>
  )
}

export function BookCoverMarquee() {
  const [photos, setPhotos] = useState<GridPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results = await Promise.all(
          SEARCH_QUERIES.map(async query => {
            const params = new URLSearchParams({
              action: "search",
              query,
              orientation: "squarish",
              per_page: "8",
              order_by: "relevant",
            })
            const res = await fetch(`/api/unsplash?${params}`, { cache: "no-store" })
            if (!res.ok) return [] as UnsplashPhotoView[]
            const json = await res.json()
            return (json.photos ?? []) as UnsplashPhotoView[]
          }),
        )

        if (cancelled) return

        const merged = results.flat()
        const seen = new Set<string>()
        const unique: GridPhoto[] = []

        for (const photo of merged) {
          if (seen.has(photo.id)) continue
          seen.add(photo.id)
          unique.push({
            ...photo,
            squareSrc: squareUrl(photo.urls.small, 96),
          })
        }

        setPhotos(unique)
      } catch {
        if (!cancelled) setPhotos([])
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
    <section className="relative max-h-[500px] overflow-hidden bg-transparent py-4">
      {/* Soft edge fade — uses page background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:w-20" />

      {loading ? (
        <div className="flex max-h-[460px] gap-2 overflow-hidden px-4 opacity-30">
          {Array.from({ length: 18 }).map((_, i) => {
            const s = SIZE_PX[i % SIZE_PX.length]
            return (
              <div
                key={i}
                className="shrink-0 animate-pulse rounded-xl bg-muted"
                style={{ width: s, height: s, marginTop: (i % 3) * 8 }}
              />
            )
          })}
        </div>
      ) : photos.length === 0 ? null : (
        <div className="flex max-h-[460px] flex-col justify-center gap-3 motion-reduce:[&_*]:!animate-none">
          <MarqueeRow photos={photos} direction="left" duration={42} />
          <MarqueeRow photos={[...photos].reverse()} direction="right" duration={36} reversePattern />
        </div>
      )}

      <style>{`
        @keyframes unsplashMarqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes unsplashMarqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
