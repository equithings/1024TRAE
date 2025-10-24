// Supabase 客户端配置

import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/types/game';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 提交分数到排行榜
export async function submitScore(data: {
  playerName: string;
  score: number;
  maxTile: number;
  lettersCollected: string[];
  isVictory: boolean;
  playTime: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // === 防刷分验证 ===

    // 1. 验证玩家名称
    const sanitizedName = data.playerName
      .trim()
      .replace(/[<>"']/g, '') // 移除危险字符
      .substring(0, 20); // 限制长度

    if (!sanitizedName || sanitizedName.length < 1) {
      return { success: false, error: '请输入有效的玩家名称' };
    }

    // 2. 验证分数合理性（5x5棋盘最大可能分数约为8192）
    if (data.score < 0 || data.score > 10000) {
      return { success: false, error: '分数异常，请勿作弊' };
    }

    // 3. 验证最大方块必须是2的幂
    const validTiles = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
    if (!validTiles.includes(data.maxTile)) {
      return { success: false, error: '最大方块数值异常' };
    }

    // 4. 验证胜利条件
    if (data.isVictory) {
      // 必须收集完整TRAE字母
      if (!data.lettersCollected || data.lettersCollected.length !== 4) {
        return { success: false, error: '字母收集不完整' };
      }

      // 必须按顺序收集
      const expectedSequence = ['T', 'R', 'A', 'E'];
      for (let i = 0; i < 4; i++) {
        if (data.lettersCollected[i] !== expectedSequence[i]) {
          return { success: false, error: '字母顺序错误' };
        }
      }

      // 必须达成1024
      if (data.maxTile !== 1024) {
        return { success: false, error: '未达成1024方块' };
      }
    }

    // 5. 验证移动次数合理性（最少需要10步才能完成）
    if (data.isVictory && data.playTime < 10) {
      return { success: false, error: '移动次数过少，数据异常' };
    }

    // 6. 限制提交频率（本地存储，10秒内不能重复提交）
    if (typeof window !== 'undefined') {
      const lastSubmitTime = localStorage.getItem('trae_last_submit_time');
      if (lastSubmitTime) {
        const elapsed = Date.now() - parseInt(lastSubmitTime);
        if (elapsed < 10000) {
          return { success: false, error: '提交过于频繁，请稍后再试' };
        }
      }
    }

    // === 验证通过，插入数据 ===
    const { error } = await supabase.from('leaderboard').insert([
      {
        player_name: sanitizedName,
        score: data.score,
        max_tile: data.maxTile,
        letters_collected: data.lettersCollected,
        is_victory: data.isVictory,
        play_time: data.playTime,
      },
    ]);

    if (error) {
      console.error('Error submitting score:', error);
      return { success: false, error: error.message };
    }

    // 记录提交时间
    if (typeof window !== 'undefined') {
      localStorage.setItem('trae_last_submit_time', Date.now().toString());
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '提交失败，请重试' };
  }
}

// 获取排行榜（按分数降序，移动次数升序，取前1024名）
export async function getLeaderboard(
  limit: number = 1024
): Promise<{ data: LeaderboardEntry[]; error?: string }> {
  try {
    // 限制最多1024名
    const actualLimit = Math.min(limit, 1024);

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('is_victory', true) // 只显示胜利的玩家
      .order('score', { ascending: false }) // 按分数降序
      .order('play_time', { ascending: true }) // 分数相同时，移动次数越少越好
      .order('created_at', { ascending: true }) // 再相同时，早达成者优先
      .limit(actualLimit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: [], error: 'Unexpected error occurred' };
  }
}

// 获取个人排名（按分数）
export async function getPlayerRank(
  score: number
): Promise<{ rank: number | null; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('is_victory', true)
      .gt('score', score); // 分数高于当前玩家的人数

    if (error) {
      console.error('Error fetching rank:', error);
      return { rank: null, error: error.message };
    }

    return { rank: (count || 0) + 1 };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { rank: null, error: 'Unexpected error occurred' };
  }
}

// 获取胜利玩家数量
export async function getVictoryCount(): Promise<number> {
  try {
    const { count } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('is_victory', true);

    return count || 0;
  } catch (err) {
    console.error('Error fetching victory count:', err);
    return 0;
  }
}