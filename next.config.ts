import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Ensure CSS is properly handled
  transpilePackages: ['next-themes'],
};

export default nextConfig;
