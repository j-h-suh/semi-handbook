import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 단일 이미지용 — node_modules 통째 없이 최소 standalone 산출
  output: 'standalone',
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  async redirects() {
    return [
      {
        source: '/chapter/:slug*',
        destination: '/semi/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
