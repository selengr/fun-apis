export async function GET() {
  try {
    // Preferred endpoint from the brief (Heroku free dyno — often cold or retired)
    const primary = await fetch(
      'https://dog-facts-api.herokuapp.com/api/v1/resources/dogs?number=1',
      { next: { revalidate: 0 } },
    ).catch(() => null)

    if (primary?.ok) {
      const data = await primary.json()
      if (Array.isArray(data) && data[0]?.fact) {
        return Response.json(data)
      }
    }

    // Fallback — dogapi.dog (same [{ fact }] shape for the client)
    const res = await fetch('https://dogapi.dog/api/v2/facts', {
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return Response.json({ error: 'Failed to fetch dog fact' }, { status: 502 })
    }
    const json = await res.json()
    const fact: string | undefined = json?.data?.[0]?.attributes?.body
    if (!fact) {
      return Response.json({ error: 'Failed to fetch dog fact' }, { status: 502 })
    }
    return Response.json([{ fact }])
  } catch {
    return Response.json({ error: 'Failed to fetch dog fact' }, { status: 500 })
  }
}
