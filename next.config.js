/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Ensure CSS is properly handled
  transpilePackages: ['next-themes'],
  // Use the new ESLint flat config format
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable the standalone output warning for missing files
  outputFileTracingExcludes: {
    '*': ['**/node_modules/**', '**/(marketing)/**'],
  },
};

module.exports = nextConfig; 