/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 部署配置（仅生产环境）
  basePath: process.env.NODE_ENV === 'production' ? '/1024TRAE' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/1024TRAE' : '',
}

module.exports = nextConfig
