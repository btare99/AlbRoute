import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: process.env.IS_CAPACITOR === 'true' ? 'export' : undefined,
  allowedDevOrigins: ['192.168.0.103', '172.20.10.2', 'localhost:3000', '192.168.0.102'],
  images: {
    unoptimized: true,
  },
  transpilePackages: ['leaflet', 'firebase-admin', 'jwks-rsa', 'jose'],
  turbopack: {},
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Fix for fsevents error on Windows
    config.externals = [...(config.externals || []), 'fsevents'];
    return config;
  },
  async headers() {
    if (process.env.IS_CAPACITOR === 'true') return [];
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "capacitor://localhost" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
} as any;

export default withPWA(nextConfig);
