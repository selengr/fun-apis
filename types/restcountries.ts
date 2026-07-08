export interface CountryCapital {
  name: string
  coordinates?: { lat: number; lng: number }
  attributes?: Record<string, boolean>
}

export interface CountryCurrency {
  code: string
  name: string
  symbol: string
}

export interface CountryLanguage {
  name: string
  native_name?: string
  iso639_1?: string
}

export interface CountryMemberships {
  un?: boolean
  eu?: boolean
  nato?: boolean
  g7?: boolean
  g20?: boolean
  commonwealth?: boolean
  schengen?: boolean
  eurozone?: boolean
  oecd?: boolean
  brics?: boolean
  asean?: boolean
  african_union?: boolean
  arab_league?: boolean
  opec?: boolean
}

export interface Country {
  names?: {
    common?: string
    official?: string
    alternates?: string[]
    native?: Record<string, { common?: string; official?: string }>
    translations?: Record<string, { common?: string; official?: string }>
  }
  codes?: {
    alpha_2?: string
    alpha_3?: string
    ccn3?: string
    fifa?: string
    cioc?: string
  }
  flag?: {
    emoji?: string
    url_png?: string
    url_svg?: string
    description?: string
    colors?: {
      dominant?: string
      prominent?: string
      palette?: { hex: string; proportion: number }[]
    }
  }
  capitals?: CountryCapital[]
  region?: string
  subregion?: string
  continents?: string[]
  population?: number
  area?: { kilometers?: number; miles?: number }
  borders?: string[]
  coordinates?: { lat: number; lng: number }
  currencies?: CountryCurrency[]
  languages?: CountryLanguage[]
  demonyms?: Record<string, { m?: string; f?: string }>
  timezones?: string[]
  landlocked?: boolean
  memberships?: CountryMemberships
  calling_codes?: string[]
  tlds?: string[]
  cars?: { driving_side?: string; signs?: string[] }
  units?: { measurement_system?: string; temperature_scale?: string }
  links?: {
    wikipedia?: string
    google_maps?: string
    open_street_maps?: string
    official?: string
  }
}

export interface CountriesMeta {
  total: number
  count: number
  limit: number
  offset: number
  more: boolean
  request_id?: string
}

export interface CountriesResponse {
  data?: {
    objects: Country[]
    meta: CountriesMeta
  }
  errors?: { message: string }[]
}
