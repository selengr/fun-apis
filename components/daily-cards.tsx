'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, Zap } from 'lucide-react'
import { useState } from 'react'

interface DailyItem {
  title: string
  content: string
  emoji: string
  color: string
  xp?: number
  locked?: boolean
}

const dailyItems: DailyItem[] = [
  {
    title: 'Fact of the Day',
    content: 'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!',
    emoji: '🍯',
    color: 'from-primary/20 to-primary/10 border-primary/50',
    xp: 5,
  },
  {
    title: 'Animal of the Day',
    content: 'Red Panda - A cute and endangered species from the Eastern Himalayas.',
    emoji: '🐼',
    color: 'from-secondary/20 to-secondary/10 border-secondary/50',
    xp: 8,
  },
  {
    title: 'NASA Image of the Day',
    content: 'Stunning nebula captured by the James Webb Space Telescope',
    emoji: '🌌',
    color: 'from-accent/20 to-accent/10 border-accent/50',
    xp: 10,
  },
  {
    title: 'Word of the Day',
    content: 'Serendipity - The occurrence of events by chance in a happy or beneficial way',
    emoji: '📚',
    color: 'from-purple-500/20 to-purple-500/10 border-purple-500/50',
    xp: 5,
  },
  {
    title: 'Historical Event',
    content: 'Apollo 11 Moon Landing - July 20, 1969. "One small step for man..."',
    emoji: '👨‍🚀',
    color: 'from-blue-500/20 to-blue-500/10 border-blue-500/50',
    xp: 7,
  },
  {
    title: 'Daily Challenge',
    content: 'Identify this animal from 5 clues. Earn +10 XP upon completion!',
    emoji: '🎯',
    color: 'from-orange-500/20 to-orange-500/10 border-orange-500/50',
    xp: 15,
    locked: true,
  },
]

export function DailyCards(): JSX.Element {
  const [visitedItems, setVisitedItems] = useState<number[]>([])

  const handleExplore = (index: number): void => {
    if (!visitedItems.includes(index)) {
      setVisitedItems([...visitedItems, index])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Today&apos;s Discoveries</h2>
        <div className="text-sm text-foreground/60">
          <span className="font-semibold text-primary">{visitedItems.length}</span>/{dailyItems.length} explored
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {dailyItems.map((item, index) => {
          const isVisited = visitedItems.includes(index)
          return (
            <Card
              key={index}
              className={`bg-gradient-to-br ${item.color} p-6 transition-all duration-300 cursor-pointer group ${
                isVisited
                  ? 'border-primary/75 shadow-lg shadow-primary/20'
                  : 'hover:border-primary/75 hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.locked && (
                      <Lock className="w-4 h-4 text-foreground/40" />
                    )}
                    {isVisited && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                  <p className="text-sm text-foreground/70 line-clamp-3">
                    {item.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  {item.xp && (
                    <div className="flex items-center gap-1 text-xs font-medium text-accent">
                      <Zap className="w-3 h-3" />
                      +{item.xp} XP
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleExplore(index)}
                    className={`ml-auto bg-primary/80 hover:bg-primary text-primary-foreground transition-all ${
                      isVisited ? 'opacity-60 cursor-default' : ''
                    }`}
                    disabled={isVisited}
                  >
                    {isVisited ? 'Visited' : 'Explore'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
