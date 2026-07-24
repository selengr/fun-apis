import { Instrument_Serif, JetBrains_Mono, Syne } from 'next/font/google'
import { JokesHub } from '@/components/jokes-hub'
import { JokesShell } from '@/components/jokes-shell'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-jk-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jk-mono',
})

const mark = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jk-mark',
})

export const metadata = {
  title: 'BIT. — Open Mic Jokes',
  description: 'Spin a category, pull a bit, save the ones that land — powered by JokeAPI',
}

export default function JokesPage() {
  return (
    <JokesShell fontVars={`${display.variable} ${mono.variable} ${mark.variable}`}>
      <JokesHub />
    </JokesShell>
  )
}
