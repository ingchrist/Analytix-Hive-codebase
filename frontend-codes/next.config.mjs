/** @type {import('next').NextConfig} */
const nextConfig = {
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
  assetPrefix: process.env.CODESPACES ? `https://${process.env.CODESPACE_NAME}-3001.app.github.dev` : undefined,
  webSocketPrefix: process.env.CODESPACES ? `wss://${process.env.CODESPACE_NAME}-3001.app.github.dev` : undefined,
  // Enable CORS
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
}
