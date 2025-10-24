# 推送代码到 GitHub

由于本地 Git 认证问题，请按以下步骤操作：

## 方法 1：使用 Personal Access Token（推荐）

### 步骤 1：创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens/new
2. 勾选以下权限：
   - `repo` (完整仓库访问权限)
   - `workflow` (GitHub Actions 权限)
3. 点击 "Generate token"
4. **复制生成的 token**（只会显示一次）

### 步骤 2：使用 Token 推送代码

在 PowerShell 中执行：

```powershell
# 推送代码（会提示输入用户名和密码）
git push -u origin main --force

# 当提示时：
# Username: equithings
# Password: <粘贴你的 Personal Access Token>
```

## 方法 2：使用 GitHub Desktop（最简单）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录 equithings 账号
3. 添加本地仓库：File → Add Local Repository
4. 选择当前目录：`C:\Users\A2Spring\Desktop\game`
5. 点击 "Publish repository" 或 "Push origin"

## 方法 3：使用 SSH 密钥

### 步骤 1：生成 SSH 密钥

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 步骤 2：添加 SSH 密钥到 GitHub

```powershell
# 复制公钥
cat ~/.ssh/id_ed25519.pub | clip
```

访问 https://github.com/settings/keys 添加 SSH 密钥

### 步骤 3：更新远程仓库 URL

```powershell
git remote set-url origin git@github.com:equithings/1024TRAE.git
git push -u origin main --force
```

## 推送完成后

执行以下命令验证：

```powershell
# 检查远程仓库
git remote -v

# 查看推送结果
git log --oneline -5
```

## 下一步

推送成功后，告诉我，我会继续配置 GitHub Pages 和 Secrets。
