# TRAE 1024 Game - 部署指南

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
# 在项目根目录执行
vercel

# 生产环境部署
vercel --prod
```

4. **配置环境变量**
在 Vercel Dashboard 中设置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 方法二：通过 GitHub 自动部署

1. **推送代码到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit: TRAE 1024 Game"
git remote add origin https://github.com/yourusername/trae-1024-game.git
git push -u origin main
```

2. **在 Vercel 导入项目**
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 导入你的 GitHub 仓库
- 配置环境变量
- 点击 "Deploy"

### 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | Supabase项目URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJxxx... | Supabase匿名密钥 |

### 部署后检查清单

- [ ] 页面正常加载
- [ ] 游戏可以正常玩
- [ ] 字母系统工作正常
- [ ] 排行榜可以访问
- [ ] Lighthouse 性能 > 90分

---

## 🗄️ Supabase 配置步骤

### 1. 创建 Supabase 项目

访问 [supabase.com](https://supabase.com)，创建新项目。

### 2. 执行数据库迁移

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 复制 supabase/migrations/001_leaderboard.sql 内容并执行
```

### 3. 验证表结构

在 Table Editor 中确认 `leaderboard` 表已创建。

### 4. 测试 RLS 策略

在 SQL Editor 中测试：

```sql
-- 测试读取
SELECT * FROM leaderboard LIMIT 5;

-- 测试插入
INSERT INTO leaderboard (player_name, score, max_tile, is_victory)
VALUES ('测试玩家', 1024, 1024, true);
```

---

## 🔍 Chrome DevTools 调试

### 性能检测

1. 打开 Chrome DevTools (F12)
2. 切换到 **Lighthouse** 标签
3. 选择 **Performance** 和 **Accessibility**
4. 点击 **Analyze page load**

### 目标指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| Performance | > 90 | 待测试 |
| Accessibility | > 90 | 待测试 |
| Best Practices | > 90 | 待测试 |
| SEO | > 90 | 待测试 |

### 网络优化

在 **Network** 标签检查：
- 首屏加载时间 < 2s
- JavaScript bundle < 200KB
- 无阻塞资源

### 响应式测试

使用 Device Toolbar 测试不同屏幕尺寸：
- Mobile S (320px)
- Mobile M (375px)
- Mobile L (425px)
- Tablet (768px)
- Desktop (1920px)

---

## 📝 部署后任务

- [ ] 绑定自定义域名
- [ ] 配置SSL证书（Vercel自动）
- [ ] 设置Analytics
- [ ] 添加错误监控（Sentry）
- [ ] 性能监控
- [ ] SEO优化（sitemap, robots.txt）

---

## 🚀 持续集成/部署 (CI/CD)

Vercel 会自动：
- ✅ 检测 Git push
- ✅ 运行构建
- ✅ 执行测试
- ✅ 部署到生产环境
- ✅ 生成预览URL

---

## 📞 问题排查

### 部署失败

1. 检查构建日志
2. 验证环境变量
3. 确认依赖版本兼容性

### Supabase 连接失败

1. 检查环境变量是否正确
2. 验证 RLS 策略
3. 查看 Supabase 日志

### 性能问题

1. 使用 Next.js Image 组件
2. 启用代码分割
3. 优化 bundle 大小

---

**部署完成后，记得更新 README.md 中的实际部署URL！**
