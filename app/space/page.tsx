'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Space() {
  const nasaImage = {
    title: 'Nebula NGC 6302',
    description: 'A stunning planetary nebula captured by the James Webb Space Telescope',
    emoji: '🌌',
  }

  const sections = [
    { label: 'Moon', emoji: '🌕' },
    { label: 'Planets', emoji: '🪐' },
    { label: 'Asteroids', emoji: '☄️' },
    { label: 'Launches', emoji: '🚀' },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl space-y-6">
            {/* Featured NASA Image */}
            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary/50 p-8">
              <div className="flex items-start gap-6">
                <div className="text-8xl">{nasaImage.emoji}</div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{nasaImage.title}</h1>
                  <p className="text-foreground/70">{nasaImage.description}</p>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="Moon" className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-card/50 border border-border/50">
                {sections.map((section) => (
                  <TabsTrigger key={section.label} value={section.label}>
                    <span className="mr-2">{section.emoji}</span>
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent key={section.label} value={section.label} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="bg-card/50 border-border/50 p-4 hover:border-secondary/75 transition-colors cursor-pointer">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3">
                          <span className="text-4xl">{section.emoji}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{section.label} Discovery {i}</h3>
                        <p className="text-sm text-foreground/70">Learn more about this fascinating object</p>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Mars Rover Gallery */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Mars Rover Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-card/50 border-border/50 overflow-hidden hover:border-primary/75 transition-colors cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-5xl">🚀</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">Mars Discovery {i}</h3>
                      <p className="text-sm text-foreground/70">Curiosity Rover</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
