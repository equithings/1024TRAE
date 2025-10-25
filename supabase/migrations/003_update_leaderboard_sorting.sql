-- 更新排行榜排序逻辑：优先按最大方块，然后按移动次数
-- 修改日期：2025-10-25

-- 删除旧的索引
DROP INDEX IF EXISTS idx_leaderboard_play_time;

-- 创建新的复合索引：max_tile 降序，play_time 升序
CREATE INDEX IF NOT EXISTS idx_leaderboard_max_tile_play_time
  ON leaderboard(max_tile DESC, play_time ASC, created_at ASC)
  WHERE is_victory = true;

-- 更新自动清理函数：按新的排序规则清理
CREATE OR REPLACE FUNCTION clean_old_leaderboard_entries()
RETURNS TRIGGER AS $$
BEGIN
  -- 只保留按 max_tile 降序、play_time 升序的前2048名胜利玩家
  DELETE FROM leaderboard
  WHERE id IN (
    SELECT id FROM leaderboard
    WHERE is_victory = true
    ORDER BY max_tile DESC, play_time ASC, created_at ASC
    OFFSET 2048
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 立即执行一次清理（如果已有数据）
DELETE FROM leaderboard
WHERE id IN (
  SELECT id FROM leaderboard
  WHERE is_victory = true
  ORDER BY max_tile DESC, play_time ASC, created_at ASC
  OFFSET 2048
);

-- 更新注释
COMMENT ON FUNCTION clean_old_leaderboard_entries() IS '自动清理排行榜，按最大方块降序、移动次数升序保留前2048名胜利玩家';
COMMENT ON INDEX idx_leaderboard_max_tile_play_time IS '排行榜排序索引：最大方块降序、移动次数升序';
