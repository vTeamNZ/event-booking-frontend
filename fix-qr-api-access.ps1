# PowerShell script to restore QR API configuration
# Run this script if the QR API becomes inaccessible after deployments
# 
# IMPORTANT: The frontend source code in public/web.config has been updated
# to include the QR API exclusion rule. Future deployments should preserve
# this configuration automatically.

Write-Host "Checking QR API accessibility..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://kiwilanka.co.nz/qrapp-api/etickets/generate" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "QR API is accessible (got expected 405 error)" -ForegroundColor Green
    exit 0
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "QR API is accessible (got expected 405 error)" -ForegroundColor Green
        exit 0
    }
    Write-Host "QR API is NOT accessible. Fixing configuration..." -ForegroundColor Red
}

Write-Host "Fixing web.config..." -ForegroundColor Yellow
$webConfigContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReactRouter" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/qrapp-api/" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/qrapp/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
'@

$webConfigContent | Set-Content "C:\inetpub\wwwroot\kiwilanka\web.config"

Write-Host "Checking tickets directory permissions..." -ForegroundColor Yellow
if (!(Test-Path "C:\inetpub\wwwroot\kiwilanka\qrapp-api\tickets")) {
    New-Item -Path "C:\inetpub\wwwroot\kiwilanka\qrapp-api\tickets" -ItemType Directory -Force
    Write-Host "Created tickets directory" -ForegroundColor Green
}

icacls "C:\inetpub\wwwroot\kiwilanka\qrapp-api\tickets" /grant "IIS_IUSRS:(OI)(CI)F" /Q
icacls "C:\inetpub\wwwroot\kiwilanka\qrapp-api\tickets" /grant "IIS AppPool\KiwiLankaQRAppAPIPool:(OI)(CI)F" /Q

Write-Host "Restarting QR API application pool..." -ForegroundColor Yellow
Restart-WebAppPool -Name "KiwiLankaQRAppAPIPool"

Start-Sleep -Seconds 5

Write-Host "Testing QR API again..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://kiwilanka.co.nz/qrapp-api/etickets/generate" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "QR API is now accessible!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "QR API is now accessible!" -ForegroundColor Green
    } else {
        Write-Host "QR API is still not accessible. Manual intervention required." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
