import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  // This explicitly tells Next.js where to find the source files
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@core": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};

export default nextConfig;
