import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const word = searchParams.get("word");

  if (!word) {
    return Response.json(
      { error: "Word is required" },
      { status: 400 }
    );
  }

  const { data, error } = await unsplash.GET("/search/photos", {
    params: {
      query: {
        query: word,
        per_page: 1,
      },
    },
  });

  if (error) {
    return Response.json(error, { status: 500 });
  }

  const photo = data.results[0];

  return Response.json({
    image: photo?.urls.regular ?? null,
    thumbnail: photo?.urls.small ?? null,
    photographer: photo?.user.name ?? null,
    photographerUrl: photo?.user.links.html ?? null,
  });
}