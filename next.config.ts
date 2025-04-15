import type { NextConfig } from "next";

interface ExtendedNextConfig extends NextConfig {
  allowedDevOrigins?: string[]; // Extend the NextConfig type to include allowedDevOrigins
}

const nextConfig: ExtendedNextConfig = {
  async headers() {
    return [
      {
        source: "/_next/:path*", // Match all Next.js internal resources
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://192.168.56.1:3000", // Replace with your development origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/:path*", // Match all other resources
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://192.168.56.1:3000", // Replace with your development origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["http://192.168.56.1:3000", "*.local-origin.dev"], // Add allowedDevOrigins for development
};

export default nextConfig;