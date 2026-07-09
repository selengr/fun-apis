import type { WiktionaryTranslation, LanguageSection } from '@/types/wiktionary'

const UA = 'fun-apis/1.0 (Wiktionary dictionary; contact: github.com)'

/** Native Wiktionary hosts for pronunciation lookups */
export const NATIVE_WIKI: Record<string, string> = {
  de: 'de.wiktionary.org',
  fr: 'fr.wiktionary.org',
  es: 'es.wiktionary.org',
  it: 'it.wiktionary.org',
  pt: 'pt.wiktionary.org',
  ru: 'ru.wiktionary.org',
  ja: 'ja.wiktionary.org',
  nl: 'nl.wiktionary.org',
  pl: 'pl.wiktionary.org',
  sv: 'sv.wiktionary.org',
  no: 'no.wiktionary.org',
  da: 'da.wiktionary.org',
  fi: 'fi.wiktionary.org',
  el: 'el.wiktionary.org',
  he: 'he.wiktionary.org',
  uk: 'uk.wiktionary.org',
  vi: 'vi.wiktionary.org',
  id: 'id.wiktionary.org',
  cs: 'cs.wiktionary.org',
  ro: 'ro.wiktionary.org',
  hu: 'hu.wiktionary.org',
  tr: 'tr.wiktionary.org',
  ko: 'ko.wiktionary.org',
  fa: 'fa.wiktionary.org',
  hi: 'hi.wiktionary.org',
  ar: 'ar.wiktionary.org',
  zh: 'zh.wiktionary.org',
}

const LANG_NAME_TO_CODE: Record<string, string> = {
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

const ENRICH_LIMIT = 8

async function wikiFetch(host: string, params: Record<string, string>) {
  const url = new URL(`https://${host}/w/api.php`)
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      cache: 'no-store',
    })
    const text = await res.text()
    const json = JSON.parse(text)
    if (json.error) return null
    return json
  } catch {
    return null
  }
}

export function extractAudioFiles(wikitext: string): string[] {
  const files = new Set<string>()
  const patterns = [
    /\{\{audio\|[a-z]{2,3}\|([^}|]+\.(?:ogg|mp3|wav|oga))/gi,
    /\{\{Audio\|([^}|]+\.(?:ogg|mp3|wav|oga))/gi,
    /\{\{audio\|([^}|]+\.(?:ogg|mp3|wav|oga))/gi,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(wikitext)) !== null) {
      const file = m[1].trim()
      if (file && !file.includes('<<')) files.add(file)
    }
  }
  return [...files]
}

export function extractIpaFromWikitext(wikitext: string): string | undefined {
  const patterns = [
    /\{\{IPA\|[a-z]{2,3}\|(\/[^}|]+(?:\/[^}|]*)?)/,
    /\{\{IPA\|(\/[^}|]+(?:\/[^}|]*)?)/,
    /\{\{Lautschrift\|([^}|]+)/,
    /\{\{Lautschrift\}\}\s*\{\{Lautschrift\|([^}|]+)/,
  ]
  for (const re of patterns) {
    const m = wikitext.match(re)
    if (m?.[1]) {
      const val = m[1].trim()
      return val.startsWith('/') ? val : `/${val}/`
    }
  }
  return undefined
}

function stripWiki(text: string): string {
  return text
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/''+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractLanguageSections(wikitext: string): LanguageSection[] {
  const sections: LanguageSection[] = []
  const re = /^==([^=]+)==\s*$/gm
  const headers: { name: string; index: number }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(wikitext)) !== null) {
    headers.push({ name: m[1].trim(), index: m.index })
  }

  for (let i = 0; i < headers.length; i++) {
    const name = headers[i].name
    if (['English', 'References', 'Further reading', 'Anagrams', 'Pronunciation', 'Noun', 'Verb'].includes(name)) continue
    if (name.length > 24) continue

    const start = headers[i].index
    const end = headers[i + 1]?.index ?? wikitext.length
    const body = wikitext.slice(start, end)
    const code = LANG_NAME_TO_CODE[name]
    const audioFiles = extractAudioFiles(body)
    const defs: string[] = []

    for (const line of body.split('\n')) {
      if (/^# /.test(line) && !line.startsWith('#:') && !line.startsWith('#*')) {
        const t = stripWiki(line.slice(2))
        if (t.length > 8) defs.push(t)
      }
    }

    sections.push({
      language: name,
      code,
      ipa: extractIpaFromWikitext(body),
      gloss: defs[0],
      definitions: defs.slice(0, 3),
      audio: undefined,
    })

    if (audioFiles[0]) {
      sections[sections.length - 1].audio = audioFiles[0]
    }
  }

  return sections
}

export async function resolveAudioFileUrls(filenames: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (!filenames.length) return map

  const unique = [...new Set(filenames.map(f => f.toLowerCase()))]
  const batches: string[][] = []
  for (let i = 0; i < unique.length; i += 40) {
    batches.push(unique.slice(i, i + 40))
  }

  for (const batch of batches) {
    const titles = batch.map(f => {
      const orig = filenames.find(x => x.toLowerCase() === f) ?? f
      return `File:${orig}`
    }).join('|')

    const json = await wikiFetch('en.wiktionary.org', {
      action: 'query',
      titles,
      prop: 'imageinfo',
      iiprop: 'url',
    })
    if (!json?.query?.pages) continue

    for (const page of Object.values(json.query.pages) as {
      title?: string
      imageinfo?: { url: string }[]
    }[]) {
      const url = page.imageinfo?.[0]?.url?.split('?')[0]
      if (url && page.title?.startsWith('File:')) {
        map.set(page.title.slice(5).toLowerCase(), url)
      }
    }
  }

  return map
}

async function fetchNativeWikitext(host: string, term: string): Promise<string | null> {
  const json = await wikiFetch(host, {
    action: 'parse',
    page: term,
    prop: 'wikitext',
    redirects: '1',
  })
  return json?.parse?.wikitext?.['*'] ?? null
}

export async function enrichTranslationsWithAudio(
  translations: WiktionaryTranslation[],
  mainWikitext: string,
): Promise<WiktionaryTranslation[]> {
  const sections = extractLanguageSections(mainWikitext)
  const sectionByLang = new Map(sections.map(s => [s.language.toLowerCase(), s]))

  const enriched = translations.map(t => {
    const sec = sectionByLang.get(t.language.toLowerCase())
    if (!sec) return { ...t }
    return {
      ...t,
      code: t.code ?? sec.code,
      ipa: t.ipa ?? sec.ipa,
      gloss: t.gloss ?? sec.gloss,
      audio: t.audio ?? sec.audio,
    }
  })

  const pendingFiles: string[] = []
  for (const sec of sections) {
    if (sec.audio) pendingFiles.push(sec.audio)
  }

  const needsNative = enriched
    .filter(t => t.code && NATIVE_WIKI[t.code] && !t.audio)
    .slice(0, ENRICH_LIMIT)

  for (const t of needsNative) {
    const host = NATIVE_WIKI[t.code!]
    const wt = await fetchNativeWikitext(host, t.terms[0])
    if (!wt) continue
    const files = extractAudioFiles(wt)
    const idx = enriched.findIndex(x => x.language === t.language)
    if (idx === -1) continue
    enriched[idx].ipa = enriched[idx].ipa ?? extractIpaFromWikitext(wt)
    if (files[0]) {
      enriched[idx].audio = files[0]
      pendingFiles.push(files[0])
    }
  }

  const urlMap = await resolveAudioFileUrls(pendingFiles)

  return enriched.map(t => {
    if (!t.audio) return t
    const resolved = urlMap.get(t.audio.toLowerCase())
    return resolved ? { ...t, audio: resolved } : t
  })
}

export function countAllAudio(entry: {
  pronunciations: { audio?: string }[]
  translations: { audio?: string }[]
}): number {
  const main = entry.pronunciations.filter(p => p.audio).length
  const trans = entry.translations.filter(t => t.audio).length
  return main + trans
}
