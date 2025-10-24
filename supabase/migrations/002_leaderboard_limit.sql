-- 排行榜容量限制和自动清理
-- 最多存储2048名玩家，自动删除超出部分

-- 创建自动清理函数
CREATE OR REPLACE FUNCTION clean_old_leaderboard_entries()
RETURNS TRIGGER AS $$
BEGIN
  -- 只保留按 play_time 排序的前2048名胜利玩家
  DELETE FROM leaderboard
  WHERE id IN (
    SELECT id FROM leaderboard
    WHERE is_victory = true
    ORDER BY play_time ASC, created_at ASC
    OFFSET 2048
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：每次插入后自动清理
DROP TRIGGER IF EXISTS trigger_clean_leaderboard ON leaderboard;
CREATE TRIGGER trigger_clean_leaderboard
  AFTER INSERT ON leaderboard
  FOR EACH STATEMENT
  EXECUTE FUNCTION clean_old_leaderboard_entries();

-- 添加 play_time 索引以优化查询和清理
CREATE INDEX IF NOT EXISTS idx_leaderboard_play_time ON leaderboard(play_time ASC, created_at ASC) WHERE is_victory = true;

-- 立即执行一次清理（如果已有数据）
DELETE FROM leaderboard
WHERE id IN (
  SELECT id FROM leaderboard
  WHERE is_victory = true
  ORDER BY play_time ASC, created_at ASC
  OFFSET 2048
);

-- 添加说明注释
COMMENT ON FUNCTION clean_old_leaderboard_entries() IS '自动清理排行榜，只保留前2048名胜利玩家';
