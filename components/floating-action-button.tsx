'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dice6, X, Sparkles, Share2, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SurpriseItem {
  title: string
  content: string
  category: string
  icon: string
}

const surpriseDiscoveries: SurpriseItem[] = [
  {
    title: 'Octopus Fact',
    content: 'Octopuses have three hearts - two pump blood to the gills, while the third pumps it to the rest of the body!',
    category: 'Biology',
    icon: '🐙',
  },
  {
    title: 'Space Myth',
    content: 'The Great Wall of China is not visible from space with the naked eye, despite popular belief!',
    category: 'Space',
    icon: '🌍',
  },
  {
    title: 'Fruit Fact',
    content: 'Bananas are berries, but strawberries are not! Botanically speaking, bananas fit the definition of a berry.',
    category: 'Biology',
    icon: '🍌',
  },
  {
    title: 'Venus Wonder',
    content: 'Venus is the only planet that rotates backwards relative to its orbit around the sun.',
    category: 'Space',
    icon: '🪐',
  },
  {
    title: 'Time on Venus',
    content: 'A day on Venus (243 Earth days) is longer than its year (225 Earth days)!',
    category: 'Space',
    icon: '☀️',
  },
  {
    title: 'Honey Eternal',
    content: 'Honey never spoils and can last for thousands of years. Archaeologists found 3000-year-old honey in Egyptian tombs.',
    category: 'Science',
    icon: '🍯',
  },
  {
    title: 'Brain Power',
    content: 'Your brain generates enough electricity to power a small lightbulb!',
    category: 'Biology',
    icon: '🧠',
  },
  {
    title: 'Language Diversity',
    content: 'There are approximately 7,000 languages spoken in the world today, but one dies every 14 days.',
    category: 'Culture',
    icon: '🗣️',
  },
]

export function FloatingActionButton(): JSX.Element {
  const [isSpinning, setIsSpinning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentSurprise, setCurrentSurprise] = useState<SurpriseItem | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSurpriseMe = (): void => {
    setIsSpinning(true)
    const randomSurprise = surpriseDiscoveries[Math.floor(Math.random() * surpriseDiscoveries.length)]
    
    setTimeout(() => {
      setCurrentSurprise(randomSurprise)
      setShowModal(true)
      setIsSpinning(false)
    }, 600)
  }

  const handleCopy = (): void => {
    if (currentSurprise) {
      navigator.clipboard.writeText(`${currentSurprise.title}: ${currentSurprise.content}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 group">
        <Button
          onClick={handleSurpriseMe}
          className={`w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:shadow-primary/60 text-white transition-all duration-300 ${
            isSpinning ? 'animate-spin' : 'hover:scale-110'
          }`}
          size="icon"
        >
          <Dice6 className="w-6 h-6" />
        </Button>
        <div className="absolute bottom-20 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-card/95 backdrop-blur-sm text-foreground text-sm px-3 py-2 rounded-lg whitespace-nowrap border border-border/50">
            Surprise Me!
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && currentSurprise && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-gradient-to-br from-card to-card/50 border-primary/50 p-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentSurprise.icon}</span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {currentSurprise.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{currentSurprise.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 hover:bg-primary/20 text-foreground/60"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-base text-foreground/80 leading-relaxed">{currentSurprise.content}</p>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-secondary/50 text-secondary hover:bg-secondary/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleSurpriseMe}
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
