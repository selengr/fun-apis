'use client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DictionaryContent } from '@/components/views/DictionaryContent'

export default function DictionaryIntercepted() {
  const router = useRouter()

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-background">
        <div className="overflow-y-scroll min-h-[60vh] max-h-[60vh] p-4">
          <DictionaryContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}