export interface PoetryPoem {
  title: string
  author: string
  lines: string[]
  linecount: string | number
}

export type PoetryMood =
  | 'romantic'
  | 'sad'
  | 'inspirational'
  | 'nature'
  | 'philosophy'

export interface PoetInfo {
  name: string
  blurb: string
  era: string
  themes: string[]
}
