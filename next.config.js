/** @type {import('next').NextConfig} */

const nextConfig = {
  // Only use standalone output in non-Vercel environments
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Ensure CSS is properly handled
  transpilePackages: ['next-themes'],
  // Use the new ESLint flat config format
  eslint: {
    ignoreDuringBuilds: true, // Set to true to bypass ESLint during build
  },
  // Disable the standalone output warning for missing files
  outputFileTracingExcludes: {
    '*': ['**/node_modules/**', '**/(marketing)/**'],
  },
};

module.exports = nextConfig;