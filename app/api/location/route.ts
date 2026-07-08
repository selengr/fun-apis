import { NextRequest, NextResponse } from 'next/server'
import type { IpstackData, IpstackError } from '@/types/ipstack'

const IPSTACK_BASE = 'https://api.ipstack.com'

// Always run fresh — otherwise a VPN switch keeps showing the old IP
export const dynamic = 'force-dynamic'

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return null
}

export async function GET(request: NextRequest) {
  const accessKey = process.env.IPSTACK_ACCESS_KEY

  if (!accessKey) {
    return NextResponse.json(
      { error: 'IPSTACK_ACCESS_KEY is not configured' },
      { status: 500 },
    )
  }

  const ipParam = request.nextUrl.searchParams.get('ip')
  const clientIp = getClientIp(request)

  const isLocal =
    !clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.')

  // Local dev: use /check (ipstack detects request IP) or explicit ?ip= override
  const endpoint =
    ipParam
      ? `${IPSTACK_BASE}/${ipParam}`
      : isLocal
        ? `${IPSTACK_BASE}/check`
        : `${IPSTACK_BASE}/${clientIp}`

  // security=1 → proxy/VPN/Tor/threat data; hostname=1 → reverse DNS
  const url = `${endpoint}?access_key=${accessKey}&security=1&hostname=1`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data: IpstackData | IpstackError = await res.json()

    if ('success' in data && data.success === false) {
      return NextResponse.json(
        { error: data.error.info },
        { status: 400 },
      )
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 502 },
    )
  }
}
