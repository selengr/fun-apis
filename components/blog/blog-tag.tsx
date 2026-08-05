const PALETTE = [
  { bg: 'bg-sky-500/12', text: 'text-sky-800 dark:text-sky-200', border: 'border-sky-500/20' },
  { bg: 'bg-emerald-500/12', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-500/20' },
  { bg: 'bg-amber-500/14', text: 'text-amber-900 dark:text-amber-100', border: 'border-amber-500/25' },
  { bg: 'bg-rose-500/12', text: 'text-rose-800 dark:text-rose-200', border: 'border-rose-500/20' },
  { bg: 'bg-teal-500/12', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-500/20' },
  { bg: 'bg-indigo-500/12', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-500/20' },
  { bg: 'bg-orange-500/12', text: 'text-orange-900 dark:text-orange-100', border: 'border-orange-500/20' },
  { bg: 'bg-cyan-500/12', text: 'text-cyan-900 dark:text-cyan-100', border: 'border-cyan-500/20' },
  { bg: 'bg-lime-500/14', text: 'text-lime-900 dark:text-lime-100', border: 'border-lime-500/25' },
  { bg: 'bg-fuchsia-500/12', text: 'text-fuchsia-800 dark:text-fuchsia-200', border: 'border-fuchsia-500/20' },
] as const

function tagTone(tag: string) {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function BlogTag({ tag, size = 'md' }: { tag: string; size?: 'sm' | 'md' }) {
  const tone = tagTone(tag)
  const sizing =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 tracking-[0.08em]'
      : 'text-[11px] px-2.5 py-1 tracking-[0.1em]'

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase ${sizing} ${tone.bg} ${tone.text} ${tone.border}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
    >
      {tag}
    </span>
  )
}
