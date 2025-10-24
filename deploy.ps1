# TRAE 1024 自动部署脚本
# 用于快速部署到 Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TRAE 1024 - Vercel 部署脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Node.js
Write-Host "🔍 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未安装 Node.js" -ForegroundColor Red
    Write-Host "请访问 https://nodejs.org/ 下载安装" -ForegroundColor Yellow
    exit 1
}

# 检查 npm
Write-Host "🔍 检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: npm 未正确安装" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "请选择部署方式：" -ForegroundColor Yellow
Write-Host "1. 使用 GitHub + Vercel（推荐）" -ForegroundColor White
Write-Host "2. 使用 Vercel CLI 直接部署" -ForegroundColor White
Write-Host "3. 查看部署指南" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📝 GitHub + Vercel 部署步骤：" -ForegroundColor Green
        Write-Host ""
        Write-Host "1. 在 GitHub 创建新仓库: https://github.com/new" -ForegroundColor White
        Write-Host "   - 仓库名称: trae-1024-game" -ForegroundColor Gray
        Write-Host "   - 不要勾选 'Initialize with README'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. 复制并执行以下命令（将 YOUR_USERNAME 替换为您的 GitHub 用户名）：" -ForegroundColor White
        Write-Host ""
        Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/trae-1024-game.git" -ForegroundColor Cyan
        Write-Host "   git branch -M main" -ForegroundColor Cyan
        Write-Host "   git push -u origin main" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "3. 在 Vercel 导入项目: https://vercel.com/new" -ForegroundColor White
        Write-Host "   - 选择您的 GitHub 仓库" -ForegroundColor Gray
        Write-Host "   - 添加环境变量:" -ForegroundColor Gray
        Write-Host "     NEXT_PUBLIC_SUPABASE_URL = https://izhxzlweswfxyvxptbih.supabase.co" -ForegroundColor Gray
        Write-Host "     NEXT_PUBLIC_SUPABASE_ANON_KEY = <您的密钥>" -ForegroundColor Gray
        Write-Host ""

        $openGuide = Read-Host "是否打开详细部署指南？ (y/n)"
        if ($openGuide -eq "y") {
            Start-Process "DEPLOY_GUIDE.md"
        }
    }

    "2" {
        Write-Host ""
        Write-Host "🚀 开始 Vercel CLI 部署..." -ForegroundColor Green
        Write-Host ""

        # 检查 Vercel CLI
        Write-Host "🔍 检查 Vercel CLI..." -ForegroundColor Yellow
        try {
            $vercelVersion = vercel --version 2>$null
            Write-Host "✅ Vercel CLI 已安装: $vercelVersion" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Vercel CLI 未安装" -ForegroundColor Yellow
            $installVercel = Read-Host "是否现在安装？ (y/n)"

            if ($installVercel -eq "y") {
                Write-Host "📦 正在全局安装 Vercel CLI..." -ForegroundColor Yellow
                npm install -g vercel

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Vercel CLI 安装成功" -ForegroundColor Green
                } else {
                    Write-Host "❌ Vercel CLI 安装失败" -ForegroundColor Red
                    Write-Host "请手动运行: npm install -g vercel" -ForegroundColor Yellow
                    exit 1
                }
            } else {
                Write-Host "❌ 部署已取消" -ForegroundColor Red
                exit 1
            }
        }

        Write-Host ""
        Write-Host "📋 部署前提示：" -ForegroundColor Cyan
        Write-Host "1. 首次部署会要求登录 Vercel" -ForegroundColor White
        Write-Host "2. 选择团队: equi's projects" -ForegroundColor White
        Write-Host "3. 项目名称: trae-1024-game（可自定义）" -ForegroundColor White
        Write-Host ""

        $proceed = Read-Host "是否继续？ (y/n)"

        if ($proceed -eq "y") {
            Write-Host ""
            Write-Host "🚀 正在部署到 Vercel..." -ForegroundColor Green
            Write-Host ""

            # 执行 Vercel 部署
            vercel --prod

            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "✅ 部署成功!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "⚠️  重要提示：" -ForegroundColor Yellow
                Write-Host "1. 请在 Vercel Dashboard 添加环境变量" -ForegroundColor White
                Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "2. 环境变量：" -ForegroundColor White
                Write-Host "   NEXT_PUBLIC_SUPABASE_URL = https://izhxzlweswfxyvxptbih.supabase.co" -ForegroundColor Gray
                Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY = <您的密钥>" -ForegroundColor Gray
                Write-Host ""
                Write-Host "3. 添加环境变量后，重新部署：" -ForegroundColor White
                Write-Host "   vercel --prod" -ForegroundColor Cyan
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "❌ 部署失败" -ForegroundColor Red
                Write-Host "请查看错误信息或参考部署指南" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ 部署已取消" -ForegroundColor Red
        }
    }

    "3" {
        Write-Host ""
        Write-Host "📖 打开部署指南..." -ForegroundColor Green
        Start-Process "DEPLOY_GUIDE.md"
    }

    "4" {
        Write-Host "👋 退出部署脚本" -ForegroundColor Yellow
        exit 0
    }

    default {
        Write-Host "❌ 无效的选择" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署脚本执行完毕" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
