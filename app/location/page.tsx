import { UserLocationFinder } from '@/components/user-location-finder'

export const metadata = {
  title: 'Where Am I? — Signal Geo',
  description: 'IP-based location intercept — city, carrier, and map fix',
}

export default function LocationPage() {
  return (
    <main>
      <UserLocationFinder />
    </main>
  )
}
