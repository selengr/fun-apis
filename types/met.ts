export interface MetConstituent {
  constituentID: number
  role: string
  name: string
  constituentULAN_URL?: string
  constituentWikidata_URL?: string
  gender?: string
}

export interface MetTag {
  term: string
  AAT_URL?: string
  Wikidata_URL?: string
}

export interface MetObjectRaw {
  objectID: number
  isHighlight: boolean
  accessionNumber: string
  isPublicDomain: boolean
  primaryImage: string
  primaryImageSmall: string
  additionalImages: string[]
  constituents: MetConstituent[] | null
  department: string
  objectName: string
  title: string
  culture: string
  period: string
  dynasty: string
  artistDisplayName: string
  artistDisplayBio: string
  artistNationality: string
  objectDate: string
  objectBeginDate: number
  objectEndDate: number
  medium: string
  dimensions: string
  creditLine: string
  city: string
  country: string
  region: string
  classification: string
  repository: string
  objectURL: string
  tags: MetTag[] | null
  GalleryNumber: string
}

export interface MetSearchRaw {
  total: number
  objectIDs: number[] | null
}

export interface MetDepartment {
  departmentId: number
  displayName: string
}

export interface Artwork {
  id: number
  title: string
  artist: string
  artistBio: string
  year: string
  museum: string
  medium: string
  country: string
  style: string
  culture: string
  department: string
  classification: string
  dimensions: string
  creditLine: string
  image: string
  imageLarge: string
  objectURL: string
  isPublicDomain: boolean
  isHighlight: boolean
  tags: string[]
}
