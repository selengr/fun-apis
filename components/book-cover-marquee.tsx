"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { UnsplashPhotoView } from "@/types/unsplash"

/** Same squircle size per tile — wave comes from column height, like the reference */
const TILE_PX = 44
const TILE_GAP = 8

/** Column lengths — uneven stacks create the top/bottom wave silhouette */
const COLUMN_COUNTS = [5, 8, 6, 9, 7, 8, 5, 9, 6, 8, 7, 5, 8, 6, 9, 7, 8, 5, 6, 9, 7, 8, 5, 6]

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

/** How many API pages to prefetch per topic — then loop that pool in the marquee */
const MAX_PAGES = 5
const PER_PAGE = 10

type GridPhoto = UnsplashPhotoView & { squareSrc: string }

async function fetchSearchPage(query: string, page: number) {
  const params = new URLSearchParams({
    action: "search",
    query,
    orientation: "squarish",
    per_page: String(PER_PAGE),
    page: String(page),
    order_by: "relevant",
  })
  const res = await fetch(`/api/unsplash?${params}`, { cache: "no-store" })
  if (!res.ok) return [] as UnsplashPhotoView[]
  const json = await res.json()
  return (json.photos ?? []) as UnsplashPhotoView[]
}

async function fetchQueryPages(query: string) {
  const pages: UnsplashPhotoView[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await fetchSearchPage(query, page)
    if (batch.length === 0) break
    pages.push(...batch)
  }
  return pages
}

function squareUrl(url: string, size: number) {
  const base = url.split("?")[0]
  return `${base}?auto=format&fit=crop&w=${size}&h=${size}&q=80`
}

function PhotoTile({
  photo,
  priority,
}: {
  photo: GridPhoto
  priority?: boolean
}) {
  const src = squareUrl(photo.urls.small, TILE_PX * 2)

  return (
    <a
      href={photo.links.html}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-[14px]",
        "bg-[#141414] shadow-sm",
        "transition-transform duration-300 hover:scale-[1.06]",
      )}
      style={{ width: TILE_PX, height: TILE_PX }}
      title={photo.alt}
    >
      <img
        src={src}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
      />
    </a>
  )
}

function buildColumns(photos: GridPhoto[]) {
  if (photos.length === 0) return []

  let cursor = 0
  return COLUMN_COUNTS.map((count, colIndex) => {
    const column: GridPhoto[] = []
    for (let i = 0; i < count; i++) {
      column.push(photos[cursor % photos.length])
      cursor++
    }
    return { id: colIndex, photos: column }
  })
}

export function BookCoverMarquee() {
  const [photos, setPhotos] = useState<GridPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const columns = useMemo(() => buildColumns(photos), [photos])

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

        const seen = new Set<string>()
        const unique: GridPhoto[] = []

        for (const photo of results.flat()) {
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

  const track = (
    <div
      className="flex items-center gap-2 px-2"
      style={{ gap: TILE_GAP }}
    >
      {columns.map(col => (
        <div
          key={col.id}
          className="flex flex-col"
          style={{ gap: TILE_GAP }}
        >
          {col.photos.map((photo, i) => (
            <PhotoTile
              key={`${col.id}-${photo.id}-${i}`}
              photo={photo}
              priority={col.id < 4 && i < 2}
            />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section className="relative max-h-[500px] overflow-hidden bg-transparent py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:w-24" />

      {loading ? (
        <div className="flex items-center gap-2 overflow-hidden px-4 opacity-25">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2"
              style={{ marginTop: (i % 3) * 12 }}
            >
              {Array.from({ length: 4 + (i % 5) }).map((_, j) => (
                <div
                  key={j}
                  className="animate-pulse rounded-[14px] bg-muted"
                  style={{ width: TILE_PX, height: TILE_PX }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? null : (
        <div className="flex overflow-hidden motion-reduce:[&_*]:!animate-none">
          <div
            className="flex shrink-0 will-change-transform"
            style={{ animation: "unsplashMarqueeLeft 50s linear infinite" }}
          >
            {track}
            {track}
          </div>
        </div>
      )}

      <style>{`
        @keyframes unsplashMarqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
