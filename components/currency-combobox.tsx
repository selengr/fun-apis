'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { FrankfurterCurrency } from '@/types/frankfurter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const FLAG: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭',
  CAD: '🇨🇦', AUD: '🇦🇺', CNY: '🇨🇳', INR: '🇮🇳', IRR: '🇮🇷',
  TRY: '🇹🇷', AED: '🇦🇪', SAR: '🇸🇦', MXN: '🇲🇽', BRL: '🇧🇷',
  SEK: '🇸🇪', NOK: '🇳🇴', PLN: '🇵🇱', SGD: '🇸🇬', HKD: '🇭🇰',
  NZD: '🇳🇿', ZAR: '🇿🇦', KRW: '🇰🇷', RUB: '🇷🇺', THB: '🇹🇭',
}

type CurrencyComboboxProps = {
  value: string
  currencies: FrankfurterCurrency[]
  onChange: (code: string) => void
  label?: string
  className?: string
}

export function CurrencyCombobox({
  value,
  currencies,
  onChange,
  label,
  className,
}: CurrencyComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => currencies.find(c => c.iso_code === value),
    [currencies, value],
  )

  const sorted = useMemo(
    () => [...currencies].sort((a, b) => a.iso_code.localeCompare(b.iso_code)),
    [currencies],
  )

  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          {label}
        </p>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'group flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-background/70 px-3.5 py-3 text-left',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-all duration-300 cursor-pointer',
              'hover:border-emerald-500/30 hover:bg-background/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25',
              open && 'border-emerald-500/40 ring-2 ring-emerald-500/15',
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-lg ring-1 ring-border/40">
              {FLAG[value] ?? '💱'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-sm font-semibold tracking-wide text-foreground">
                {value}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {selected?.name ?? 'Select currency'}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(100vw-2rem,320px)] p-0 overflow-hidden rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl"
        >
          <Command className="bg-transparent">
            <CommandInput placeholder="Search code or name…" />
            <CommandList className="max-h-64">
              <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                No currency found.
              </CommandEmpty>
              <CommandGroup className="p-1.5">
                {sorted.map(c => {
                  const active = c.iso_code === value
                  return (
                    <CommandItem
                      key={c.iso_code}
                      value={`${c.iso_code} ${c.name}`}
                      onSelect={() => {
                        onChange(c.iso_code)
                        setOpen(false)
                      }}
                      className={cn(
                        'cursor-pointer rounded-xl px-2.5 py-2.5 aria-selected:bg-emerald-500/10',
                        active && 'bg-muted/40',
                      )}
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-base">
                        {FLAG[c.iso_code] ?? '💱'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-sm font-medium">{c.iso_code}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.name}</span>
                      </span>
                      {c.symbol && (
                        <span className="text-xs text-muted-foreground/70">{c.symbol}</span>
                      )}
                      <Check
                        className={cn(
                          'size-4 text-emerald-500',
                          active ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
