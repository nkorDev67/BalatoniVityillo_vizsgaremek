import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/bejelentkezes',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/regisztracio',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
