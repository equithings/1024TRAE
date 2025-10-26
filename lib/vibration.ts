// 手机震动工具函数

/**
 * 触发手机震动
 * @param pattern - 震动模式：number 表示震动时长（毫秒），number[] 表示震动和暂停的交替模式
 */
export function vibrate(pattern: number | number[] = 100): void {
  if (typeof window === 'undefined') return;
  
  // 检查浏览器是否支持震动 API
  if (!('vibrate' in navigator)) {
    console.warn('Vibration API is not supported in this browser');
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Failed to vibrate:', error);
  }
}

/**
 * 停止震动
 */
export function stopVibration(): void {
  if (typeof window === 'undefined') return;
  
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

/**
 * 预定义的震动模式
 */
export const VibrationPatterns = {
  // 短促单击
  short: 50,
  // 中等震动
  medium: 100,
  // 长震动
  long: 200,
  // 双击震动
  double: [50, 50, 50] as number[],
  // 字母收集震动（短-中-短）
  letterCollect: [80, 30, 120, 30, 80] as number[],
  // 成功震动
  success: [100, 50, 100, 50, 200] as number[],
  // 错误震动
  error: [200, 100, 200] as number[],
  // 单次合并震动
  singleMerge: 100,
  // 连续合并震动（更强，2次以上）- 长-短-长-短-超长
  multiMerge: [150, 40, 150, 40, 250] as number[],
};
