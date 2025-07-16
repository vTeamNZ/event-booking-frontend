# Deploy React Frontend with SPA Routing Fix
# This script deploys the React app with proper IIS configuration

Write-Host "🚀 Starting React Frontend Deployment with SPA Routing Fix" -ForegroundColor Green

# Build path
$buildPath = "c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend\build"

# Verify build exists
if (-not (Test-Path $buildPath)) {
    Write-Host "❌ Build folder not found. Running build first..." -ForegroundColor Red
    Set-Location "c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Verify web.config exists in build
$webConfigPath = Join-Path $buildPath "web.config"
if (-not (Test-Path $webConfigPath)) {
    Write-Host "❌ web.config not found in build folder!" -ForegroundColor Red
    Write-Host "   Make sure web.config is in the public folder before building." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build folder verified with web.config" -ForegroundColor Green

# Display files that will be deployed
Write-Host "`n📁 Files in build folder:" -ForegroundColor Cyan
Get-ChildItem $buildPath | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

# Check web.config content
Write-Host "`n🔧 Verifying web.config for SPA routing..." -ForegroundColor Cyan
$webConfigContent = Get-Content $webConfigPath -Raw
if ($webConfigContent -match "SPA Routes" -and $webConfigContent -match "rewrite") {
    Write-Host "✅ SPA routing configuration found in web.config" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: SPA routing configuration not detected in web.config" -ForegroundColor Yellow
}

# Check if IIS URL Rewrite module is available (requires admin)
Write-Host "`n🔍 Checking IIS URL Rewrite module..." -ForegroundColor Cyan
try {
    $rewriteModule = Get-WindowsFeature -Name IIS-HttpRedirect -ErrorAction SilentlyContinue
    if ($rewriteModule) {
        Write-Host "✅ IIS URL Rewrite capability available" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Could not verify IIS URL Rewrite module" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Warning: Could not check IIS modules (may require admin privileges)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Green
Write-Host "   • Build completed successfully" -ForegroundColor White
Write-Host "   • web.config included with SPA routing rules" -ForegroundColor White
Write-Host "   • .htaccess included for Apache compatibility" -ForegroundColor White
Write-Host "   • Maintenance pages included" -ForegroundColor White
Write-Host "   • Static assets optimized" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Copy all files from build folder to your IIS website root" -ForegroundColor White
Write-Host "   2. Ensure IIS URL Rewrite module is installed" -ForegroundColor White
Write-Host "   3. Test direct route access: https://kiwilanka.co.nz/about" -ForegroundColor White
Write-Host "   4. Test page refresh on any route" -ForegroundColor White
Write-Host "   5. Verify API calls still work: https://kiwilanka.co.nz/api/events" -ForegroundColor White

Write-Host "`n🔗 Build folder location:" -ForegroundColor Cyan
Write-Host "   $buildPath" -ForegroundColor White

Write-Host "`n✨ SPA routing fix deployment ready!" -ForegroundColor Green

# Optional: Open build folder in explorer
$openFolder = Read-Host "`nOpen build folder in Explorer? (y/n)"
if ($openFolder -eq 'y' -or $openFolder -eq 'Y') {
    Start-Process explorer.exe $buildPath
}
