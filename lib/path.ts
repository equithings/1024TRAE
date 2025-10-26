// 路径工具函数 - 统一处理 basePath

/**
 * 获取当前环境的 basePath
 * @returns basePath 字符串
 *
 * 配置逻辑：
 * - GitHub Pages: 需要 /1024TRAE 前缀（通过环境变量 NEXT_PUBLIC_BASE_PATH=github 指定）
 * - Vercel/EdgeOne/CF Pages/其他平台: 不需要前缀
 * - 本地开发: 不需要前缀
 */
export function getBasePath(): string {
  // 只有在明确设置 NEXT_PUBLIC_BASE_PATH=github 时才使用 /1024TRAE 前缀
  return process.env.NEXT_PUBLIC_BASE_PATH === 'github' ? '/1024TRAE' : '';
}

/**
 * 为路径添加 basePath 前缀
 * @param path - 原始路径（以 / 开头）
 * @returns 带 basePath 的完整路径
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

/**
 * 为资源路径添加 basePath（用于静态资源如图片、音频等）
 * @param assetPath - 资源路径（以 / 开头）
 * @returns 带 basePath 的完整资源路径
 */
export function assetPath(assetPath: string): string {
  return withBasePath(assetPath);
}
