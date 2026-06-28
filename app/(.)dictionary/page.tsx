'use client'
import { useRouter } from 'next/navigation'
import DictionaryModal from '@/components/views/DictionaryPage'

export default function DictionaryIntercepted() {
  const router = useRouter()

  return (
    <DictionaryModal
      isOpen={true}
      onClose={() => router.back()}
    />
  )
}