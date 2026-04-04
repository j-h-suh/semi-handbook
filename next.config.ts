import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
