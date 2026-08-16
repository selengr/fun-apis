import type { BookCard, BookDetail, OLAuthor, OLSearchDoc, OLWork } from '@/types/openlibrary'

export const OL_API = 'https://openlibrary.org'
export const OL_COVERS = 'https://covers.openlibrary.org'
export const OL_UA = 'fun-apis/1.0 (Book Explorer; contact@example.com)'

const BOOK_COVERS = '/images/books'

/** Curated homepage slider — habits, psychology, coding, English & science */
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
    workKey: 'OL17839543W',
    title: 'Deep Work',
    authors: ['Cal Newport'],
    authorKeys: [],
    year: 2016,
    coverImage: `${BOOK_COVERS}/deep-work.jpg`,
    isbn: '9781455586691',
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
    workKey: 'OL7440448W',
    title: 'Clean Code',
    authors: ['Robert C. Martin'],
    authorKeys: [],
    year: 2008,
    coverImage: `${BOOK_COVERS}/clean-code.jpg`,
    isbn: '9780132350884',
    popularity: 94,
  },
  {
    workKey: 'OL7936826W',
    title: 'The Pragmatic Programmer',
    authors: ['David Thomas', 'Andrew Hunt'],
    authorKeys: [],
    year: 2019,
    coverImage: `${BOOK_COVERS}/pragmatic-programmer.jpg`,
    isbn: '9780135957059',
    popularity: 94,
  },
  {
    workKey: 'OL254506W',
    title: 'Introduction to Algorithms',
    authors: ['Thomas H. Cormen', 'Charles E. Leiserson'],
    authorKeys: [],
    year: 2009,
    coverImage: `${BOOK_COVERS}/introduction-to-algorithms.jpg`,
    isbn: '9780262046305',
    popularity: 93,
  },
  {
    workKey: 'OL254507W',
    title: "Don't Make Me Think",
    authors: ['Steve Krug'],
    authorKeys: [],
    year: 2014,
    coverImage: `${BOOK_COVERS}/dont-make-me-think.jpg`,
    isbn: '9780321965516',
    popularity: 93,
  },
  {
    workKey: 'OL254508W',
    title: 'English Grammar in Use',
    authors: ['Raymond Murphy'],
    authorKeys: [],
    year: 2019,
    coverImage: `${BOOK_COVERS}/english-grammar-in-use.jpg`,
    isbn: '9781108457651',
    popularity: 92,
  },
  {
    workKey: 'OL254509W',
    title: 'The Elements of Style',
    authors: ['William Strunk Jr.', 'E. B. White'],
    authorKeys: [],
    year: 1999,
    coverImage: `${BOOK_COVERS}/elements-of-style.jpg`,
    isbn: '9780205309023',
    popularity: 92,
  },
  {
    workKey: 'OL254510W',
    title: 'A Brief History of Time',
    authors: ['Stephen Hawking'],
    authorKeys: [],
    year: 1988,
    coverImage: `${BOOK_COVERS}/brief-history-of-time.jpg`,
    isbn: '9780553380163',
    popularity: 91,
  },
  {
    workKey: 'OL254512W',
    title: 'Code Complete',
    authors: ['Steve McConnell'],
    authorKeys: [],
    year: 2004,
    coverImage: `${BOOK_COVERS}/code-complete.jpg`,
    isbn: '9780735619678',
    popularity: 91,
  },
  {
    workKey: 'OL254511W',
    title: 'Astrophysics for People in a Hurry',
    authors: ['Neil deGrasse Tyson'],
    authorKeys: [],
    year: 2017,
    coverImage: `${BOOK_COVERS}/astrophysics-for-people-in-a-hurry.jpg`,
    isbn: '9780393609394',
    popularity: 90,
  },
]

/** @deprecated use FEATURED_HOMEPAGE_BOOKS */
export const FALLBACK_TRENDING = FEATURED_HOMEPAGE_BOOKS

export const POPULAR_SEARCHES = [
  'Atomic Habits',
  'Clean Code',
  'The Pragmatic Programmer',
  'English Grammar in Use',
  'Thinking, Fast and Slow',
  'Code Complete',
  'Introduction to Algorithms',
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
