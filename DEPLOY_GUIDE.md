# 🚀 TRAE 1024 部署指南

## 📋 部署前准备

### 环境变量配置

在部署之前，您需要准备以下 Supabase 环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: `https://izhxzlweswfxyvxptbih.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 您的 Supabase anon key

---

## 方法1: 通过 GitHub + Vercel（推荐⭐）

这是最简单且自动化的部署方式。

### 步骤：

1. **在 GitHub 上创建仓库**
   - 访问 https://github.com/new
   - 仓库名称：`trae-1024-game`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize with README"（我们已有代码）
   - 点击 "Create repository"

2. **连接本地仓库到 GitHub**
   ```bash
   # 在项目目录下执行
   git remote add origin https://github.com/你的用户名/trae-1024-game.git
   git branch -M main
   git push -u origin main
   ```

3. **在 Vercel 上导入项目**
   - 访问 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择您刚创建的 `trae-1024-game` 仓库
   - Vercel 会自动检测到这是 Next.js 项目

4. **配置环境变量**
   - 在 Vercel 部署设置页面，找到 "Environment Variables"
   - 添加以下变量：
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://izhxzlweswfxyvxptbih.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `你的密钥`

5. **开始部署**
   - 点击 "Deploy"
   - 等待约 2-3 分钟
   - 部署成功后会得到一个 `.vercel.app` 域名

6. **后续更新**
   - 每次提交代码到 GitHub，Vercel 会自动重新部署
   ```bash
   git add .
   git commit -m "更新游戏"
   git push
   ```

---

## 方法2: 使用 Vercel CLI

如果您不想使用 GitHub，可以直接通过 CLI 部署。

### 步骤：

1. **全局安装 Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```powershell
   vercel login
   ```
   - 选择登录方式（GitHub、GitLab、Bitbucket 或 Email）
   - 按提示完成登录

3. **部署到生产环境**
   ```powershell
   cd C:\Users\A2Spring\Desktop\game
   vercel --prod
   ```

4. **按提示配置项目**
   - Set up and deploy? → **Yes**
   - Which scope? → 选择您的团队（`equi's projects`）
   - Link to existing project? → **No**
   - Project name? → `trae-1024-game`（或自定义名称）
   - In which directory is your code located? → `./`（默认）

5. **添加环境变量**
   ```powershell
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # 输入: https://izhxzlweswfxyvxptbih.supabase.co

   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # 输入: 你的密钥
   ```

6. **重新部署（应用环境变量）**
   ```powershell
   vercel --prod
   ```

7. **后续更新**
   - 每次修改代码后，只需运行：
   ```powershell
   vercel --prod
   ```

---

## 方法3: 使用部署脚本（最快捷）

我为您准备了一个自动化部署脚本。

### 使用方法：

1. **运行部署脚本**
   ```powershell
   .\deploy.ps1
   ```

2. **按提示操作**
   - 脚本会自动检测 Vercel CLI
   - 如果未安装会提示安装
   - 自动执行部署流程

---

## 部署后验证

部署成功后，访问您的 Vercel 域名，检查以下功能：

- [ ] 游戏可以正常启动
- [ ] 方块可以移动和合并
- [ ] 字母可以正常收集
- [ ] 胜利后可以提交分数
- [ ] 排行榜可以正常显示
- [ ] 移动端触摸手势正常工作

---

## 常见问题

### 1. 部署失败：Build Error

**原因**: 代码中有错误或依赖安装失败

**解决**:
```bash
# 本地测试构建
npm run build

# 如果失败，查看错误信息并修复
```

### 2. 游戏可以打开但数据库不工作

**原因**: 环境变量未正确配置

**解决**:
- 在 Vercel Dashboard → Project Settings → Environment Variables
- 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
- 重新部署

### 3. 部署后页面是空白的

**原因**: JavaScript 加载失败或路由问题

**解决**:
- 打开浏览器开发者工具（F12）
- 查看 Console 和 Network 标签的错误信息
- 检查 `vercel.json` 配置是否正确

---

## 获取部署 URL

部署成功后，您会得到两种 URL：

1. **Production URL**: `https://trae-1024-game.vercel.app`（主域名）
2. **Deployment URL**: `https://trae-1024-game-xxx.vercel.app`（每次部署的唯一地址）

---

## 自定义域名（可选）

如果您有自己的域名：

1. 在 Vercel Dashboard → Project Settings → Domains
2. 点击 "Add Domain"
3. 输入您的域名（如 `game.yourdomain.com`）
4. 按提示在域名注册商处添加 DNS 记录
5. 等待 DNS 生效（通常 10-60 分钟）

---

**部署完成后，别忘了分享您的游戏链接！** 🎉
