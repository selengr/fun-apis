export interface IpstackLanguage {
  code: string
  name: string
  native: string
}

export interface IpstackLocation {
  geoname_id: number
  capital: string
  languages: IpstackLanguage[]
  country_flag: string
  country_flag_emoji: string
  country_flag_emoji_unicode: string
  calling_code: string
  is_eu: boolean
}

export interface IpstackTimeZone {
  id: string
  current_time: string
  gmt_offset: number
  code: string
  is_daylight_saving: boolean
}

export interface IpstackCurrency {
  code: string
  name: string
  plural: string
  symbol: string
  symbol_native: string
}

export interface IpstackConnection {
  asn: number
  isp: string
  sld?: string | null
  tld?: string | null
  carrier?: string | null
  home?: boolean | null
  organization_type?: string | null
}

export interface IpstackSecurity {
  is_proxy: boolean
  proxy_type: string | null
  is_crawler: boolean
  crawler_name: string | null
  crawler_type: string | null
  is_tor: boolean
  threat_level: string | null
  threat_types: string[] | null
  proxy_last_detected: string | null
  proxy_level: string | null
  vpn_service: string | null
  anonymizer_status: string | null
  hosting_facility: boolean
}

export interface IpstackData {
  ip: string
  hostname?: string
  type: string
  continent_code: string
  continent_name: string
  country_code: string
  country_name: string
  region_code: string
  region_name: string
  city: string
  zip: string
  latitude: number
  longitude: number
  radius?: string | null
  ip_routing_type?: string | null
  connection_type?: string | null
  location: IpstackLocation
  time_zone: IpstackTimeZone
  currency: IpstackCurrency
  connection: IpstackConnection
  security?: IpstackSecurity
}

export interface IpstackError {
  success: false
  error: {
    code: number
    type: string
    info: string
  }
}
