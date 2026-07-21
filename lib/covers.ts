const OL_COVERS = 'https://covers.openlibrary.org'

export async function fetchCoverImage(
  opts: { id?: number; isbn?: string; size?: 'S' | 'M' | 'L' },
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const { id, isbn, size = 'M' } = opts
  if (!id && !isbn) return null

  const sizes: ('S' | 'M' | 'L')[] = [size, 'M', 'L', 'S']
  const sizeOrder = [...new Set(sizes)]

  const attempts: string[] = []
  for (const s of sizeOrder) {
    if (id) attempts.push(`${OL_COVERS}/b/id/${id}-${s}.jpg?default=false`)
  }
  for (const s of sizeOrder) {
    if (isbn) attempts.push(`${OL_COVERS}/b/isbn/${isbn}-${s}.jpg?default=false`)
  }

  for (const url of [...new Set(attempts)]) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8_000)
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'fun-apis/1.0 (cover proxy)' },
        signal: ctrl.signal,
        next: { revalidate: 604800 },
      })
      clearTimeout(timer)
      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('image')) continue
      const body = await res.arrayBuffer()
      // Open Library returns a tiny placeholder gif when missing — reject those
      if (body.byteLength < 1000) continue
      return { body, contentType: ct }
    } catch {
      clearTimeout(timer)
      continue
    }
  }

  return null
}

export async function coverIsAvailable(id?: number, isbn?: string): Promise<boolean> {
  if (!id && !isbn) return false
  const result = await fetchCoverImage({ id, isbn, size: 'M' })
  return result !== null
}
