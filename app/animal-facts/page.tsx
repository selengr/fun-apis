import { Instrument_Serif, JetBrains_Mono, Syne } from 'next/font/google'
import { AnimalFactsBattle } from '@/components/animal-facts/AnimalFactsBattle'
import { AnimalFactsShell } from '@/components/animal-facts/animal-facts-shell'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-af-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-af-mono',
})

const mark = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-af-mark',
})

export const metadata = {
  title: 'RING — Cat vs Dog Facts',
  description: 'Two corners. One ring. Whose fact lands harder?',
}

export default function AnimalFactsPage() {
  return (
    <AnimalFactsShell fontVars={`${display.variable} ${mono.variable} ${mark.variable}`}>
      <AnimalFactsBattle />
    </AnimalFactsShell>
  )
}
