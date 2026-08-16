import type { BookCard, BookDetail, OLAuthor, OLSearchDoc, OLWork } from '@/types/openlibrary'

export const OL_API = 'https://openlibrary.org'
export const OL_COVERS = 'https://covers.openlibrary.org'
export const OL_UA = 'fun-apis/1.0 (Book Explorer; contact@example.com)'

const BOOK_COVERS = '/images/books'

/** Psychology & self-growth picks for homepage slider — local cover art for reliability */
export const FEATURED_HOMEPAGE_BOOKS: BookCard[] = [
  {
    workKey: 'OL17965891W',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    authorKeys: [],
    year: 2018,
    coverImage: `${BOOK_COVERS}/atomic-habits.jpg`,
    isbn: '9780735211292',
    popularity: 99,
  },
  {
    workKey: 'OL26827757W',
    title: 'Breaking the Habit of Being Yourself',
    authors: ['Dr. Joe Dispenza'],
    authorKeys: [],
    year: 2012,
    coverImage: `${BOOK_COVERS}/breaking-habit-of-being-yourself.jpg`,
    isbn: '9781401938086',
    popularity: 98,
  },
  {
    workKey: 'OL26827758W',
    title: 'Becoming Supernatural',
    authors: ['Dr. Joe Dispenza'],
    authorKeys: [],
    year: 2017,
    coverImage: `${BOOK_COVERS}/becoming-supernatural.jpg`,
    isbn: '9781401953119',
    popularity: 97,
  },
  {
    workKey: 'OL28727759W',
    title: 'The Psychology of Money',
    authors: ['Morgan Housel'],
    authorKeys: [],
    year: 2020,
    coverImage: `${BOOK_COVERS}/psychology-of-money.jpg`,
    isbn: '9780857197685',
    popularity: 96,
  },
  {
    workKey: 'OL16015104W',
    title: 'Thinking, Fast and Slow',
    authors: ['Daniel Kahneman'],
    authorKeys: [],
    year: 2011,
    coverImage: `${BOOK_COVERS}/thinking-fast-and-slow.jpg`,
    isbn: '9780374533557',
    popularity: 95,
  },
  {
    workKey: 'OL45804W',
    title: "Man's Search for Meaning",
    authors: ['Viktor E. Frankl'],
    authorKeys: [],
    year: 1946,
    coverImage: `${BOOK_COVERS}/mans-search-for-meaning.jpg`,
    isbn: '9780807014295',
    popularity: 95,
  },
  {
    workKey: 'OL80240W',
    title: 'The Power of Now',
    authors: ['Eckhart Tolle'],
    authorKeys: [],
    year: 1997,
    coverImage: `${BOOK_COVERS}/power-of-now.jpg`,
    isbn: '9781577314806',
    popularity: 94,
  },
  {
    workKey: 'OL80241W',
    title: 'Mindset',
    authors: ['Carol S. Dweck'],
    authorKeys: [],
    year: 2006,
    coverImage: `${BOOK_COVERS}/mindset.jpg`,
    isbn: '9780345472328',
    popularity: 94,
  },
  {
    workKey: 'OL27315W',
    title: 'The Alchemist',
    authors: ['Paulo Coelho'],
    authorKeys: [],
    year: 1988,
    coverImage: `${BOOK_COVERS}/alchemist.jpg`,
    isbn: '9780062315007',
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
    workKey: 'OL14933414W',
    title: 'The Midnight Library',
    authors: ['Matt Haig'],
    authorKeys: [],
    year: 2020,
    coverImage: `${BOOK_COVERS}/midnight-library.jpg`,
    isbn: '9780525559474',
    popularity: 92,
  },
  {
    workKey: 'OL17839543W',
    title: 'Deep Work',
    authors: ['Cal Newport'],
    authorKeys: [],
    year: 2016,
    coverImage: `${BOOK_COVERS}/deep-work.jpg`,
    isbn: '9781455586691',
    popularity: 91,
  },
  {
    workKey: 'OL82586W',
    title: "Harry Potter and the Philosopher's Stone",
    authors: ['J. K. Rowling'],
    authorKeys: [],
    year: 1997,
    coverImage: `${BOOK_COVERS}/harry-potter.jpg`,
    isbn: '9780747532699',
    popularity: 90,
  },
  {
    workKey: 'OL1966466W',
    title: 'Project Hail Mary',
    authors: ['Andy Weir'],
    authorKeys: [],
    year: 2021,
    coverImage: `${BOOK_COVERS}/project-hail-mary.jpg`,
    isbn: '9780593135204',
    popularity: 89,
  },
]

/** @deprecated use FEATURED_HOMEPAGE_BOOKS */
export const FALLBACK_TRENDING = FEATURED_HOMEPAGE_BOOKS

export const POPULAR_SEARCHES = [
  'Atomic Habits',
  'Breaking the Habit of Being Yourself',
  'Becoming Supernatural',
  'The Psychology of Money',
  'Thinking, Fast and Slow',
  "Man's Search for Meaning",
  'Mindset',
  'Deep Work',
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
