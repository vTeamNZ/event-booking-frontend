# Quick Deploy Script for Testing Environment
# Run this from the frontend directory

Write-Host "Building React app for testing environment..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Deploying to testing environment..." -ForegroundColor Green
    xcopy "build\*" "c:\inetpub\TLS\kw\" /E /Y
    
    Write-Host "Restoring testing web.config..." -ForegroundColor Yellow
    
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
            <add input="{REQUEST_URI}" pattern="^.*api.*" negate="true" />
          </conditions>
          <action type="Rewrite" url="/kw/index.html" />
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

    $webConfigContent | Out-File -FilePath "c:\inetpub\TLS\kw\web.config" -Encoding UTF8
    
    Write-Host "Frontend deployment complete!" -ForegroundColor Green
    Write-Host "Testing URL: https://thelankanspace.co.nz/kw/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy EventBooking.API to c:\inetpub\TLS\kw\api\" -ForegroundColor White
    Write-Host "2. Deploy QR API to c:\inetpub\TLS\kw\qrapp-api\" -ForegroundColor White
    Write-Host "3. Test API endpoints:" -ForegroundColor White
    Write-Host "   - https://thelankanspace.co.nz/kw/api/Events" -ForegroundColor Gray
    Write-Host "   - https://thelankanspace.co.nz/kw/qrapp-api/..." -ForegroundColor Gray
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
