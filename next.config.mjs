/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    images: {
      remotePatterns: [new URL('https://www.artic.edu/**')],
    },
}

export default nextConfig