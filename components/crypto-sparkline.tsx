type SparklineProps = {
  data: number[]
  positive: boolean
  large?: boolean
}

export function Sparkline({ data, positive, large }: SparklineProps) {
  if (!data?.length) {
    return <div className={`${large ? 'h-16 w-40' : 'h-10 w-28'} bg-muted/20 rounded-lg`} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = large ? 160 : 112
  const h = large ? 64 : 40
  const id = `grad-${positive ? 'up' : 'dn'}-${data.length}`

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 6) - 3
      return `${x},${y}`
    })
    .join(' ')

  const stroke = positive ? '#34d399' : '#f87171'
  const glow = positive ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <filter id={`blur-${id}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
        </filter>
      </defs>
      <polyline
        fill={`url(#${id})`}
        stroke="none"
        points={`0,${h} ${points} ${w},${h}`}
      />
      <polyline
        fill="none"
        stroke={glow}
        strokeWidth="4"
        strokeLinecap="round"
        points={points}
        filter={`url(#blur-${id})`}
      />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
