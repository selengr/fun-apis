import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { QrBarcodeGenerator } from '@/components/qr-barcode-generator'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'QR & Barcode Generator',
  description: 'Create QR codes and barcodes from links, text, email, or phone — download as PNG or SVG',
}

const NAV_GLASS = {
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  background: 'var(--is-dark) ? rgba(26,26,26,0.30) : rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export default function QrPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[480px] h-[480px] rounded-full bg-violet-400/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full bg-sky-400/[0.06] blur-[110px]" />
      </div>

      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
          style={NAV_GLASS}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all tracking-wide cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back home
          </Link>
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/50 dark:text-white/50 hidden sm:inline">
            QR & BARCODE
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="pt-24 pb-4 px-4 text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
          QR & Barcode Generator
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Paste a link or message — download your code in seconds.
        </p>
      </div>

      <QrBarcodeGenerator />
    </main>
  )
}
