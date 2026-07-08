"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, LineChart, Globe2, Laugh, RefreshCw } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const NAV_LINKS = [
  { label: "Markets",      href: "#markets" },
  { label: "Agents",       href: "#agents" },
  { label: "Workflow",     href: "#workflow" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing",      href: "#pricing" },
]

const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={NAV_STYLE}
        >
          <span className="font-pixel text-xs tracking-[0.25em] text-black/70 dark:text-white/70">REZA KARBAKHSH</span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/convert"
              className="text-[11px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide hidden lg:inline-flex items-center gap-1.5"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <RefreshCw className="size-3.5" />
              CONVERT
            </Link>
            <Link
              href="/jokes"
              className="text-[11px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide hidden md:inline-flex items-center gap-1.5"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <Laugh className="size-3.5" />
              JOKES
            </Link>
            <Link
              href="/countries"
              className="text-[11px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide hidden md:inline-flex items-center gap-1.5"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <Globe2 className="size-3.5" />
              COUNTRIES
            </Link>
            <Link
              href="/location"
              className="text-[11px] px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide hidden md:inline-flex items-center gap-1.5"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <MapPin className="size-3.5" />
              WHERE AM I?
            </Link>

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span
                className="block h-px bg-black/60 dark:bg-white/60 transition-all duration-300 origin-center"
                style={{
                  width: "18px",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-px bg-black/60 dark:bg-white/60 transition-all duration-300"
                style={{
                  width: "18px",
                  opacity: open ? 0 : 1,
                  transform: open ? "scaleX(0)" : "none",
                }}
              />
              <span
                className="block h-px bg-black/60 dark:bg-white/60 transition-all duration-300 origin-center"
                style={{
                  width: "18px",
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "420px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] px-2 py-2 flex flex-col"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="px-4 py-3 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.08] rounded-xl transition-colors tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1 flex flex-col gap-1.5">

              <Link
                href="/convert"
                onClick={close}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                <RefreshCw className="size-3.5" />
                CONVERT
              </Link>
              <Link
                href="/jokes"
                onClick={close}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                <Laugh className="size-3.5" />
                JOKES
              </Link>
              <Link
                href="/countries"
                onClick={close}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                <Globe2 className="size-3.5" />
                COUNTRIES
              </Link>
              <Link
                href="/location"
                onClick={close}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/20 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-all duration-200 tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                <MapPin className="size-3.5" />
                WHERE AM I?
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
