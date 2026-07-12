export interface UnsplashUserView {
  id: string
  username: string
  name: string
  bio: string | null
  location: string | null
  avatar: string
  profileUrl: string
  totalPhotos?: number
  totalCollections?: number
}

export interface UnsplashPhotoView {
  id: string
  description: string | null
  alt: string
  width: number
  height: number
  color: string
  blurHash: string | null
  createdAt: string
  likes: number
  urls: {
    thumb: string
    small: string
    regular: string
    full: string
  }
  photographer: UnsplashUserView
  links: {
    html: string
    download: string
    downloadLocation: string
  }
  tags: string[]
}

export interface UnsplashCollectionView {
  id: string
  title: string
  description: string | null
  totalPhotos: number
  coverUrl: string | null
  coverColor: string | null
}

export interface UnsplashTopicView {
  id: string
  slug: string
  title: string
  description: string | null
  coverUrl: string | null
  totalPhotos: number
}

export interface UnsplashSearchFilters {
  orientation?: 'landscape' | 'portrait' | 'squarish'
  color?:
    | 'black_and_white'
    | 'black'
    | 'white'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'purple'
    | 'magenta'
    | 'green'
    | 'teal'
    | 'blue'
  orderBy?: 'relevant' | 'latest'
}

export interface UnsplashSearchResult {
  photos: UnsplashPhotoView[]
  total: number
  page: number
  query: string
}
