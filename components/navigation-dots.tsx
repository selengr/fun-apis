"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NavigationDotsProps {
  total: number
  current: number
  onSelect: (index: number) => void
  colors: string[]
}

/** On mobile, show a small window of dots so the bar stays compact. */
function visibleDotRange(total: number, current: number, maxVisible: number) {
  if (total <= maxVisible) return { start: 0, end: total - 1 }
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(0, current - half)
  let end = start + maxVisible - 1
  if (end >= total) {
    end = total - 1
    start = end - maxVisible + 1
  }
  return { start, end }
}

export function NavigationDots({ total, current, onSelect, colors }: NavigationDotsProps) {
  const mobile = visibleDotRange(total, current, 7)
  const desktop = visibleDotRange(total, current, 11)

  return (
    <motion.div
      className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 backdrop-blur-md md:bottom-8 md:gap-2 md:px-4 md:py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Mobile: compact window */}
      <div className="flex items-center gap-1 md:hidden">
        {Array.from({ length: mobile.end - mobile.start + 1 }, (_, i) => {
          const index = mobile.start + i
          return (
            <DotButton
              key={index}
              index={index}
              current={current}
              colors={colors}
              onSelect={onSelect}
              compact
            />
          )
        })}
      </div>

      {/* Desktop */}
      <div className="hidden items-center gap-2 md:flex">
        {Array.from({ length: desktop.end - desktop.start + 1 }, (_, i) => {
          const index = desktop.start + i
          return (
            <DotButton
              key={index}
              index={index}
              current={current}
              colors={colors}
              onSelect={onSelect}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

function DotButton({
  index,
  current,
  colors,
  onSelect,
  compact = false,
}: {
  index: number
  current: number
  colors: string[]
  onSelect: (index: number) => void
  compact?: boolean
}) {
  const active = index === current

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className="group relative flex items-center justify-center p-0.5 md:p-1"
      aria-label={`Go to slide ${index + 1}`}
      aria-current={active ? "true" : undefined}
    >
      <div
        className={cn(
          "rounded-full transition-all duration-300 ease-out",
          compact
            ? active
              ? "h-1.5 w-3.5"
              : "h-1.5 w-1.5"
            : active
              ? "h-2 w-6"
              : "h-2 w-2",
        )}
        style={{
          backgroundColor: active ? colors[0] || "#ffffff" : "rgba(255,255,255,0.3)",
        }}
      />
    </button>
  )
}
