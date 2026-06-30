import { DictionaryContent } from '@/components/views/DictionaryContent'
import { GradientBackground } from '@/components/views/GradientBackground'

export default function DictionaryPage() {
  return (
   <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GradientBackground />
      <div className="absolute inset-0 -z-10 bg-black/20" />
          <div className="overflow-hidden w-full max-w-xl bg-white rounded-2xl">
           <DictionaryContent />
          </div>
    </main>
  )
}