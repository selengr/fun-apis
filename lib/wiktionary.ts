import type { WiktionaryDefinition, WiktionaryEntry, WiktionaryTranslation, Pronunciation } from '@/types/wiktionary'
import {
  enrichFromDictionaryApi,
  fetchWikipediaContext,
  mergeDefinitions,
  mergePronunciations,
} from '@/lib/dictionary-enrich'
import {
  countAllAudio,
  enrichTranslationsWithAudio,
  extractAudioFiles,
  extractLanguageSections,
  resolveAudioFileUrls,
} from '@/lib/wiktionary-audio'

const BASE = 'https://en.wiktionary.org/w/api.php'
const UA = 'fun-apis/1.0 (personal dictionary app; contact: local-dev)'

const LANG_CODES: Record<string, string> = {
  English: 'en',
  German: 'de',
  French: 'fr',
  Spanish: 'es',
  Italian: 'it',
  Portuguese: 'pt',
  Russian: 'ru',
  Japanese: 'ja',
  Chinese: 'zh',
  Mandarin: 'zh',
  Arabic: 'ar',
  Persian: 'fa',
  Hindi: 'hi',
  Dutch: 'nl',
  Polish: 'pl',
  Turkish: 'tr',
  Korean: 'ko',
  Swedish: 'sv',
  Norwegian: 'no',
  Danish: 'da',
  Finnish: 'fi',
  Greek: 'el',
  Hebrew: 'he',
  Ukrainian: 'uk',
  Vietnamese: 'vi',
  Indonesian: 'id',
  Thai: 'th',
  Czech: 'cs',
  Romanian: 'ro',
  Hungarian: 'hu',
}

const FEATURED_LANGS = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Mandarin',
  'Arabic',
  'Persian',
  'Hindi',
  'Korean',
  'Turkish',
  'Dutch',
]

type WikiJson = {
  error?: { code?: string; info?: string }
  parse?: { title?: string; wikitext?: { '*': string } }
  [key: number]: unknown
}

/** Short in-memory cache — stops repeat lookups from hammering Wikimedia */
const parseCache = new Map<string, { at: number; json: WikiJson | null; miss: boolean }>()
const CACHE_TTL_MS = 1000 * 60 * 30

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function wikiFetch(params: Record<string, string>, retries = 2): Promise<WikiJson> {
  const url = new URL(BASE)
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  let lastErr: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        cache: 'no-store',
      })

      if (res.status === 429) {
        lastErr = new Error('Wiktionary rate limited — try again in a moment')
        await sleep(700 * (attempt + 1))
        continue
      }

      const text = await res.text()
      let json: WikiJson
      try {
        json = JSON.parse(text)
      } catch {
        lastErr = new Error('Wiktionary is temporarily unavailable')
        await sleep(400 * (attempt + 1))
        continue
      }

      if (json.error) {
        // Missing page is a soft miss — caller handles fallbacks
        if (json.error.code === 'missingtitle') {
          return json
        }
        throw new Error(json.error.info ?? 'Wiktionary request failed')
      }

      return json
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error('Wiktionary request failed')
      if (attempt < retries) await sleep(400 * (attempt + 1))
    }
  }

  throw lastErr ?? new Error('Wiktionary request failed')
}

async function parsePage(term: string): Promise<{ title: string; wikitext: string } | null> {
  const key = term.trim().toLowerCase()
  const cached = parseCache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    if (cached.miss || !cached.json?.parse) return null
    return {
      title: cached.json.parse.title ?? term,
      wikitext: cached.json.parse.wikitext?.['*'] ?? '',
    }
  }

  // Wiktionary titles are case-sensitive; try as-typed then Title Case
  const candidates = Array.from(
    new Set([
      term.trim(),
      term.trim().toLowerCase(),
      term.trim().charAt(0).toUpperCase() + term.trim().slice(1).toLowerCase(),
    ]),
  )

  for (const page of candidates) {
    try {
      const json = await wikiFetch({
        action: 'parse',
        page,
        prop: 'wikitext|displaytitle',
        redirects: '1',
      })

      if (json.error?.code === 'missingtitle') {
        continue
      }

      const wikitext = json.parse?.wikitext?.['*'] ?? ''
      if (!wikitext) continue

      parseCache.set(key, { at: Date.now(), json, miss: false })
      return {
        title: json.parse?.title ?? page,
        wikitext,
      }
    } catch {
      // try next candidate / fall through
    }
  }

  parseCache.set(key, { at: Date.now(), json: null, miss: true })
  return null
}

function stripWiki(text: string): string {
  return text
    .replace(/\{\{n-g\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{lb\|[^}]+\}\}/g, '')
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/''+/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTerms(line: string): string[] {
  const terms: string[] = []
  const templateRe = /\{\{t+\+?\|(?:[^|]+\|)([^}|]+)/g
  let m: RegExpExecArray | null
  while ((m = templateRe.exec(line)) !== null) {
    const term = m[1].trim()
    if (term && !/^\d+$/.test(term) && !terms.includes(term)) terms.push(term)
  }
  const linkRe = /\[\[([^|\]#]+)(?:\|[^\]]+)?\]\]/g
  while ((m = linkRe.exec(line)) !== null) {
    const term = m[1].trim()
    if (term && !terms.includes(term)) terms.push(term)
  }
  return terms.slice(0, 4)
}

function extractTranslations(wikitext: string): WiktionaryTranslation[] {
  const seen = new Set<string>()
  const out: WiktionaryTranslation[] = []

  // Collect every translation table on the page (not just the first)
  const blockRe =
    /\{\{trans-top(?:-also)?(?:\|[^}]*)?\}\}([\s\S]*?)\{\{trans-bottom\}\}/gi
  const blocks: string[] = []
  let block: RegExpExecArray | null
  while ((block = blockRe.exec(wikitext)) !== null) {
    let content = block[1]
    if (content.includes('{{multitrans|data=')) {
      content = content.split('{{multitrans|data=').pop() ?? content
    }
    blocks.push(content)
  }

  // Fallback: some entries only nest translations without a clean pair
  if (!blocks.length) {
    const loose = wikitext.match(/\{\{trans-top[\s\S]{0,12000}?\{\{trans-bottom\}\}/i)
    if (loose) blocks.push(loose[0])
  }

  const lineRe = /^\*+\s*:?\s*([^:\n][^:\n]*(?:\([^)]*\))?):\s*(.+)$/gm

  for (const content of blocks) {
    lineRe.lastIndex = 0
    let line: RegExpExecArray | null
    while ((line = lineRe.exec(content)) !== null) {
      const language = line[1].trim().replace(/^\*+\s*/, '')
      if (!language || language.startsWith('{')) continue

      const terms = extractTerms(line[2])
      if (!terms.length) continue

      const key = language.toLowerCase()
      if (seen.has(key)) {
        // Merge extra terms into existing language
        const existing = out.find(t => t.language.toLowerCase() === key)
        if (existing) {
          for (const t of terms) {
            if (!existing.terms.includes(t) && existing.terms.length < 4) {
              existing.terms.push(t)
            }
          }
        }
        continue
      }

      seen.add(key)
      out.push({
        language,
        terms,
        code: LANG_CODES[language],
      })
    }
  }

  return out
}

function extractEnglishSection(wikitext: string): string | null {
  const m = wikitext.match(/==English==([\s\S]*?)(?=\n==[^=]|\Z)/)
  return m ? m[1] : null
}

function extractDefinitions(section: string): WiktionaryDefinition[] {
  const defs: WiktionaryDefinition[] = []
  let pos: string | undefined

  for (const line of section.split('\n')) {
    const posMatch = line.match(/^===([^=]+)===$/)
    if (posMatch) {
      pos = posMatch[1].trim()
      continue
    }
    if (line.startsWith('# ') && !line.startsWith('#:') && !line.startsWith('#*')) {
      const text = stripWiki(line.slice(2))
      if (text.length > 6) defs.push({ text, partOfSpeech: pos })
    }
  }

  return defs.slice(0, 8)
}

function extractPhonetic(section: string): string | undefined {
  const ipa = section.match(/\{\{IPA\|en\|(\/[^}/|]+(?:\/[^}|]*)?)/)
  if (ipa) return ipa[1]
  const enpr = section.match(/\{\{enPR\|([^}|]+)/)
  if (enpr) return `/${enpr[1].replace(/'/g, '')}/`
  return undefined
}

function extractEtymology(section: string): string | undefined {
  const m = section.match(/===Etymology(?:\s*\d+)?===([\s\S]*?)(?=\n===|\Z)/)
  if (!m) return undefined
  const text = stripWiki(m[1])
  return text.length > 20 ? text.slice(0, 420) + (text.length > 420 ? '…' : '') : text || undefined
}

const ACCENT_LABELS: Record<string, string> = {
  UK: 'UK',
  US: 'US',
  AU: 'AU',
  CA: 'CA',
  GA: 'US',
  RP: 'UK',
  'SOUTHERN ENGLAND': 'UK',
  'NORTHERN ENGLAND': 'UK',
  'SOUTHERN US': 'US',
  'NORTHERN US': 'US',
}

function normalizeAccent(label: string): string {
  const upper = label.toUpperCase().trim()
  return ACCENT_LABELS[upper] ?? (upper.length <= 4 ? upper : 'Audio')
}

function extractWikiAudios(section: string): { file: string; label: string }[] {
  const files = extractAudioFiles(section)
  const out: { file: string; label: string }[] = []
  const seen = new Set<string>()

  for (const file of files) {
    if (/-\d+\.(ogg|mp3|wav)$/i.test(file) && !/^En-/i.test(file)) continue
    const label = normalizeAccent(
      /^En-uk/i.test(file)
        ? 'UK'
        : /^En-au/i.test(file)
          ? 'AU'
          : /^En-us/i.test(file)
            ? 'US'
            : /-uk/i.test(file)
              ? 'UK'
              : /-us/i.test(file)
                ? 'US'
                : /-au/i.test(file)
                  ? 'AU'
                  : 'Audio',
    )
    if (seen.has(label)) continue
    seen.add(label)
    out.push({ file, label })
    if (out.length >= 4) break
  }
  return out
}

async function resolveCommonsAudioUrls(
  files: { file: string; label: string }[],
): Promise<Pronunciation[]> {
  if (!files.length) return []
  const urlMap = await resolveAudioFileUrls(files.map(f => f.file))
  return files
    .map(f => ({
      label: f.label,
      audio: urlMap.get(f.file.toLowerCase()),
      source: 'wiktionary' as const,
    }))
    .filter(p => p.audio)
}

function sortTranslations(translations: WiktionaryTranslation[]) {
  const featured = FEATURED_LANGS.map(name =>
    translations.find(t => t.language === name),
  ).filter(Boolean) as WiktionaryTranslation[]

  const featuredSet = new Set(featured.map(t => t.language.toLowerCase()))
  const rest = translations
    .filter(t => !featuredSet.has(t.language.toLowerCase()))
    .sort((a, b) => a.language.localeCompare(b.language))

  return [...featured, ...rest]
}

export async function suggestWords(query: string, limit = 8): Promise<string[]> {
  if (!query.trim() || query.length < 2) return []
  try {
    const json = await wikiFetch({
      action: 'opensearch',
      search: query.trim(),
      limit: String(limit),
      namespace: '0',
    })
    return (json[1] as string[]) ?? []
  } catch {
    return []
  }
}

export async function lookupWord(word: string): Promise<WiktionaryEntry> {
  const term = word.trim()
  if (!term) throw new Error('Word is required')

  // Free Dictionary first/alongside — never blocked by Wikimedia rate limits
  const dictEnrich = await enrichFromDictionaryApi(term)

  let parsed: { title: string; wikitext: string } | null = null
  try {
    parsed = await parsePage(term)
  } catch {
    parsed = null
  }

  if (!parsed && !dictEnrich) {
    throw new Error(`No dictionary entry for "${term}"`)
  }

  const wikitext = parsed?.wikitext ?? ''
  const english = wikitext ? extractEnglishSection(wikitext) : null
  const wikiDefs = english ? extractDefinitions(english) : []
  const wikiPhonetic = english ? extractPhonetic(english) : undefined
  const etymology = english ? extractEtymology(english) : undefined
  let translations = wikitext ? sortTranslations(extractTranslations(wikitext)) : []

  // Light enrichment only (no per-language native wiki fetches — those cause 429s)
  if (wikitext && translations.length) {
    try {
      translations = await enrichTranslationsWithAudio(translations, wikitext)
    } catch {
      // keep plain translations
    }
  }

  const languageSections = wikitext ? extractLanguageSections(wikitext) : []

  const wikiAudioFiles = english ? extractWikiAudios(english) : []
  let wikiPronunciations: Pronunciation[] = []
  try {
    wikiPronunciations = await resolveCommonsAudioUrls(wikiAudioFiles)
  } catch {
    wikiPronunciations = []
  }

  // Wikipedia image/extract is optional — skip when Wiktionary already failed (rate limit)
  let wikiContext: Awaited<ReturnType<typeof fetchWikipediaContext>> = null
  if (parsed) {
    try {
      wikiContext = await fetchWikipediaContext(parsed.title)
    } catch {
      wikiContext = null
    }
  }

  const title = parsed?.title ?? dictEnrich?.word ?? term
  const slug = title.replace(/ /g, '_')

  const definitions = mergeDefinitions(wikiDefs, dictEnrich?.definitions ?? [])
  const pronunciations = mergePronunciations(
    dictEnrich?.pronunciations ?? [],
    wikiPronunciations,
  )

  if (!definitions.length && !translations.length) {
    throw new Error(`No dictionary entry for "${term}"`)
  }

  const examples = dictEnrich?.examples?.length
    ? dictEnrich.examples
    : definitions.filter(d => d.example).map(d => d.example!)

  const synonyms = dictEnrich?.synonyms?.length
    ? dictEnrich.synonyms
    : [...new Set(definitions.flatMap(d => d.synonyms ?? []))]

  const antonyms = dictEnrich?.antonyms?.length
    ? dictEnrich.antonyms
    : [...new Set(definitions.flatMap(d => d.antonyms ?? []))]

  const result: WiktionaryEntry = {
    word: title,
    url: `https://en.wiktionary.org/wiki/${encodeURIComponent(slug)}`,
    language: 'English',
    phonetic: dictEnrich?.phonetic ?? wikiPhonetic ?? pronunciations.find(p => p.ipa)?.ipa,
    etymology,
    definitions,
    translations,
    translationCount: translations.length,
    pronunciations,
    synonyms,
    antonyms,
    examples,
    image: wikiContext?.image,
    wikiUrl: wikiContext?.wikiUrl,
    wikiExtract: wikiContext?.wikiExtract,
    languageSections,
    audioCount: 0,
  }

  result.audioCount = countAllAudio(result)
  return result
}
