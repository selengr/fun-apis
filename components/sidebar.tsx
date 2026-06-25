'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Home,
  PawPrint,
  Rocket,
  Globe,
  Brain,
  Gamepad2,
  TrendingUp,
  Film,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: PawPrint, label: 'Animals', href: '/animals' },
  { icon: Rocket, label: 'Space', href: '/space' },
  { icon: Globe, label: 'World', href: '/world' },
  { icon: Brain, label: 'Learn', href: '/learn' },
  { icon: Gamepad2, label: 'Fun', href: '/fun' },
  { icon: TrendingUp, label: 'Markets', href: '/markets' },
  { icon: Film, label: 'Entertainment', href: '/entertainment' },
]

export function Sidebar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  return (
    <aside
      className={`${
        isOpen ? 'w-56 md:w-64' : 'w-16 md:w-20'
      } bg-gradient-to-b from-card to-card/50 border-r border-border/50 transition-all duration-300 flex flex-col overflow-hidden`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="text-center">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {isOpen ? '🌌' : '🌌'}
          </div>
          {isOpen && (
            <p className="text-xs font-semibold text-foreground/60 mt-1 tracking-widest">DAILY</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-2 sm:px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 px-2 sm:px-4 h-10 transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30'
                    : 'text-foreground/60 hover:text-foreground hover:bg-primary/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 p-2 sm:p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-foreground/60 hover:text-foreground hover:bg-primary/10 transition-all"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
