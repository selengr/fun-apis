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
      ],
    },
}

export default nextConfig