import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker 배포용 최소 standalone 서버 출력 (.next/standalone/server.js)
  output: "standalone",
};

export default nextConfig;
