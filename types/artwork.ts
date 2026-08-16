export interface Artwork {
  id: number
  title: string
  artist: string
  year: number
  image: string
  /** Secondary cover URL tried if primary image fails to load */
  coverFallback?: string
  /** When set, card click navigates to books page with this search query */
  searchQuery?: string
  workKey?: string
}
  