import { Instrument_Serif, JetBrains_Mono, Syne } from 'next/font/google'
import { DailyPoetry } from '@/components/daily-poetry'
import { PoetryShell } from '@/components/poetry-shell'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-py-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-py-mono',
})

const mark = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-py-mark',
})

export const metadata = {
  title: 'LINE. — Daily Poetry',
  description: 'A letterpress desk for classic verse — today\'s poem, moods, and the next line.',
}

export default function PoetryPage() {
  return (
    <PoetryShell fontVars={`${display.variable} ${mono.variable} ${mark.variable}`}>
      <DailyPoetry />
    </PoetryShell>
  )
}
