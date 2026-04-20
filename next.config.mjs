import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 10 } }
    },
    {
      urlPattern: /\/api\/agent\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'agent-api',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
      }
    },
    {
      urlPattern: /\/agent\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'agent-pages',
        networkTimeoutSeconds: 5,
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default pwaConfig(nextConfig);
