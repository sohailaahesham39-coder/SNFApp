# PowerShell Script to Upload Project to GitHub


Clear-Host
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "   Uploading SNFApp to GitHub" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed on this system." -ForegroundColor Red
    Pause
    exit
}

Write-Host "`n[1/7] Setting Git Configuration..." -ForegroundColor Cyan
git config user.email $UserEmail
git config user.name $UserName

Write-Host "[2/7] Initializing Git Repository (if needed)..." -ForegroundColor Cyan
if (!(Test-Path .git)) {
    git init
}

Write-Host "[3/7] Adding files to staging..." -ForegroundColor Cyan
git add .

Write-Host "[4/7] Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit - project structure and configuration"

Write-Host "[5/7] Setting main branch..." -ForegroundColor Cyan
git branch -M main

Write-Host "[6/7] Configuring Remote Origin..." -ForegroundColor Cyan
# Remove existing origin if it exists
git remote remove origin 2>$null
# Add the new origin
git remote add origin $RepoUrl

Write-Host "[7/7] Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "NOTE: A browser window or login prompt may appear. Please log in to authorize the upload." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Your project has been uploaded to GitHub." -ForegroundColor Green
    Write-Host "Repository URL: $RepoUrl" -ForegroundColor Gray
} else {
    Write-Host "`nSomething went wrong during the push. Please check the error messages above." -ForegroundColor Red
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
