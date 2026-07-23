import { Instrument_Serif, JetBrains_Mono, Syne } from 'next/font/google'
import { LocationShell } from '@/components/location-shell'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-loc-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-loc-mono',
})

const mark = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-loc-mark',
})

export const metadata = {
  title: 'Whereabouts — Your IP',
  description: 'See your public ISP IP and where the wire thinks you are',
}

export default function LocationPage() {
  return (
    <LocationShell
      fontVars={`${display.variable} ${mono.variable} ${mark.variable}`}
    />
  )
}
