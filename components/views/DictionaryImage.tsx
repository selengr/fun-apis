"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ImageResult = {
  image: string | null;
  thumbnail: string |null;
  photographer: string | null;
  photographerUrl: string | null;
};

type DictionaryImageProps = {
  word: string;
};

export default function DictionaryImage({
  word,
}: DictionaryImageProps) {
  const [photo, setPhoto] = useState<ImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!word.trim()) {
      setPhoto(null);
      return;
    }

    const controller = new AbortController();

    async function fetchImage() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/photos?word=${encodeURIComponent(word)}`,
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch image");
        }

        const data: ImageResult = await res.json();
        setPhoto(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchImage();

    return () => controller.abort();
  }, [word]);

  if (loading) {
    return <ImageSkeleton />;
  }

//   if (error) {
//     return (
//       <div className="rounded-lg border p-4 text-red-500">
//         {error}
//       </div>
//     );
//   }

  if (!photo?.image) { return null
//     return (
//           <div className="relative aspect-[4/4] space-y-3 space-x-3 w-full h-32 overflow-hidden rounded-xl">
//       <div className="rounded-lg border p-6 text-center text-gray-500">
//         No image found.
//       </div>
//           </div>
          
//     );
  }

  return (
    // <div className="space-y-3 h-32 w-80">
      <div className="relative aspect-[4/4] space-y-3 space-x-3 w-full h-32 overflow-hidden rounded-xl">
        <Image
          src={photo?.image}
          alt={word}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 600px"
          priority={false}
        />
      </div>
    // </div>
  );
}

function ImageSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
    </div>
  );
}