# 使用 GitHub CLI 推送代码
$files = git ls-files

Write-Host "准备推送 $($files.Count) 个文件到 GitHub..."

# 检查 gh 是否已登录
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先运行: gh auth login"
    exit 1
}

# 推送代码
git push -u origin main --force

Write-Host "推送完成！"
