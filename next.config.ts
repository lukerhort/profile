import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export -> ./out (GitHub Pages / Vercel / any static host)
  output: "export",
  images: {
    // No image server in a static export; images are pre-optimized by
    // scripts/optimize-images.mjs instead.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
