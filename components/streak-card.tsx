'use client'

import { Card } from '@/components/ui/card'
import { Flame, Award, Target, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

interface StreakData {
  currentStreak: number
  personalBest: number
  level: number
  nextLevelProgress: number
  discoveries: number
}

export function StreakCard(): JSX.Element {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 12,
    personalBest: 24,
    level: 3,
    nextLevelProgress: 65,
    discoveries: 38,
  })
  const [animateCount, setAnimateCount] = useState(false)

  useEffect(() => {
    setAnimateCount(true)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 p-6 hover:border-accent/50 transition-colors duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Flame className="w-5 h-5 text-accent animate-bounce" />
            </div>
            <span className="text-sm font-medium text-foreground/60">Streak</span>
          </div>
          <div>
            <p className="text-4xl font-bold text-accent">{streakData.currentStreak}</p>
            <p className="text-xs text-foreground/50 mt-1">days in a row</p>
          </div>
        </div>
      </Card>

      {/* Best Streak */}
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 p-6 hover:border-primary/50 transition-colors duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground/60">Best</span>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">{streakData.personalBest}</p>
            <p className="text-xs text-foreground/50 mt-1">personal record</p>
          </div>
        </div>
      </Card>

      {/* Level */}
      <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 p-6 hover:border-secondary/50 transition-colors duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Award className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm font-medium text-foreground/60">Level</span>
          </div>
          <div>
            <p className="text-4xl font-bold text-secondary">Lv {streakData.level}</p>
            <p className="text-xs text-foreground/50 mt-1">explorer rank</p>
          </div>
        </div>
      </Card>

      {/* Discoveries */}
      <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30 p-6 hover:border-green-500/50 transition-colors duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-foreground/60">Found</span>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-400">{streakData.discoveries}</p>
            <p className="text-xs text-foreground/50 mt-1">this month</p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="md:col-span-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Level 4 Progress</span>
            <span className="text-sm font-bold text-primary">{streakData.nextLevelProgress}%</span>
          </div>
          <div className="w-full bg-muted/50 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary via-secondary to-accent h-3 rounded-full transition-all duration-500"
              style={{ width: `${streakData.nextLevelProgress}%` }}
            />
          </div>
          <p className="text-xs text-foreground/50">Keep up the momentum to reach the next level!</p>
        </div>
      </Card>
    </div>
  )
}
