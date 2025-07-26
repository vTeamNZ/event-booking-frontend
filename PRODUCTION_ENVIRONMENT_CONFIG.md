# Production Environment Configuration  
# Location: https://kiwilanka.co.nz/

## To Switch Back to Production:

### 1. Update package.json
Remove the homepage field:
```json
{
  "name": "event-booking-frontend",
  "version": "0.1.0", 
  "private": true,
  // Remove this line: "homepage": "/kw/",
  "dependencies": {
    // ... rest of config
  }
}
```

### 2. Update .env.production
Change API URLs back to full URLs:
```bash
# .env.production
REACT_APP_API_BASE_URL=https://kiwilanka.co.nz/api
REACT_APP_QR_API_BASE_URL=https://kiwilanka.co.nz/qrapp-api
```

### 3. Update AnimatedHeader.tsx (if needed)
Change back to absolute path if desired:
```tsx
<img src="/kiwilanka-logo.png" alt="Logo" className="h-full max-h-14 w-auto object-contain" />
```
OR keep the current relative path (recommended):
```tsx
<img src={`${process.env.PUBLIC_URL}/kiwilanka-logo.png`} alt="Logo" className="h-full max-h-14 w-auto object-contain" />
```

### 4. Create Simple web.config for Production
```xml
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
```

### 5. Build and Deploy for Production
```bash
cd "c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend"
npm run build
# Deploy to your production location (not c:\inetpub\TLS\kw\)
```

## Key Differences:
- **Testing**: Uses `/kw/` base path, relative API calls, API proxying
- **Production**: Uses `/` base path, direct API calls to kiwilanka.co.nz, no proxying
