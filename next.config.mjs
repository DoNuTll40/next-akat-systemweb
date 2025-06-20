// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/hospital',
  assetPrefix: '/hospital',
  images: {
    unoptimized: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);
