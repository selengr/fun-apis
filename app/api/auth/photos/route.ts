import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export async function GET() {
  const result = await unsplash.GET("/photos", {
    params: {
      query: { page: 1, per_page: 10 },
    },
  });

  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json(result.data);
}