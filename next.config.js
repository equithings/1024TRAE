/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 条件性 basePath 配置
  // - GitHub Pages: 需要 /1024TRAE 前缀
  // - Vercel 等其他平台: 不需要前缀（由平台自动处理路由）
  // - 本地开发: 不使用前缀
  basePath: process.env.VERCEL ? '' : (process.env.NODE_ENV === 'production' ? '/1024TRAE' : ''),
  assetPrefix: process.env.VERCEL ? '' : (process.env.NODE_ENV === 'production' ? '/1024TRAE' : ''),
}

module.exports = nextConfig
