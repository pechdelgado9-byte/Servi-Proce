import path from 'node:path';

const backendOrigin = process.env.BACKEND_INTERNAL_URL || 'http://localhost:1337';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve('.'),
  },
  allowedDevOrigins: [
    '*.trycloudflare.com',
    '*.loca.lt',
    '*.pinggy.link',
    'localhost',
    '127.0.0.1',
    '192.168.1.*',
    '192.168.0.*',
  ],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: 'security',
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.trycloudflare.com',
        '*.loca.lt',
        '*.pinggy.link',
        '192.168.1.*:3000',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
