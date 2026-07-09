export interface OLSearchDoc {
  key: string
  title: string
  author_name?: string[]
  author_key?: string[]
  first_publish_year?: number
  cover_i?: number
  cover_edition_key?: string
  edition_count?: number
  language?: string[]
  subject?: string[]
  isbn?: string[]
  publisher?: string[]
  number_of_pages_median?: number
  ratings_average?: number
  ratings_count?: number
  want_to_read_count?: number
  already_read_count?: number
  currently_reading_count?: number
  ebook_access?: string
  has_fulltext?: boolean
}

export interface OLSearchResponse {
  numFound: number
  start: number
  docs: OLSearchDoc[]
}

export interface OLWork {
  key: string
  title: string
  description?: string | { type?: string; value: string }
  subjects?: string[]
  covers?: number[]
  authors?: { author: { key: string }; type?: { key: string } }[]
  first_publish_date?: string
  links?: { title?: string; url: string }[]
}

export interface OLAuthor {
  key: string
  name: string
  bio?: string | { type?: string; value: string }
  birth_date?: string
  death_date?: string
  photos?: number[]
  personal_name?: string
  alternate_names?: string[]
}

export interface BookCard {
  workKey: string
  title: string
  authors: string[]
  authorKeys: string[]
  year?: number
  coverId?: number
  editionCount?: number
  pages?: number
  languages?: string[]
  subjects?: string[]
  rating?: number
  ratingsCount?: number
  publishers?: string[]
  isbn?: string
  popularity?: number
}

export interface BookDetail extends BookCard {
  description: string
  authorBio?: string
  authorBirth?: string
  authorPhotoId?: number
  wantToRead?: number
  alreadyRead?: number
  currentlyReading?: number
  ebookAccess?: string
}
