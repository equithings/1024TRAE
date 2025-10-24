-- TRAE 1024 Leaderboard Table
-- 排行榜表结构

-- 创建排行榜表
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  max_tile INTEGER NOT NULL,
  letters_collected TEXT[] DEFAULT '{}',
  is_victory BOOLEAN DEFAULT FALSE,
  play_time INTEGER, -- 游戏时长（秒）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_victory ON leaderboard(is_victory);

-- 启用行级安全策略 (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取排行榜
CREATE POLICY "Allow public read access"
  ON leaderboard
  FOR SELECT
  USING (true);

-- 允许插入分数（无需认证）
CREATE POLICY "Allow public insert"
  ON leaderboard
  FOR INSERT
  WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE leaderboard IS 'TRAE 1024 游戏排行榜';
COMMENT ON COLUMN leaderboard.player_name IS '玩家昵称';
COMMENT ON COLUMN leaderboard.score IS '游戏分数';
COMMENT ON COLUMN leaderboard.max_tile IS '最大方块数值';
COMMENT ON COLUMN leaderboard.letters_collected IS '已收集的字母数组';
COMMENT ON COLUMN leaderboard.is_victory IS '是否达成胜利（TRAE+1024）';
COMMENT ON COLUMN leaderboard.play_time IS '游戏时长（秒）';
