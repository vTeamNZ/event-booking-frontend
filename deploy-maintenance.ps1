# Deploy Maintenance Page to Production
# Run this script from your production VM

param(
    [string]$WebRoot = "C:\inetpub\wwwroot\kiwilanka",
    [switch]$Restore
)

if ($Restore) {
    # Restore original index.html
    Write-Host "Restoring original index.html..." -ForegroundColor Yellow
    
    if (Test-Path "$WebRoot\index.html.backup") {
        Copy-Item "$WebRoot\index.html.backup" "$WebRoot\index.html" -Force
        Write-Host "Original index.html restored successfully!" -ForegroundColor Green
    } else {
        Write-Host "Backup file not found at $WebRoot\index.html.backup" -ForegroundColor Red
    }
} else {
    # Deploy maintenance page
    Write-Host "Deploying maintenance page..." -ForegroundColor Yellow
    
    # Create backup of current index.html
    if (Test-Path "$WebRoot\index.html") {
        Copy-Item "$WebRoot\index.html" "$WebRoot\index.html.backup" -Force
        Write-Host "Current index.html backed up" -ForegroundColor Green
    }
    
    # Copy maintenance.html as index.html
    if (Test-Path "$WebRoot\maintenance.html") {
        Copy-Item "$WebRoot\maintenance.html" "$WebRoot\index.html" -Force
        Write-Host "Maintenance page deployed successfully!" -ForegroundColor Green
        Write-Host "Your site now shows the maintenance page" -ForegroundColor Cyan
    } else {
        Write-Host "maintenance.html not found at $WebRoot\maintenance.html" -ForegroundColor Red
        Write-Host "Please ensure maintenance.html is uploaded to the web directory first." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  Deploy:  .\deploy-maintenance.ps1" -ForegroundColor White
Write-Host "  Restore: .\deploy-maintenance.ps1 -Restore" -ForegroundColor White
