-- Add player_id field for player identity tracking
-- 添加 player_id 字段用于玩家身份识别

-- 添加 player_id 字段（VARCHAR(36) 用于存储 UUID）
ALTER TABLE leaderboard ADD COLUMN player_id VARCHAR(36);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_leaderboard_player_id ON leaderboard(player_id);

-- 添加注释
COMMENT ON COLUMN leaderboard.player_id IS '玩家唯一标识符（localStorage 中的 UUID）';
