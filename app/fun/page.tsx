'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Fun() {
  const funItems = [
    { title: 'Joke Generator', emoji: '😂', description: 'Get a random joke' },
    { title: 'Emoji Challenge', emoji: '🎯', description: 'Guess what emoji means' },
    { title: 'Trivia Game', emoji: '🧠', description: 'Answer fun trivia questions' },
    { title: 'Would You Rather', emoji: '🤔', description: 'Make tough choices' },
    { title: 'Meme Explorer', emoji: '😆', description: 'Browse funny memes' },
    { title: 'Leaderboard', emoji: '🏆', description: 'See top players' },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl space-y-6">
            <h1 className="text-3xl font-bold">Fun Zone</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {funItems.map((item, i) => (
                <Card 
                  key={i}
                  className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 p-6 hover:border-primary/75 transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="text-5xl">{item.emoji}</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Play Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
