import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Force webpack if possible or ensure safe handling of native modules
  webpack: (config) => {
    config.externals.push("better-sqlite3");
    return config;
  },
};

export default nextConfig;
