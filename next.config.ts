import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  output: 'standalone',
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Extended timeout for video processing
  experimental: {
    serverMinification: true,
  },
};

export default nextConfig;
