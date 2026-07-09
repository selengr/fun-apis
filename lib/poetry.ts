import type { PoetInfo, PoetryMood, PoetryPoem } from '@/types/poetry'

export const POETRYDB = 'https://poetrydb.org'

export const MOODS: { id: PoetryMood; label: string; query: string }[] = [
  { id: 'romantic', label: 'Romantic', query: 'love' },
  { id: 'sad', label: 'Sad', query: 'sorrow' },
  { id: 'inspirational', label: 'Inspirational', query: 'hope' },
  { id: 'nature', label: 'Nature', query: 'nature' },
  { id: 'philosophy', label: 'Philosophy', query: 'soul' },
]

export const FEATURED_POETS = [
  'Emily Dickinson',
  'William Shakespeare',
  'Percy Bysshe Shelley',
  'John Keats',
  'William Wordsworth',
  'Walt Whitman',
  'Edgar Allan Poe',
  'William Blake',
]

export const POET_PROFILES: Record<string, PoetInfo> = {
  'Emily Dickinson': {
    name: 'Emily Dickinson',
    blurb: 'An American lyric poet whose compressed, startling verse redefined the boundaries of feeling and form.',
    era: '1830–1886 · American',
    themes: ['Mortality', 'Nature', 'Faith', 'Interior life'],
  },
  'William Shakespeare': {
    name: 'William Shakespeare',
    blurb: 'The English dramatist and sonneteer whose language still shapes how we speak of love, power, and time.',
    era: '1564–1616 · English',
    themes: ['Love', 'Power', 'Time', 'Identity'],
  },
  'Percy Bysshe Shelley': {
    name: 'Percy Bysshe Shelley',
    blurb: 'A radical Romantic whose odes and lyrics burn with idealism, beauty, and political fire.',
    era: '1792–1822 · English',
    themes: ['Freedom', 'Beauty', 'Revolution', 'Nature'],
  },
  'John Keats': {
    name: 'John Keats',
    blurb: 'A master of sensual imagery whose brief life left some of the most luminous odes in English.',
    era: '1795–1821 · English',
    themes: ['Beauty', 'Mortality', 'Art', 'Desire'],
  },
  'William Wordsworth': {
    name: 'William Wordsworth',
    blurb: 'The Romantic who found the sublime in lakes, hills, and the quiet mind of childhood.',
    era: '1770–1850 · English',
    themes: ['Nature', 'Memory', 'Childhood', 'Spirit'],
  },
  'Walt Whitman': {
    name: 'Walt Whitman',
    blurb: 'The expansive American bard of democracy, the body, and the open road.',
    era: '1819–1892 · American',
    themes: ['Self', 'Democracy', 'Body', 'Nation'],
  },
  'Edgar Allan Poe': {
    name: 'Edgar Allan Poe',
    blurb: 'Architect of the gothic lyric — music, melancholy, and the beautiful macabre.',
    era: '1809–1849 · American',
    themes: ['Grief', 'Mystery', 'Beauty', 'Night'],
  },
  'William Blake': {
    name: 'William Blake',
    blurb: 'Visionary poet-artist who forged innocence and experience into prophetic song.',
    era: '1757–1827 · English',
    themes: ['Innocence', 'Vision', 'Spirit', 'Society'],
  },
}

export function normalizePoem(raw: PoetryPoem): PoetryPoem {
  return {
    title: raw.title?.trim() || 'Untitled',
    author: raw.author?.trim() || 'Unknown',
    lines: Array.isArray(raw.lines) ? raw.lines : [],
    linecount: Number(raw.linecount) || (raw.lines?.filter(l => l.trim()).length ?? 0),
  }
}

export function poemText(poem: PoetryPoem) {
  return poem.lines.join('\n')
}

export function poemShareText(poem: PoetryPoem) {
  return `"${poem.title}"\n— ${poem.author}\n\n${poemText(poem)}`
}

export function themeFromMood(mood?: PoetryMood | null) {
  return MOODS.find(m => m.id === mood)?.label ?? 'Classic'
}

/** Deterministic daily seed so "today's poem" is stable per day */
export function dailySeed() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

export function pickDailyIndex(length: number, salt = '') {
  if (length <= 0) return 0
  const key = dailySeed() + salt
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h % length
}
