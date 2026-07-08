export function formatUsd(n: number, compact = false) {
  if (n >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: n >= 100 ? 2 : n >= 1 ? 4 : 6,
    }).format(n)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 4,
  }).format(n)
}

export function formatPct(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
