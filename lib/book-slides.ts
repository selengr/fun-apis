import type { BookCard } from '@/types/openlibrary'
import type { Artwork } from '@/types/artwork'
import { resolveBookCoverImage } from '@/lib/openlibrary'

export function bookToSlide(book: BookCard, index: number): Artwork | null {
  const image = resolveBookCoverImage(book, 'L')
  if (!image) return null

  return {
    id: book.coverId ?? index + 10_000,
    title: book.title,
    artist: book.authors[0] ?? 'Unknown author',
    year: book.year ?? 0,
    image,
    searchQuery: book.title,
    workKey: book.workKey,
    coverFallback: book.isbn
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`
      : book.coverId
        ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg?default=false`
        : undefined,
  }
}

export function booksToSlides(books: BookCard[]): Artwork[] {
  return books
    .map((b, i) => bookToSlide(b, i))
    .filter((s): s is Artwork => s !== null)
}
