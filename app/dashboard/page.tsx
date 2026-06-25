'use client'

import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/sidebar'
import { DailyCards } from '@/components/daily-cards'
import { StreakCard } from '@/components/streak-card'
import { FloatingActionButton } from '@/components/floating-action-button'
import { Metadata } from 'next'

export default function Dashboard(): JSX.Element {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-foreground/60">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Main content */}
            <div className="space-y-6 animate-in fade-in duration-500">
              <StreakCard />
              <DailyCards />
            </div>
          </div>
        </main>
      </div>
      <FloatingActionButton />
    </div>
  )
}
