// 路径工具函数 - 统一处理 basePath

/**
 * 获取当前环境的 basePath
 * @returns basePath 字符串
 */
export function getBasePath(): string {
  // 在生产环境使用 GitHub Pages 的仓库名作为 basePath
  return process.env.NODE_ENV === 'production' ? '/1024TRAE' : '';
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
