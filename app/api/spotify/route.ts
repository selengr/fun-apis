import { NextRequest, NextResponse } from 'next/server'
import { spotifyFetch } from '@/lib/spotify'
import type {
  MusicAlbumView,
  MusicArtistView,
  MusicExplorerPayload,
  MusicPlaylistView,
  MusicTrackView,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack,
} from '@/types/spotify'

export const dynamic = 'force-dynamic'

function mapArtist(a: SpotifyArtist): MusicArtistView {
  return {
    id: a.id,
    name: a.name,
    genres: a.genres ?? [],
    popularity: a.popularity ?? 0,
    followers: a.followers?.total ?? 0,
    image: a.images?.[0]?.url ?? a.images?.[1]?.url ?? null,
    spotifyUrl: a.external_urls?.spotify ?? `https://open.spotify.com/artist/${a.id}`,
  }
}

function mapTrack(t: SpotifyTrack): MusicTrackView {
  return {
    id: t.id,
    name: t.name,
    durationMs: t.duration_ms,
    previewUrl: t.preview_url,
    popularity: t.popularity ?? 0,
    albumName: t.album?.name ?? '',
    albumImage: t.album?.images?.[0]?.url ?? t.album?.images?.[1]?.url ?? null,
    artists: (t.artists ?? []).map(x => x.name).join(', '),
    spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
  }
}

function mapAlbum(a: SpotifyAlbum): MusicAlbumView {
  return {
    id: a.id,
    name: a.name,
    year: (a.release_date ?? '').slice(0, 4),
    type: a.album_type,
    tracks: a.total_tracks,
    image: a.images?.[0]?.url ?? a.images?.[1]?.url ?? null,
    spotifyUrl: a.external_urls?.spotify ?? `https://open.spotify.com/album/${a.id}`,
  }
}

function mapPlaylist(p: SpotifyPlaylist): MusicPlaylistView {
  return {
    id: p.id,
    name: p.name,
    description: (p.description ?? '').replace(/<[^>]+>/g, '').slice(0, 120),
    image: p.images?.[0]?.url ?? null,
    owner: p.owner?.display_name ?? 'Spotify',
    tracks: p.tracks?.total ?? 0,
    spotifyUrl: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
  }
}

async function similarArtists(artist: SpotifyArtist): Promise<MusicArtistView[]> {
  try {
    const related = await spotifyFetch<{ artists: SpotifyArtist[] }>(
      `/artists/${artist.id}/related-artists`,
    )
    if (related.artists?.length) {
      return related.artists.slice(0, 8).map(mapArtist)
    }
  } catch {
    /* related-artists may be unavailable */
  }

  const genre = artist.genres?.[0]
  if (!genre) return []

  try {
    const data = await spotifyFetch<{ artists: { items: SpotifyArtist[] } }>(
      `/search?q=${encodeURIComponent(`genre:"${genre}"`)}&type=artist&limit=10`,
    )
    return (data.artists?.items ?? [])
      .filter(a => a.id !== artist.id)
      .slice(0, 8)
      .map(mapArtist)
  } catch {
    return []
  }
}

async function buildArtistPayload(artistId: string): Promise<MusicExplorerPayload> {
  const [artist, top, albums] = await Promise.all([
    spotifyFetch<SpotifyArtist>(`/artists/${artistId}`),
    spotifyFetch<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=US`),
    spotifyFetch<{ items: SpotifyAlbum[] }>(
      `/artists/${artistId}/albums?include_groups=album,single&market=US&limit=16`,
    ),
  ])

  const [similar, playlistSearch] = await Promise.all([
    similarArtists(artist),
    spotifyFetch<{ playlists: { items: (SpotifyPlaylist | null)[] } }>(
      `/search?q=${encodeURIComponent(artist.name)}&type=playlist&limit=8`,
    ).catch(() => ({ playlists: { items: [] as (SpotifyPlaylist | null)[] } })),
  ])

  const seen = new Set<string>()
  const albumViews: MusicAlbumView[] = []
  for (const a of albums.items ?? []) {
    const key = a.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    albumViews.push(mapAlbum(a))
    if (albumViews.length >= 8) break
  }

  return {
    artist: mapArtist(artist),
    topTracks: (top.tracks ?? []).slice(0, 10).map(mapTrack),
    albums: albumViews,
    similar,
    playlists: (playlistSearch.playlists?.items ?? [])
      .filter((p): p is SpotifyPlaylist => Boolean(p?.id))
      .slice(0, 6)
      .map(mapPlaylist),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') ?? 'search'

  try {
    if (action === 'suggest') {
      const q = (searchParams.get('q') ?? '').trim()
      if (!q) return NextResponse.json({ artists: [] })

      const data = await spotifyFetch<{ artists: { items: SpotifyArtist[] } }>(
        `/search?q=${encodeURIComponent(q)}&type=artist&limit=6`,
      )
      return NextResponse.json({
        artists: (data.artists?.items ?? []).map(mapArtist),
      })
    }

    if (action === 'search' || action === 'artist') {
      let artistId = searchParams.get('id') ?? ''

      if (!artistId) {
        const q = (searchParams.get('q') ?? '').trim() || 'Imagine Dragons'
        const data = await spotifyFetch<{ artists: { items: SpotifyArtist[] } }>(
          `/search?q=${encodeURIComponent(q)}&type=artist&limit=1`,
        )
        artistId = data.artists?.items?.[0]?.id ?? ''
        if (!artistId) {
          return NextResponse.json({ error: 'No artist found' }, { status: 404 })
        }
      }

      const payload = await buildArtistPayload(artistId)
      return NextResponse.json(payload)
    }

    if (action === 'new-releases') {
      const data = await spotifyFetch<{ albums: { items: SpotifyAlbum[] } }>(
        '/browse/new-releases?limit=8&country=US',
      )
      return NextResponse.json({
        albums: (data.albums?.items ?? []).map(mapAlbum),
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Spotify request failed'
    const premium =
      /premium subscription required/i.test(message)
        ? 'Your Spotify Developer app needs a Premium account on the owner. Upgrade the account that created the app, wait a few hours, then try again.'
        : null
    return NextResponse.json(
      { error: premium ?? message },
      { status: 502 },
    )
  }
}
