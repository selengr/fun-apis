'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Apple-style full-bleed glass header:
 * transparent + saturate(180%) blur(8px) + inset hairline.
 */
export const GLASS_NAV_STYLE = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: 54,
  display: 'flex',
  alignItems: 'center' as const,
  justifyContent: 'space-around' as const,
  background: 'transparent',
  WebkitBackdropFilter: 'saturate(180%) blur(8px)',
  backdropFilter: 'saturate(180%) blur(8px)',
  fontSize: 14,
  zIndex: 99999,
}

/** Shared glass surface for dropdowns that sit under the bar (e.g. homepage menu). */
export const GLASS_SURFACE_STYLE = {
  background: 'transparent',
  WebkitBackdropFilter: 'saturate(180%) blur(8px)',
  backdropFilter: 'saturate(180%) blur(8px)',
  boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0,.08)',
} as const

export function GlassNav({
  label,
  backHref = '/',
  backLabel = 'Back home',
  spacer = true,
  children,
}: {
  label?: string
  backHref?: string
  backLabel?: string
  /** Reserve 54px so content clears the fixed bar. Default true. */
  spacer?: boolean
  children?: ReactNode
}) {
  return (
    <>
      <header className="glass-nav text-foreground" style={GLASS_NAV_STYLE}>
        <div className="flex w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <ThemeToggle />
          {label ? (
            <span className="font-pixel text-[10px] tracking-[0.2em] text-foreground/50 hidden sm:inline">
              {label}
            </span>
          ) : (
            <span aria-hidden className="hidden sm:inline" />
          )}
          {children ?? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-[11px] text-foreground/70 hover:text-foreground transition-colors tracking-wide"
            >
              {backLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </header>
      {spacer ? <div aria-hidden style={{ height: 54 }} /> : null}
    </>
  )
}
