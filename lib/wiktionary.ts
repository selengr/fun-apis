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
const UA = 'fun-apis/1.0 (Wiktionary dictionary; contact: github.com)'

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

async function wikiFetch(params: Record<string, string>) {
  const url = new URL(BASE)
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    cache: 'no-store',
  })
  const text = await res.text()
  let json: { error?: { info?: string }; parse?: unknown; query?: unknown }
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('Wiktionary is temporarily unavailable')
  }
  if (json.error) throw new Error(json.error.info ?? 'Wiktionary request failed')
  return json
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
  const blockRe = /\{\{trans-top\|([^}]*)\}\}([\s\S]*?)\{\{trans-bottom\}\}/g
  const block = blockRe.exec(wikitext)
  if (!block) return out

  let content = block[2]
  if (content.includes('{{multitrans|data=')) {
    content = content.split('{{multitrans|data=').pop() ?? content
  }

  const lineRe = /^\*+\s*([^:\n][^:\n]*(?:\([^)]*\))?):\s*(.+)$/gm
  let line: RegExpExecArray | null
  while ((line = lineRe.exec(content)) !== null) {
    const language = line[1].trim()
    if (language.startsWith(':')) continue

    const terms = extractTerms(line[2])
    if (!terms.length) continue

    const key = language.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    out.push({
      language,
      terms,
      code: LANG_CODES[language],
    })
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

  const posRe = /^===([^=]+)===\s*$/gm
  const lines = section.split('\n')
  for (const line of lines) {
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
  const m = section.match(/===Etymology===([\s\S]*?)(?=\n===|\Z)/)
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

/** Primary pronunciation clips from Wiktionary English section */
function extractWikiAudios(section: string): { file: string; label: string }[] {
  const files = extractAudioFiles(section)
  const out: { file: string; label: string }[] = []
  const seen = new Set<string>()

  for (const file of files) {
    if (/-\d+\.(ogg|mp3|wav)$/i.test(file) && !/^En-/i.test(file)) continue
    const label = normalizeAccent(
      /^En-uk/i.test(file) ? 'UK' :
        /^En-au/i.test(file) ? 'AU' :
        /^En-us/i.test(file) ? 'US' :
        /-uk/i.test(file) ? 'UK' :
        /-us/i.test(file) ? 'US' :
        /-au/i.test(file) ? 'AU' :
        'Audio',
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
  const json = await wikiFetch({
    action: 'opensearch',
    search: query.trim(),
    limit: String(limit),
    namespace: '0',
  })
  return (json[1] as string[]) ?? []
}

export async function lookupWord(word: string): Promise<WiktionaryEntry> {
  const term = word.trim()
  if (!term) throw new Error('Word is required')

  const [wikiJson, dictEnrich, wikiContext] = await Promise.all([
    wikiFetch({
      action: 'parse',
      page: term,
      prop: 'wikitext|displaytitle',
      redirects: '1',
    }),
    enrichFromDictionaryApi(term),
    fetchWikipediaContext(term),
  ])

  const wikitext: string = wikiJson.parse?.wikitext?.['*'] ?? ''
  if (!wikitext && !dictEnrich) {
    throw new Error(`No dictionary entry for "${term}"`)
  }

  const english = wikitext ? extractEnglishSection(wikitext) : null
  const wikiDefs = english ? extractDefinitions(english) : []
  const wikiPhonetic = english ? extractPhonetic(english) : undefined
  const etymology = english ? extractEtymology(english) : undefined
  let translations = wikitext ? sortTranslations(extractTranslations(wikitext)) : []

  if (wikitext) {
    translations = await enrichTranslationsWithAudio(translations, wikitext)
  }

  const languageSections = wikitext ? extractLanguageSections(wikitext) : []
  if (languageSections.length) {
    const files = languageSections.filter(s => s.audio).map(s => s.audio!)
    const urls = await resolveAudioFileUrls(files)
    for (const sec of languageSections) {
      if (sec.audio) sec.audio = urls.get(sec.audio.toLowerCase()) ?? sec.audio
    }
  }

  const wikiAudioFiles = english ? extractWikiAudios(english) : []
  const wikiPronunciations = await resolveCommonsAudioUrls(wikiAudioFiles)

  const title: string = wikiJson.parse?.title ?? dictEnrich?.word ?? term
  const slug = title.replace(/ /g, '_')

  const definitions = mergeDefinitions(wikiDefs, dictEnrich?.definitions ?? [])
  const pronunciations = mergePronunciations(
    dictEnrich?.pronunciations ?? [],
    wikiPronunciations,
  )

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
