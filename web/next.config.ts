import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to allow and compile imports from the parent directory
  experimental: {
    externalDir: true,
  },
  // If there are specific packages we need to transpile, we can add them here
  transpilePackages: ["@core"],
};

export default nextConfig;
