// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    REGION_SECRET: process.env.REGION_SECRET,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
