/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    images: {
      remotePatterns: [
        new URL('https://www.artic.edu/**'),
        new URL('https://covers.openlibrary.org/**'),
        new URL('https://images.metmuseum.org/**'),
        new URL('https://i.scdn.co/**'),
        new URL('https://mosaic.scdn.co/**'),
        new URL('https://image-cdn-ak.spotifycdn.com/**'),
        new URL('https://image-cdn-fa.spotifycdn.com/**'),
        new URL('https://images.unsplash.com/**'),
      ],
    },
}

export default nextConfig