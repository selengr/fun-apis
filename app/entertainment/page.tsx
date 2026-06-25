'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Entertainment() {
  const recommendations = [
    {
      title: 'Movie Recommendation',
      emoji: '🎬',
      content: 'Inception - A mind-bending sci-fi thriller',
      type: 'Movie',
    },
    {
      title: 'TV Recommendation',
      emoji: '📺',
      content: 'Stranger Things - Supernatural mystery series',
      type: 'Series',
    },
    {
      title: 'Hidden Gem',
      emoji: '💎',
      content: 'The Shawshank Redemption - A timeless classic',
      type: 'Classic',
    },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Entertainment</h1>
            <p className="text-foreground/70">Your daily entertainment picks</p>

            {/* Recommendations */}
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((item, i) => (
                <Card 
                  key={i}
                  className="bg-card/50 border-border/50 p-6 hover:border-primary/75 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{item.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60 mb-1">{item.type}</p>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-foreground/70 mb-4">{item.content}</p>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Watchlist & Daily Pick */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary/50 p-6 space-y-4">
                <h2 className="text-xl font-bold">My Watchlist</h2>
                <p className="text-foreground/70">View all your saved items</p>
                <Button className="w-full bg-secondary hover:bg-secondary/90">View Watchlist</Button>
              </Card>
              <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/50 p-6 space-y-4">
                <h2 className="text-xl font-bold">Daily Pick</h2>
                <p className="text-foreground/70">Tomorrow&apos;s recommendation</p>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Coming Soon</Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
