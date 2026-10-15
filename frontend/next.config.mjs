import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve('.'),
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;


