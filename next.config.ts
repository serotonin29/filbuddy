import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Drive Y: sering gagal rename file cache webpack (ENOENT) sampai
  // manifest .next korup saat `next dev`. Matikan filesystem cache di dev.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
