import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendOrigin = process.env.BACKEND_INTERNAL_URL || 'http://localhost:1337';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: [
    'serviproce.com.mx',
    'www.serviproce.com.mx',
    '*.serviproce.com.mx',
    '*.trycloudflare.com',
    '*.loca.lt',
    '*.pinggy.link',
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '192.168.1.*',
    '192.168.0.*',
  ],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'serviproce.com.mx',
        'www.serviproce.com.mx',
        '*.serviproce.com.mx',
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
