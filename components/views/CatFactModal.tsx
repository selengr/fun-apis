'use client'
import { useState, useEffect, useCallback } from 'react'
import { Copy, Share2, ArrowRight, Check, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CatFact {
  fact: string
  length: number
}

interface CatFactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CatFactModal({ isOpen, onClose }: CatFactModalProps) {
  const [fact, setFact] = useState<CatFact | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [factCount, setFactCount] = useState(0)
  const [history, setHistory] = useState<string[]>([])

  const fetchFact = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('https://catfact.ninja/fact')
      const data: CatFact = await res.json()
      setFact(data)
      setFactCount(prev => prev + 1)
      setHistory(prev => [...prev.slice(-4), data.fact])
    } catch (err) {
      console.error('Failed to fetch cat fact:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && !fact) fetchFact()
  }, [isOpen, fact, fetchFact])

  const handleClose = () => {
    setCopied(false)
    onClose()
  }

  const handleCopy = async () => {
    if (!fact) return
    await navigator.clipboard.writeText(fact.fact)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!fact) return
    const text = `Did you know? ${fact.fact} 🐱`
    if (navigator.share) {
      await navigator.share({ title: 'Cat Fact', text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  const handleNext = () => {
    setCopied(false)
    fetchFact()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border text-white rounded-2xl">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-violet-400" />

        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-6">
              <div>
                <DialogTitle className="text-zinc-500 text-base font-semibold leading-none mb-1">
                  Random Cat facts
                </DialogTitle>
              </div>
              <Badge
                variant="outline"
                className="ml-auto border-violet-500/30 text-violet-400 text-xs"
              >
                #{factCount}
              </Badge>
            </div>
          </DialogHeader>

          {/* Fact card */}
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-400 p-5 min-h-[120px] flex items-center justify-center mb-4">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={18} className="text-violet-400 animate-spin" />
                <p className="text-zinc-500 text-sm">Finding a fact...</p>
              </div>
            ) : (
              <p className="text-zinc-100 text-[15px] leading-relaxed text-center font-medium">
                {fact?.fact}
              </p>
            )}

            {/* Corner label */}
            {fact && !loading && (
              <span className="absolute bottom-3 right-3 text-xs text-zinc-600">
                {fact.length} chars
              </span>
            )}
          </div>

          {/* History dots */}
          {history.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {history.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === history.length - 1
                      ? 'w-4 h-1.5 bg-violet-500'
                      : 'w-1.5 h-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-800 p-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white h-9"
          >
            <Share2 size={13} className="mr-1.5" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`flex-1 h-9 transition-all border ${
              copied
                ? 'border-emerald-700 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950'
                : 'border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {copied
              ? <><Check size={13} className="mr-1.5" />Copied!</>
              : <><Copy size={13} className="mr-1.5" />Copy</>
            }
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 h-9 bg-violet-600 hover:bg-violet-700 text-white border-0 disabled:opacity-40"
          >
            <ArrowRight size={13} className="mr-1.5" />
            Next fact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}