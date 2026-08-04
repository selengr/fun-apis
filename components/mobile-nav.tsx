'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { GLASS_NAV_STYLE, GLASS_SURFACE_STYLE } from '@/components/glass-nav'

const NAV_LINKS = [
  { label: 'Markets', href: '#markets' },
  { label: 'Photos', href: '#photos' },
  { label: 'English', href: '#english' },
  { label: 'Tools', href: '#tools' },
  { label: 'World', href: '#countries' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <header className="glass-nav text-foreground" style={GLASS_NAV_STYLE}>
        <div className="flex w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="font-pixel text-xs tracking-[0.25em] text-foreground/70">
            REZA KARBAKHSH
          </span>

          <div
            className="hidden md:flex items-center gap-7"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] text-foreground/60 hover:text-foreground transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/location"
              className="text-[11px] px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors tracking-wide hidden md:inline-flex items-center gap-1.5"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <MapPin className="size-3.5" />
              WHERE AM I?
            </Link>

            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-foreground/[0.04] transition-colors"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block h-px bg-foreground/60 transition-all duration-300 origin-center"
                style={{
                  width: '18px',
                  transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-px bg-foreground/60 transition-all duration-300"
                style={{
                  width: '18px',
                  opacity: open ? 0 : 1,
                  transform: open ? 'scaleX(0)' : 'none',
                }}
              />
              <span
                className="block h-px bg-foreground/60 transition-all duration-300 origin-center"
                style={{
                  width: '18px',
                  transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown under the glass bar */}
      <div
        className="md:hidden fixed left-0 right-0 z-[99998] px-3 pointer-events-none"
        style={{ top: 54 }}
      >
        <div
          className="pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? '560px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div
            className="glass-nav mt-0 border-b border-foreground/10 px-2 py-2 flex flex-col"
            style={GLASS_SURFACE_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="px-4 py-3 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] rounded-xl transition-colors tracking-wide"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1">
              <Link
                href="/location"
                onClick={close}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] px-4 py-2.5 text-foreground/60 hover:text-foreground transition-colors tracking-wide"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <MapPin className="size-3.5" />
                WHERE AM I?
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden style={{ height: 54 }} />
    </>
  )
}
