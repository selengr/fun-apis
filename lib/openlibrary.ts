import type { BookCard, BookDetail, OLAuthor, OLSearchDoc, OLWork } from '@/types/openlibrary'

export const OL_API = 'https://openlibrary.org'
export const OL_COVERS = 'https://covers.openlibrary.org'
export const OL_UA = 'fun-apis/1.0 (Book Explorer; contact@example.com)'

export const POPULAR_SEARCHES = [
  'Atomic Habits',
  'The Alchemist',
  'Sapiens',
  'Pride and Prejudice',
  '1984',
  'Deep Work',
  'The Midnight Library',
  'Dune',
]

export function coverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'L', isbn?: string) {
  if (!coverId && !isbn) return null
  const params = new URLSearchParams({ size })
  if (coverId) params.set('id', String(coverId))
  else if (isbn) params.set('isbn', isbn)
  return `/api/covers?${params}`
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
