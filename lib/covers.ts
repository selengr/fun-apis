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
    if (id) attempts.push(`${OL_COVERS}/b/id/${id}-${s}.jpg`)
  }
  for (const s of sizeOrder) {
    if (isbn) attempts.push(`${OL_COVERS}/b/isbn/${isbn}-${s}.jpg`)
  }

  for (const url of [...new Set(attempts)]) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'fun-apis/1.0 (cover proxy)' },
        next: { revalidate: 604800 },
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('image')) continue
      const body = await res.arrayBuffer()
      if (body.byteLength < 200) continue
      return { body, contentType: ct }
    } catch {
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
