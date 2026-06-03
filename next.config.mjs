/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide the floating Next.js dev indicator (the "N" logo) in the bottom-left.
  devIndicators: false,
  poweredByHeader: false,
  images: {
    // Allow next/image to optimize the Unsplash placeholder images.
    // Local /uploads and /gallery images are same-origin and need no entry.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
