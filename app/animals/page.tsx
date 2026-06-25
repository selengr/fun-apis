'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Animals() {
  const animal = {
    name: 'Red Panda',
    emoji: '🐼',
    facts: [
      'Red pandas are often called the "firefox"',
      'They spend about 95% of their time in trees',
      'Their tail is as long as their body',
      'They are excellent climbers and spend most of their time in trees',
    ],
    habitat: 'Eastern Himalayas, Southern China',
    status: 'Vulnerable',
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            {/* Hero */}
            <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 p-8">
              <div className="flex items-start gap-6">
                <div className="text-8xl">{animal.emoji}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{animal.name}</h1>
                  <p className="text-foreground/70 mb-4">Today&apos;s featured animal</p>
                </div>
              </div>
            </Card>

            {/* Facts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {animal.facts.map((fact, i) => (
                <Card key={i} className="bg-card/50 border-border/50 p-4">
                  <p className="text-foreground/80">{fact}</p>
                </Card>
              ))}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-secondary/20 border-secondary/50 p-6">
                <h3 className="font-semibold text-secondary mb-2">Habitat</h3>
                <p className="text-foreground/70">{animal.habitat}</p>
              </Card>
              <Card className="bg-accent/20 border-accent/50 p-6">
                <h3 className="font-semibold text-accent mb-2">Conservation Status</h3>
                <p className="text-foreground/70">{animal.status}</p>
              </Card>
            </div>

            {/* Quiz Section */}
            <Card className="bg-card/50 border-border/50 p-6 space-y-4">
              <h2 className="text-xl font-bold">Guess the Animal Quiz</h2>
              <p className="text-foreground/70">Test your knowledge about this animal and earn +10 XP!</p>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Take Quiz
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
