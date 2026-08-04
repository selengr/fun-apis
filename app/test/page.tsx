import { TestLab } from '@/components/test-lab'

export const metadata = {
  title: 'Test Lab — Unused Component Samples',
  description: 'Temporary route mounting orphaned components as templates.',
  robots: { index: false, follow: false },
}

export default function TestPage() {
  return <TestLab />
}
