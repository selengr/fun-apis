'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function World() {
  const country = {
    name: 'Japan',
    flag: '🇯🇵',
    population: '125.1 million',
    currency: 'Japanese Yen (¥)',
    languages: 'Japanese',
    facts: [
      'Japan has the oldest living tradition of theatrical performance (Noh theater)',
      'There are more convenience stores than schools in Japan',
      'Japan has the second-largest economy in the world',
    ],
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            {/* Country Hero */}
            <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 p-8">
              <div className="flex items-start gap-6">
                <div className="text-8xl">{country.flag}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{country.name}</h1>
                  <p className="text-foreground/70">Country of the Day</p>
                </div>
              </div>
            </Card>

            {/* Country Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-secondary/20 border-secondary/50 p-6">
                <h3 className="font-semibold text-secondary mb-2">Population</h3>
                <p className="text-2xl font-bold text-foreground">{country.population}</p>
              </Card>
              <Card className="bg-secondary/20 border-secondary/50 p-6">
                <h3 className="font-semibold text-secondary mb-2">Currency</h3>
                <p className="text-lg text-foreground">{country.currency}</p>
              </Card>
              <Card className="bg-accent/20 border-accent/50 p-6">
                <h3 className="font-semibold text-accent mb-2">Languages</h3>
                <p className="text-lg text-foreground">{country.languages}</p>
              </Card>
              <Card className="bg-accent/20 border-accent/50 p-6">
                <h3 className="font-semibold text-accent mb-2">Fun Fact</h3>
                <p className="text-sm text-foreground">{country.facts[0]}</p>
              </Card>
            </div>

            {/* Mini Games */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50 p-6 space-y-4">
                <h2 className="text-xl font-bold">Guess the Flag</h2>
                <p className="text-foreground/70">Can you identify the flag? Earn +5 XP!</p>
                <Button className="w-full bg-primary hover:bg-primary/90">Play</Button>
              </Card>
              <Card className="bg-card/50 border-border/50 p-6 space-y-4">
                <h2 className="text-xl font-bold">Guess the Capital</h2>
                <p className="text-foreground/70">What&apos;s the capital of this country? Earn +5 XP!</p>
                <Button className="w-full bg-secondary hover:bg-secondary/90">Play</Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
