/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 条件性 basePath 配置
  // - GitHub Pages: 需要 /1024TRAE 前缀（通过环境变量 NEXT_PUBLIC_BASE_PATH=github 指定）
  // - Vercel/EdgeOne/其他平台: 不需要前缀（由平台自动处理路由）
  // - 本地开发: 不使用前缀
  //
  // 使用方法：
  // - GitHub Pages 部署时设置环境变量 NEXT_PUBLIC_BASE_PATH=github
  // - 其他平台部署时不设置该环境变量（或设置为其他值）
  basePath: process.env.NEXT_PUBLIC_BASE_PATH === 'github' ? '/1024TRAE' : '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH === 'github' ? '/1024TRAE' : '',
}

module.exports = nextConfig
