import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dudsclothes.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
