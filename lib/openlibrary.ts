import type { BookCard, BookDetail, OLAuthor, OLSearchDoc, OLWork } from '@/types/openlibrary'

export const OL_API = 'https://openlibrary.org'
export const OL_COVERS = 'https://covers.openlibrary.org'
export const OL_UA = 'fun-apis/1.0 (Book Explorer; contact@example.com)'

const BOOK_COVERS = '/images/books'

/** Eye-catching bestsellers for homepage slider — local cover art for reliability */
export const FEATURED_HOMEPAGE_BOOKS: BookCard[] = [
  {
    workKey: 'OL82586W',
    title: "Harry Potter and the Philosopher's Stone",
    authors: ['J. K. Rowling'],
    authorKeys: [],
    year: 1997,
    coverImage: `${BOOK_COVERS}/harry-potter.jpg`,
    isbn: '9780747532699',
    popularity: 99,
  },
  {
    workKey: 'OL5738147W',
    title: 'The Hunger Games',
    authors: ['Suzanne Collins'],
    authorKeys: [],
    year: 2008,
    coverImage: `${BOOK_COVERS}/hunger-games.jpg`,
    isbn: '9780439023481',
    popularity: 98,
  },
  {
    workKey: 'OL17965891W',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    authorKeys: [],
    year: 2018,
    coverImage: `${BOOK_COVERS}/atomic-habits.jpg`,
    isbn: '9780735211292',
    popularity: 97,
  },
  {
    workKey: 'OL27479W',
    title: 'The Fellowship of the Ring',
    authors: ['J. R. R. Tolkien'],
    authorKeys: [],
    year: 1954,
    coverImage: `${BOOK_COVERS}/lotr.jpg`,
    isbn: '9780547928210',
    popularity: 97,
  },
  {
    workKey: 'OL257943W',
    title: 'A Game of Thrones',
    authors: ['George R. R. Martin'],
    authorKeys: [],
    year: 1996,
    coverImage: `${BOOK_COVERS}/got.jpg`,
    isbn: '9780553103540',
    popularity: 96,
  },
  {
    workKey: 'OL28727759W',
    title: 'The Psychology of Money',
    authors: ['Morgan Housel'],
    authorKeys: [],
    year: 2020,
    coverImage: `${BOOK_COVERS}/psychology-of-money.jpg`,
    isbn: '9780857197685',
    popularity: 95,
  },
  {
    workKey: 'OL26707735W',
    title: 'Where the Crawdads Sing',
    authors: ['Delia Owens'],
    authorKeys: [],
    year: 2018,
    coverImage: `${BOOK_COVERS}/crawdads.jpg`,
    isbn: '9780735219090',
    popularity: 95,
  },
  {
    workKey: 'OL27315W',
    title: 'The Alchemist',
    authors: ['Paulo Coelho'],
    authorKeys: [],
    year: 1988,
    coverImage: `${BOOK_COVERS}/alchemist.jpg`,
    isbn: '9780062315007',
    popularity: 94,
  },
  {
    workKey: 'OL82563W',
    title: 'Dune',
    authors: ['Frank Herbert'],
    authorKeys: [],
    year: 1965,
    coverImage: `${BOOK_COVERS}/dune.jpg`,
    isbn: '9780441172719',
    popularity: 94,
  },
  {
    workKey: 'OL1966466W',
    title: 'Project Hail Mary',
    authors: ['Andy Weir'],
    authorKeys: [],
    year: 2021,
    coverImage: `${BOOK_COVERS}/project-hail-mary.jpg`,
    isbn: '9780593135204',
    popularity: 93,
  },
  {
    workKey: 'OL1541397W',
    title: 'Sapiens',
    authors: ['Yuval Noah Harari'],
    authorKeys: [],
    year: 2011,
    coverImage: `${BOOK_COVERS}/sapiens.jpg`,
    isbn: '9780062316097',
    popularity: 93,
  },
  {
    workKey: 'OL468431W',
    title: 'The Da Vinci Code',
    authors: ['Dan Brown'],
    authorKeys: [],
    year: 2003,
    coverImage: `${BOOK_COVERS}/da-vinci-code.jpg`,
    isbn: '9780307474278',
    popularity: 92,
  },
  {
    workKey: 'OL14933414W',
    title: 'The Midnight Library',
    authors: ['Matt Haig'],
    authorKeys: [],
    year: 2020,
    coverImage: `${BOOK_COVERS}/midnight-library.jpg`,
    isbn: '9780525559474',
    popularity: 91,
  },
  {
    workKey: 'OL27907050W',
    title: 'The Seven Husbands of Evelyn Hugo',
    authors: ['Taylor Jenkins Reid'],
    authorKeys: [],
    year: 2017,
    coverImage: `${BOOK_COVERS}/evelyn-hugo.jpg`,
    isbn: '9781501139239',
    popularity: 90,
  },
]

/** @deprecated use FEATURED_HOMEPAGE_BOOKS */
export const FALLBACK_TRENDING = FEATURED_HOMEPAGE_BOOKS

export const POPULAR_SEARCHES = [
  'Harry Potter',
  'Atomic Habits',
  'The Hunger Games',
  'The Psychology of Money',
  'Project Hail Mary',
  'Where the Crawdads Sing',
  'Dune',
  'The Alchemist',
]

export function coverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'L', isbn?: string) {
  if (!coverId && !isbn) return null
  const params = new URLSearchParams({ size })
  if (coverId) params.set('id', String(coverId))
  else if (isbn) params.set('isbn', isbn)
  return `/api/covers?${params}`
}

/** Best cover source for sliders — local assets first, then direct Open Library CDN */
export function resolveBookCoverImage(
  book: Pick<BookCard, 'coverImage' | 'coverId' | 'isbn'>,
  size: 'S' | 'M' | 'L' = 'L',
): string | null {
  if (book.coverImage) return book.coverImage
  if (book.isbn) return `${OL_COVERS}/b/isbn/${book.isbn}-${size}.jpg?default=false`
  if (book.coverId) return `${OL_COVERS}/b/id/${book.coverId}-${size}.jpg?default=false`
  return coverUrl(book.coverId, size, book.isbn)
}

export function authorPhotoUrl(photoId?: number, size: 'S' | 'M' | 'L' = 'M') {
  if (!photoId || photoId <= 0) return null
  return `${OL_COVERS}/a/id/${photoId}-${size}.jpg`
}

export function workIdFromKey(key: string) {
  return key.replace('/works/', '').replace('/books/', '')
}

function textField(value?: string | { value: string } | null): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.value ?? ''
}

export function estimateReadingHours(pages?: number) {
  if (!pages) return null
  const hours = pages / 50
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h <= 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function difficultyFromPages(pages?: number): 'Light' | 'Medium' | 'Dense' {
  if (!pages) return 'Medium'
  if (pages < 220) return 'Light'
  if (pages < 420) return 'Medium'
  return 'Dense'
}

export function popularityScore(doc: Pick<OLSearchDoc, 'want_to_read_count' | 'already_read_count' | 'currently_reading_count' | 'edition_count' | 'ratings_count'>) {
  const want = doc.want_to_read_count ?? 0
  const read = doc.already_read_count ?? 0
  const current = doc.currently_reading_count ?? 0
  const editions = doc.edition_count ?? 0
  const ratings = doc.ratings_count ?? 0
  const raw = want * 0.4 + read * 0.35 + current * 0.8 + editions * 2 + ratings * 0.15
  return Math.min(99, Math.round(20 + Math.log10(raw + 10) * 28))
}

export function mapSearchDoc(doc: OLSearchDoc): BookCard {
  return {
    workKey: workIdFromKey(doc.key),
    title: doc.title,
    authors: doc.author_name ?? [],
    authorKeys: (doc.author_key ?? []).map(k => k.replace('/authors/', '')),
    year: doc.first_publish_year,
    coverId: doc.cover_i,
    editionCount: doc.edition_count,
    pages: doc.number_of_pages_median,
    languages: doc.language,
    subjects: doc.subject?.slice(0, 12),
    rating: doc.ratings_average,
    ratingsCount: doc.ratings_count,
    publishers: doc.publisher?.slice(0, 3),
    isbn: doc.isbn?.[0],
    popularity: popularityScore(doc),
  }
}

export function mapWorkDetail(
  work: OLWork,
  search?: OLSearchDoc | null,
  author?: OLAuthor | null,
): BookDetail {
  const coverId = work.covers?.[0] ?? search?.cover_i
  const base = search
    ? mapSearchDoc(search)
    : {
        workKey: workIdFromKey(work.key),
        title: work.title,
        authors: [],
        authorKeys: (work.authors ?? []).map(a => a.author.key.replace('/authors/', '')),
        coverId,
        subjects: work.subjects?.slice(0, 12),
      }

  return {
    ...base,
    title: work.title || base.title,
    coverId,
    subjects: work.subjects?.slice(0, 16) ?? base.subjects,
    description: textField(work.description) || 'No description available for this work yet.',
    authorBio: textField(author?.bio) || undefined,
    authorBirth: author?.birth_date,
    authorPhotoId: author?.photos?.find(p => p > 0),
    wantToRead: search?.want_to_read_count,
    alreadyRead: search?.already_read_count,
    currentlyReading: search?.currently_reading_count,
    ebookAccess: search?.ebook_access,
  }
}
