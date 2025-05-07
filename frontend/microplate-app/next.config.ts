// next.config.ts
// next.config.ts
import { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify:       true,
  compiler: {
    emotion: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // <-- เพิ่มตรงนี้
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',           // ทุกคำขอที่ขึ้นต้น /api/v1/
        destination: 'http://localhost:3100/api/v1/:path*',  
      },
      // ถ้ามี endpoint อื่นที่นอก /api/v1 ให้จับเพิ่มที่นี่
    ];
  },
};

export default nextConfig;
