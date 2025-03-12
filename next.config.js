// /** @type {import('next').NextConfig} */

// const nextConfig = {
//   // Only use standalone output in non-Vercel environments
//   output: 'standalone',
//   // output: process.env.VERCEL ? undefined : 'standalone',
//   images: {
//     unoptimized: process.env.NODE_ENV !== 'production',
//   },
//   // Ensure CSS is properly handled
//   transpilePackages: ['next-themes'],
//   // Use the new ESLint flat config format
//   eslint: {
//     ignoreDuringBuilds: true, // Set to true to bypass ESLint during build
//   },
//   // Disable the standalone output warning for missing files
//   outputFileTracingExcludes: {
//     '*': ['**/node_modules/**', '**/marketing/**'],
//   },
// };

// module.exports = nextConfig;

/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }]
  }
}

export default nextConfig