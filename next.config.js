/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 所有平台统一配置，不使用 basePath
  // 适用于提供独立域名的平台：Vercel、Cloudflare Pages、Tencent Cloud 等
}

module.exports = nextConfig
