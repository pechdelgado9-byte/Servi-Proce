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
