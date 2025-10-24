/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 部署配置
  basePath: '/1024TRAE',
  assetPrefix: '/1024TRAE',
}

module.exports = nextConfig
