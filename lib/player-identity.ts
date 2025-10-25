// 玩家身份识别系统
// Player Identity System

const PLAYER_ID_KEY = 'trae-player-id';

/**
 * 生成一个唯一的玩家 ID（UUID v4）
 * 使用浏览器原生的 crypto.randomUUID() API
 */
function generatePlayerId(): string {
  // 检查浏览器是否支持 crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 降级方案：使用 Math.random() 生成伪 UUID
  // 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 从 localStorage 读取玩家 ID
 */
function loadPlayerId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(PLAYER_ID_KEY);
  } catch (error) {
    console.error('Failed to load player ID:', error);
    return null;
  }
}

/**
 * 保存玩家 ID 到 localStorage
 */
function savePlayerId(playerId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  } catch (error) {
    console.error('Failed to save player ID:', error);
  }
}

/**
 * 获取或创建玩家 ID
 * - 如果 localStorage 中已存在，则返回现有的
 * - 如果不存在，则生成新的并保存
 *
 * @returns 玩家的唯一 ID（UUID 格式）
 */
export function getOrCreatePlayerId(): string {
  // 尝试从 localStorage 读取
  let playerId = loadPlayerId();

  // 如果不存在，则生成新的
  if (!playerId) {
    playerId = generatePlayerId();
    savePlayerId(playerId);
  }

  return playerId;
}

/**
 * 获取当前玩家 ID（如果存在）
 * 不会自动创建新的 ID
 *
 * @returns 玩家 ID 或 null（如果不存在）
 */
export function getCurrentPlayerId(): string | null {
  return loadPlayerId();
}

/**
 * 清除玩家 ID（用于测试或重置身份）
 * ⚠️ 谨慎使用：清除后将无法识别之前的提交记录
 */
export function clearPlayerId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PLAYER_ID_KEY);
  } catch (error) {
    console.error('Failed to clear player ID:', error);
  }
}
