'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb } from 'lucide-react'

export default function Learn() {
  const learnings = [
    {
      title: 'Word of the Day',
      content: 'Serendipity',
      definition: 'The occurrence of events by chance in a happy or beneficial way',
      emoji: '📚',
    },
    {
      title: 'Science Fact',
      content: 'Octopus Intelligence',
      definition: 'Octopuses are highly intelligent creatures with three hearts and blue blood!',
      emoji: '🧬',
    },
    {
      title: 'History Event',
      content: 'Apollo 11 Moon Landing',
      definition: 'On July 20, 1969, Apollo 11 made the first manned moon landing.',
      emoji: '👨‍🚀',
    },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Learn Something New</h1>

            {/* Learning Cards */}
            <div className="grid grid-cols-1 gap-4">
              {learnings.map((item, i) => (
                <Card key={i} className="bg-card/50 border-border/50 p-6 hover:border-primary/75 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{item.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60 mb-1">{item.title}</p>
                      <h3 className="text-2xl font-bold mb-2">{item.content}</h3>
                      <p className="text-foreground/70 mb-4">{item.definition}</p>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* AI Explanation */}
            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary/50 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-bold">AI Explanation</h2>
              </div>
              <p className="text-foreground/70">
                Get a deeper understanding of complex topics explained in simple terms.
              </p>
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                Explain Like I&apos;m 10
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
