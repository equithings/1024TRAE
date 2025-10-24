# GitHub Pages 部署说明

## 前提条件

1. 拥有 GitHub 账号
2. 本地安装了 Git

## 部署步骤

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建一个新仓库，例如命名为 `trae-1024-game`
3. **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 推送代码到 GitHub

在项目目录下执行以下命令：

```bash
# 初始化 Git 仓库（如果还没有初始化）
git init

# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: TRAE 1024 game"

# 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Secrets

在 GitHub 仓库页面：

1. 点击 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下两个 Secret：

   **Secret 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://izhxzlweswfxyvxptbih.supabase.co`

   **Secret 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aHh6bHdlc3dmeHl2eHB0YmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjg5MzQsImV4cCI6MjA3NjgwNDkzNH0.mpimyURsy47p3NVinVonCLqcQ7-UTpKEs7WN-qHfVr0`

### 4. 启用 GitHub Pages

在 GitHub 仓库页面：

1. 点击 **Settings** → **Pages**
2. 在 "Build and deployment" 部分：
   - Source: 选择 **GitHub Actions**
3. 保存设置

### 5. 触发部署

现在每次推送到 `main` 分支都会自动触发部署。你也可以：

1. 进入 **Actions** 标签页
2. 选择 "部署到 GitHub Pages" 工作流
3. 点击 **Run workflow** → **Run workflow** 手动触发

### 6. 访问网站

部署完成后（通常需要1-3分钟），你的网站将可以通过以下地址访问：

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## 重要提示

### 如果部署到子路径（例如 username.github.io/trae-1024-game）

你需要修改 `next.config.js` 文件，取消注释并修改以下内容：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 修改为你的仓库名
  basePath: '/trae-1024-game',
  assetPrefix: '/trae-1024-game',
}

module.exports = nextConfig
```

然后重新推送：

```bash
git add next.config.js
git commit -m "Add basePath for GitHub Pages"
git push
```

### 如果部署到用户主页（username.github.io）

如果你的仓库名就是 `username.github.io`，则**不需要**设置 basePath，当前配置已经可以直接使用。

## 故障排除

### 部署失败

1. 检查 **Actions** 标签页中的错误日志
2. 确认已正确添加 Secrets
3. 确认 Node.js 版本兼容（工作流使用 Node 18）

### 页面无法访问

1. 确认 GitHub Pages 已启用
2. 等待几分钟让 DNS 生效
3. 检查 basePath 配置是否正确

### 数据库连接问题

1. 确认 Supabase Secrets 配置正确
2. 检查 Supabase 项目是否正常运行
3. 检查浏览器控制台是否有网络错误

## 后续更新

每次修改代码后，只需要：

```bash
git add .
git commit -m "描述你的更改"
git push
```

GitHub Actions 会自动重新构建和部署。
