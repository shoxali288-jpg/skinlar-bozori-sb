/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'community.akamai.steamstatic.com',
        pathname: '/economy/image/**',
      },
      {
        protocol: 'https',
        hostname: 'community.cloudflare.steamstatic.com',
        pathname: '/economy/image/**',
      },
    ],
  },
};

export default nextConfig;
