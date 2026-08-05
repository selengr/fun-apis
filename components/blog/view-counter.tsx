'use client'

import { useEffect, useRef, useState } from 'react'

export function ViewCounter({
  pageId,
  initial,
}: {
  pageId: string
  initial: number
}) {
  const [views, setViews] = useState(initial)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, current: initial }),
    })
      .then(r => r.json())
      .then(data => {
        if (typeof data.views === 'number') setViews(data.views)
      })
      .catch(() => {})
  }, [pageId, initial])

  return <span>{views} views</span>
}
