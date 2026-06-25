'use client'

import { Input } from '@/components/ui/input'
import { Bell, User, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Navigation(): JSX.Element {
  const [notificationCount] = useState(3)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <nav className="border-b border-border/50 bg-card/40 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        {/* Left side - Logo/Title */}
        <div className="flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Daily Universe</h2>
        </div>

        {/* Center - Search */}
        <div className={`flex-1 max-w-xs sm:max-w-sm mx-2 sm:mx-4 transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search discoveries..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
            >
              <Bell className="w-5 h-5" />
            </Button>
            {notificationCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            )}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
