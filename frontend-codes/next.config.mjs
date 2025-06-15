import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ]
  },
  experimental: {
    allowedDevOrigins: ["https://*-3001.app.github.dev"],
  },
  // Configure for Codespaces environment
  assetPrefix: process.env.CODESPACES ? `https://${process.env.CODESPACE_NAME}-3001.preview.app.github.dev` : '',
  basePath: process.env.CODESPACES ? `/${process.env.CODESPACE_NAME}` : '',
  // CORS headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  // Server configuration
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
}

export default nextConfig
