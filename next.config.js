/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果部署到 username.github.io/repo-name，取消下面的注释并修改
  // basePath: '/trae-1024-game',
  // assetPrefix: '/trae-1024-game',
}

module.exports = nextConfig
