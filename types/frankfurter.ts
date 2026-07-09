export interface FrankfurterCurrency {
  iso_code: string
  iso_numeric?: string
  name: string
  symbol?: string
  start_date?: string
}

export interface FrankfurterRatePoint {
  date: string
  base: string
  quote: string
  rate: number
}

export interface FrankfurterRate {
  date: string
  base: string
  quote: string
  rate: number
}

export type ForexPeriod = 'today' | '7' | '30' | '90' | '365'
