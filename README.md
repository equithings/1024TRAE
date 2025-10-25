# 🎮 TRAE 1024

**The Real AI Engineer Game** - 成为真正的 AI 工程师！

一款融合 2048 玩法和字母收集的创新益智游戏。

---

## 📖 游戏介绍

**TRAE 1024** 是一款创新的数字合成游戏。在 4×4 的棋盘上，你需要：

1. 📝 按顺序收集 **T → R → A → E** 四个字母
2. 🎯 合成 **1024** 数值方块
3. 🏆 同时完成两个目标即可获胜

**TRAE** 代表 **The Real AI Engineer**（真正的 AI 工程师）

---

## ✨ 特色功能

- 🎨 **精美UI设计** - 渐变色字母方块，流畅动画效果
- 🧠 **智力挑战** - 双重目标增加策略深度
- 🔤 **字母加成系统** - 每个字母触发独特效果
- 📊 **全球排行榜** - Supabase实时数据同步
- 📱 **响应式设计** - 完美适配桌面和移动端
- ⚡ **高性能** - Next.js 14 + TypeScript

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm (推荐) 或 npm
- Supabase 账号 (可选，用于排行榜功能)

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/trae-1024-game.git
cd trae-1024-game
```

2. **安装依赖**
```bash
pnpm install
# 或
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入 Supabase 配置：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **运行开发服务器**
```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Supabase 配置

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com/)，创建新项目。

### 2. 执行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中执行：



### 3. 获取 API 密钥

在 **Settings > API** 中找到：
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📁 项目结构

```
game/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React组件
│   ├── Game/
│   │   ├── GameBoard.tsx  # 游戏棋盘
│   │   └── Tile.tsx       # 方块组件
│   └── UI/
│       ├── ProgressBar.tsx # 进度条
│       └── ScoreBoard.tsx  # 分数显示
├── lib/                   # 工具函数
│   ├── game-logic.ts      # 游戏核心逻辑
│   ├── letter-system.ts   # 字母系统
│   └── supabase.ts        # Supabase客户端
├── store/                 # Zustand状态管理
│   └── gameStore.ts       # 游戏状态
├── types/                 # TypeScript类型
│   └── game.ts            # 游戏类型定义
├── supabase/              # Supabase配置
│   └── migrations/        # 数据库迁移文件
├── PRD.md                 # 产品需求文档
└── README.md              # 项目说明
```

---

## 🎮 玩法说明

### 操作方式

**桌面端**：
- 使用方向键 `↑` `↓` `←` `→` 移动方块
- 或使用 `W` `A` `S` `D` 键

**移动端**：
- 在棋盘上滑动屏幕（上/下/左/右）

### 游戏规则

**1. 方块合成**
- 游戏开始时随机生成两个方块（4 或 8）
- 相同数字的方块碰撞后合并，数值翻倍
- 合成路径：`4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 1024`

**2. 字母收集**
- 棋盘上会随机出现字母方块（T、R、A、E）
- **必须按 T → R → A → E 的顺序收集**
- 数字方块碰到对应字母后，数值 ×2 并收集该字母
- 字母出现概率：
  - T、R、A：15%
  - E（最稀有）：5%

**3. 胜利条件**
- ✅ 按顺序收集完整字母：T → R → A → E
- ✅ 达成 1024 方块

**4. 失败条件**
- ❌ 棋盘填满且无法移动时游戏结束

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 14** | React服务端渲染框架 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS** | 原子化CSS样式 |
| **Zustand** | 轻量级状态管理 |
| **Framer Motion** | 动画库 |
| **Supabase** | 后端服务（数据库+认证） |

---

## 📊 Chrome DevTools 调试

### 性能优化检查

```bash
# 运行生产构建
pnpm build
pnpm start
```

在 Chrome DevTools 中：
1. **Performance** 标签 → 录制游戏操作
2. **Lighthouse** → 运行审计
3. **Network** → 检查资源加载

### 目标指标
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---



## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 🙏 鸣谢

- 灵感来源：[2048游戏](https://play2048.co/)
- 品牌：[TRAE - The Real AI Engineer](https://www.trae.ai/)
- 程序员节：1024 = 2^10

---

**Happy Coding! 🎉**

Made with ❤️ for programmers on 10/24
