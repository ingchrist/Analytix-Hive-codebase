import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["https://*-3001.app.github.dev"],
  },
  // Add Codespaces-specific configuration
  assetPrefix: process.env.CODESPACES ? `https://${process.env.CODESPACE_NAME}-3001.app.github.dev` : undefined,
  webSocketPrefix: process.env.CODESPACES ? `wss://${process.env.CODESPACE_NAME}-3001.app.github.dev` : undefined,
};

export default nextConfig;