export interface WiktionaryTranslation {
  language: string
  terms: string[]
  code?: string
  ipa?: string
  audio?: string
  gloss?: string
}

export interface WiktionaryDefinition {
  text: string
  partOfSpeech?: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

export interface Pronunciation {
  label: string
  ipa?: string
  audio?: string
  source?: 'dictionary' | 'wiktionary'
}

export interface WikiImage {
  url: string
  width?: number
  height?: number
  pageUrl?: string
}

export interface LanguageSection {
  language: string
  code?: string
  ipa?: string
  audio?: string
  gloss?: string
  definitions: string[]
}

export interface WiktionaryEntry {
  word: string
  url: string
  language: string
  phonetic?: string
  etymology?: string
  definitions: WiktionaryDefinition[]
  translations: WiktionaryTranslation[]
  translationCount: number
  pronunciations: Pronunciation[]
  synonyms: string[]
  antonyms: string[]
  examples: string[]
  image?: WikiImage
  wikiUrl?: string
  wikiExtract?: string
  languageSections: LanguageSection[]
  audioCount: number
}

export interface WiktionarySuggestResponse {
  suggestions: string[]
}
