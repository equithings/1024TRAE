# 🚀 TRAE 1024 部署前检查清单

## 📋 检查时间：2025-10-24

---

## ✅ 1. 游戏设计合理性分析

### 1.1 核心玩法
- ✅ **基础2048机制** - 实现正确 保留1024
- ⚠️ **棋盘大小** - 当前是 **5x5**（GRID_SIZE = 5），建议改为 **4x4** 以符合PRD设计
- ⚠️ **初始数字** - 当前最低是 **4和8**，传统2048应该是 **2和4**
- ✅ **字母收集** - T→R→A→E 顺序正确
- ✅ **胜利条件** - TRAE+1024 双重条件正确


### 1.2 平衡性问题
| 问题 | 当前设置 | 建议 | 优先级 |
|------|---------|------|--------|
| 棋盘过大 | 5x5 (25格) | 改为4x4 (16格) | 🔴 高 |
| 起始数字偏高 | 4/8 | 改为2/4 | 🔴 高 |
| 字母概率 | 15% | 可降至10% | 🟡 中 |

**回答**：
保留现在的玩法,就是1024,然棋盘5x5不用修改,
起始数字就是4/8不变
修改最后一个字母E的修改为5%,其他概率不变
---

## 🔒 2. 安全漏洞检查

### 2.1 防刷分机制
❌ **严重问题：缺少服务端验证**

**当前问题**：
- 客户端直接调用 Supabase 插入数据
- 没有分数合理性校验
- 没有频率限制
- 可通过浏览器DevTools修改分数

**解决方案**：
```typescript
// 方案1：添加 Supabase Edge Function 验证（推荐）
// supabase/functions/submit-score/index.ts
export async function handler(req: Request) {
  const { score, maxTile, playTime } = await req.json();

  // 1. 验证分数合理性
  if (score < 0 || score > 8192) {
    return new Response(JSON.stringify({ error: 'Invalid score' }), { status: 400 });
  }

  // 2. 验证maxTile必须是2的幂
  if (![2,4,8,16,32,64,128,256,512,1024,2048,4096,8192].includes(maxTile)) {
    return new Response(JSON.stringify({ error: 'Invalid max tile' }), { status: 400 });
  }

  // 3. 限流：同IP每分钟最多3次
  // ... 实现限流逻辑

  // 4. 插入数据库
  // ...
}
```

**方案2：简化版（最小改动）**
```typescript
// lib/supabase.ts - 添加客户端基础验证
export async function submitScore(data: {
  playerName: string;
  score: number;
  maxTile: number;
  lettersCollected: string[];
  isVictory: boolean;
  playTime: number;
}): Promise<{ success: boolean; error?: string }> {
  // 基础验证
  if (data.score < 0 || data.score > 8192) {
    return { success: false, error: '分数异常' };
  }

  if (data.isVictory && (!data.lettersCollected || data.lettersCollected.length !== 4)) {
    return { success: false, error: '字母收集不完整' };
  }

  if (data.isVictory && data.maxTile !== 1024) {
    return { success: false, error: '未达成1024' };
  }

  // 限制提交频率（本地）
  const lastSubmitTime = localStorage.getItem('lastSubmitTime');
  if (lastSubmitTime) {
    const elapsed = Date.now() - parseInt(lastSubmitTime);
    if (elapsed < 10000) { // 10秒内不能重复提交
      return { success: false, error: '提交过于频繁，请稍后再试' };
    }
  }

  try {
    const { error } = await supabase.from('leaderboard').insert([
      {
        player_name: data.playerName.substring(0, 20), // 限制长度
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

    localStorage.setItem('lastSubmitTime', Date.now().toString());
    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
```

### 2.2 XSS 防护
✅ **基本安全** - React 自动转义
⚠️ **需改进**：
```typescript
// components/UI/VictoryModal.tsx - 添加输入过滤
const handleSubmit = async () => {
  const sanitizedName = playerName
    .trim()
    .replace(/[<>\"']/g, '') // 移除危险字符
    .substring(0, 20);

  if (!sanitizedName) {
    setError('请输入有效名称');
    return;
  }
  // ...
}
```

### 2.3 SQL注入
✅ **安全** - Supabase 使用参数化查询

---

## 🚀 3. Vercel 部署并发能力分析

### 3.1 Vercel 免费版限制
| 指标 | 免费版限制 | 预估支持人数 |
|------|-----------|------------|
| **并发函数执行** | 10个 | ~100-200 同时在线 |
| **带宽** | 100GB/月 | ~10,000次访问/月 |
| **函数执行时长** | 10秒 | 足够 |
| **Edge Network** | 全球CDN | ✅ 快速 |

### 3.2 Supabase 免费版限制
| 指标 | 免费版限制 | 预估支持 |
|------|-----------|---------|
| **数据库大小** | 500MB | ~100万条记录 |
| **API请求** | 无限制 | ✅ 足够 |
| **并发连接** | 60个 | ~500-1000 在线 |
| **行级安全（RLS）** | ✅ 支持 | ✅ 已启用 |

### 3.3 总结
**预估最大支持**：
- **同时在线玩家**：100-200人
- **每日独立访客**：1,000-5,000人
- **月度总访问量**：~10,000次

**扩容建议**：
- 超过1000日活 → 升级 Vercel Pro ($20/月)
- 超过5000日活 → 考虑自建服务器

---

## 🔊 4. 声音卡顿问题分析

### 4.1 问题根源
❌ **发现的问题**：

**问题1：音频对象重复创建**
```typescript
// lib/sounds.ts 第42行
// 问题：每次播放都重置 currentTime
audio.currentTime = 0; // 这会导致卡顿
```

**问题2：音频未完全加载就播放**
```typescript
// 问题：preload='auto' 不保证音频已加载
const audio = new Audio(path);
audio.preload = 'auto'; // 异步加载，可能还未完成
```

**问题3：频繁播放同一音效**
- 合并操作可能同时触发多次音效
- 没有防抖机制

### 4.2 解决方案

**修复版 sounds.ts**：
```typescript
// 优化后的音效系统
const SOUNDS = {
  merge: '/sounds/foldedAreas.mp3',
  move: '/sounds/move.mp3',
  collect: '/sounds/collect.mp3',
  victory: '/sounds/victory.mp3',
} as const;

// 使用音频池，避免重复创建
const audioPool: Record<string, HTMLAudioElement[]> = {};
const POOL_SIZE = 3; // 每个音效准备3个实例

export function preloadSounds() {
  if (typeof window === 'undefined') return;

  Object.entries(SOUNDS).forEach(([key, path]) => {
    audioPool[key] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.load(); // 强制加载
      audioPool[key].push(audio);
    }
  });
}

// 获取可用的音频实例
function getAvailableAudio(soundName: keyof typeof SOUNDS): HTMLAudioElement | null {
  const pool = audioPool[soundName];
  if (!pool) return null;

  // 找到已播放完成或未播放的实例
  const available = pool.find(audio => audio.paused || audio.ended);
  return available || pool[0]; // 如果都在播放，使用第一个
}

export function playSound(soundName: keyof typeof SOUNDS, volume: number = 0.5) {
  if (typeof window === 'undefined') return;

  try {
    const audio = getAvailableAudio(soundName);
    if (!audio) return;

    // 只在音频暂停时重置位置
    if (audio.paused) {
      audio.currentTime = 0;
    }

    audio.volume = Math.max(0, Math.min(1, volume));

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // 静默失败，避免影响游戏体验
        console.warn(`Failed to play sound: ${soundName}`, error);
      });
    }
  } catch (error) {
    console.warn(`Error playing sound: ${soundName}`, error);
  }
}

// 防抖播放（避免短时间内重复播放）
const lastPlayTime: Record<string, number> = {};
const DEBOUNCE_TIME = 50; // 50ms内不重复播放

export function playSoundDebounced(soundName: keyof typeof SOUNDS, volume: number = 0.5) {
  const now = Date.now();
  const last = lastPlayTime[soundName] || 0;

  if (now - last > DEBOUNCE_TIME) {
    playSound(soundName, volume);
    lastPlayTime[soundName] = now;
  }
}
```

**修改 gameStore.ts**：
```typescript
// 第124行，使用防抖版本
if (mergedScore > 0) {
  playSoundDebounced('merge', 0.3); // 使用防抖
}
```

---

## 📊 5. 数据库优化检查

### 5.1 当前索引
✅ 已创建：
- `idx_leaderboard_score` (score DESC)
- `idx_leaderboard_created_at` (created_at DESC)
- `idx_leaderboard_victory` (is_victory, score DESC)

### 5.2 建议优化
⚠️ **排行榜查询需要优化**

当前查询（lib/supabase.ts 第52-58行）：
```sql
SELECT * FROM leaderboard
WHERE is_victory = true
ORDER BY score DESC, created_at ASC
LIMIT 30
```

**问题**：没有对 `(is_victory, score DESC, created_at ASC)` 的复合索引

**优化方案**：
```sql
-- 添加复合索引
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking
  ON leaderboard (is_victory, score DESC, created_at ASC);

-- 删除冗余索引（已被复合索引覆盖）
DROP INDEX IF EXISTS idx_leaderboard_victory;
```

### 5.3 数据清理策略
⚠️ **缺少数据清理机制**

建议添加：
```sql
-- 定期清理未胜利的记录（保留最近7天）
DELETE FROM leaderboard
WHERE is_victory = false
  AND created_at < NOW() - INTERVAL '7 days';

-- 限制排行榜记录总数（保留前1024名）
DELETE FROM leaderboard
WHERE id IN (
  SELECT id FROM leaderboard
  WHERE is_victory = true
  ORDER BY score DESC, created_at ASC
  OFFSET 1024
);
```

---

## 🧪 6. 排行榜功能检查

### 6.1 查询逻辑
⚠️ **发现问题**：

**问题1：排序不一致**
- PRD要求：分数降序 → 移动次数升序
- 代码实现：分数降序 → 时间升序（created_at）

**问题2：限制为30名**
```typescript
// lib/supabase.ts 第50行
const actualLimit = Math.min(limit, 30); // 限制为30
```

但页面说明写的是1024名：
```typescript
// app/leaderboard/page.tsx 第38行
<p>排行榜显示前1024名玩家（按移动次数排序，越少越好）</p>
```

**修复方案**：
```typescript
// lib/supabase.ts
export async function getLeaderboard(
  limit: number = 1024 // 改为1024
): Promise<{ data: LeaderboardEntry[]; error?: string }> {
  try {
    const actualLimit = Math.min(limit, 1024); // 改为1024

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('is_victory', true)
      .order('score', { ascending: false }) // 分数降序
      .order('play_time', { ascending: true }) // 移动次数升序（不是created_at）
      .limit(actualLimit);

    // ...
  }
}
```

---

## 🎮 7. 游戏体验优化建议

### 7.1 移动端适配
✅ 基本响应式设计完成
⚠️ 缺少触摸滑动支持

**建议添加**：
```typescript
// hooks/useSwipe.ts（新建）
export function useSwipe(onSwipe: (direction: Direction) => void) {
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const minSwipe = 50;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        onSwipe(dx > 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > minSwipe) {
        onSwipe(dy > 0 ? 'down' : 'up');
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe]);
}
```

### 7.2 性能优化
- ✅ 使用 Framer Motion 动画
- ⚠️ 建议添加 React.memo 优化重渲染
- ⚠️ 建议使用虚拟滚动优化排行榜

---

## 📦 8. 部署配置检查

### 8.1 环境变量
✅ `.env` 已配置
⚠️ 需要在 Vercel 配置：
```
NEXT_PUBLIC_SUPABASE_URL=https://izhxzlweswfxyvxptbih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 8.2 vercel.json
❌ **缺少 Vercel 配置**

建议添加：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## ✅ 最终检查清单

### 部署前必须修复（P0）
- [ ] 修改棋盘大小为 4x4
- [ ] 修改起始数字为 2/4
- [ ] 添加防刷分验证（至少添加客户端基础验证）
- [ ] 修复排行榜排序逻辑（按移动次数）
- [ ] 修改排行榜限制为 1024
- [ ] 修复声音卡顿问题
- [ ] 添加复合索引优化查询

### 建议优化（P1）
- [ ] 添加触摸滑动支持
- [ ] 添加 Supabase Edge Function 验证
- [ ] 添加数据清理定时任务
- [ ] 优化音频加载策略

### 可选改进（P2）
- [ ] 添加成就系统
- [ ] 添加分享功能
- [ ] 添加多语言支持

---

## 🧪 功能测试

下一步：测试玩家提交数据库功能
