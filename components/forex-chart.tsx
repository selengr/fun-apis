'use client'

import { useMemo } from 'react'

type Point = { date: string; rate: number }

type ForexChartProps = {
  data: Point[]
  positive: boolean
  height?: number
}

function formatAxisDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ForexChart({ data, positive, height = 280 }: ForexChartProps) {
  const { path, areaPath, labels, min, max } = useMemo(() => {
    if (!data.length) return { path: '', areaPath: '', labels: [] as { x: number; label: string }[], min: 0, max: 0 }

    const w = 800
    const h = height
    const padX = 8
    const padY = 16
    const rates = data.map(d => d.rate)
    const minR = Math.min(...rates)
    const maxR = Math.max(...rates)
    const range = maxR - minR || maxR * 0.01 || 1

    const pts = data.map((d, i) => {
      const x = padX + (i / Math.max(data.length - 1, 1)) * (w - padX * 2)
      const y = padY + (1 - (d.rate - minR) / range) * (h - padY * 2)
      return { x, y, date: d.date, rate: d.rate }
    })

    const line = pts.map(p => `${p.x},${p.y}`).join(' ')
    const area = `M${padX},${h - padY} L${pts.map(p => `${p.x},${p.y}`).join(' L')} L${w - padX},${h - padY} Z`

    const labelCount = Math.min(5, data.length)
    const step = Math.max(1, Math.floor((data.length - 1) / (labelCount - 1)))
    const labels = pts
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map(p => ({ x: p.x, label: formatAxisDate(p.date) }))

    return { path: line, areaPath: area, labels, min: minR, max: maxR }
  }, [data, height])

  if (!data.length) {
    return (
      <div
        className="w-full rounded-xl bg-muted/20 animate-pulse"
        style={{ height }}
      />
    )
  }

  const stroke = positive ? '#2d9a64' : '#e05548'
  const gradId = `forex-grad-${positive ? 'up' : 'dn'}`

  return (
    <div className="w-full">
      <div
        className="flex justify-between text-[10px] tabular-nums mb-2 px-1"
        style={{ color: 'var(--fx-mute, var(--muted-foreground))' }}
      >
        <span>Low {min.toFixed(4)}</span>
        <span>High {max.toFixed(4)}</span>
      </div>
      <svg
        viewBox={`0 0 800 ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={path}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative h-5 mt-1">
        {labels.map(l => (
          <span
            key={l.label + l.x}
            className="absolute text-[10px] -translate-x-1/2 tabular-nums"
            style={{
              left: `${(l.x / 800) * 100}%`,
              color: 'var(--fx-mute, var(--muted-foreground))',
            }}
          >
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
