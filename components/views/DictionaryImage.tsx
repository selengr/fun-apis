'use client'

import { useEffect, useState } from 'react'

type ImageResult = {
  image: string | null
  thumbnail: string | null
  photographer: string | null
  photographerUrl: string | null
}

type DictionaryImageProps = {
  word: string
}

export default function DictionaryImage({ word }: DictionaryImageProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!word.trim()) {
      setSrc(null)
      return
    }

    const controller = new AbortController()

    async function fetchImage() {
      try {
        setLoading(true)
        const res = await fetch(`/api/photos?word=${encodeURIComponent(word)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setSrc(null)
          return
        }
        const data = (await res.json()) as ImageResult
        setSrc(typeof data.image === 'string' && data.image.length > 0 ? data.image : null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setSrc(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchImage()
    return () => controller.abort()
  }, [word])

  if (loading) return <ImageSkeleton />
  if (!src) return null

  return (
    <div className="relative aspect-square w-full h-32 overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={word} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

function ImageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square h-32 w-full rounded-xl bg-muted" />
    </div>
  )
}
