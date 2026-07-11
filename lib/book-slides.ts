import type { BookCard } from '@/types/openlibrary'
import type { Artwork } from '@/types/artwork'
import { coverUrl } from '@/lib/openlibrary'

export function bookToSlide(book: BookCard, index: number): Artwork | null {
  const image = coverUrl(book.coverId, 'L', book.isbn?.[0])
  if (!image) return null

  return {
    id: book.coverId ?? index + 10_000,
    title: book.title,
    artist: book.authors[0] ?? 'Unknown author',
    year: book.year ?? 0,
    image,
    searchQuery: book.title,
    workKey: book.workKey,
  }
}

export function booksToSlides(books: BookCard[]): Artwork[] {
  return books
    .map((b, i) => bookToSlide(b, i))
    .filter((s): s is Artwork => s !== null)
}
