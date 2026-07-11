const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API = 'https://api.spotify.com/v1'

let cachedToken: { value: string; expiresAt: number } | null = null

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local')
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Spotify token error ${res.status}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  }
  return cachedToken.value
}

export async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getSpotifyToken()
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Spotify API error ${res.status}`)
  }
  return res.json() as Promise<T>
}
