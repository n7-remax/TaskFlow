import type { NextConfig } from 'next';

/** Where the Express API listens. The browser never calls it directly: `/api/v1/*` is proxied, so cookies stay same-origin. */
const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4401';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${apiUrl}/api/v1/:path*` }];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
