export interface LyricsResponse {
  lyrics: string
}

export interface LyricsSearch {
  artist: string
  title: string
}

export interface LyricsResult {
  artist: string
  title: string
  lyrics: string
  lines: string[]
}
