export type JokeCategory =
  | 'Any'
  | 'Programming'
  | 'Misc'
  | 'Dark'
  | 'Pun'
  | 'Spooky'
  | 'Christmas'

export type JokeType = 'single' | 'twopart'

export interface JokeFlags {
  nsfw: boolean
  religious: boolean
  political: boolean
  racist: boolean
  sexist: boolean
  explicit: boolean
}

export interface Joke {
  error: false
  category: string
  type: JokeType
  joke?: string
  setup?: string
  delivery?: string
  flags: JokeFlags
  id: number
  safe: boolean
  lang: string
}

export interface JokeList {
  error: false
  amount: number
  jokes: Joke[]
}

export interface JokeError {
  error: true
  message: string
  code?: number
  causedBy?: string[]
  additionalInfo?: string
}

export type JokeResponse = Joke | JokeList | JokeError

export interface JokeApiInfo {
  error: false
  version: string
  jokes: {
    totalCount: number
    categories: string[]
    flags: string[]
    types: string[]
    formats: string[]
  }
  languages: { joke: string[]; system: string[] }
  safeJokes: Record<string, number>
  timestamp: number
}

export interface StoredFavorite {
  id: number
  category: string
  type: JokeType
  joke?: string
  setup?: string
  delivery?: string
  savedAt: number
}
