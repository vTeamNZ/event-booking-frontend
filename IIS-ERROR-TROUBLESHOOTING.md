# IIS Internal Server Error - Troubleshooting Guide

## Problem
After deploying the web.config with SPA routing rules, the entire site shows "Internal Server Error (500)".

## Most Common Causes

### 1. IIS URL Rewrite Module Not Installed
The web.config uses `<rewrite>` rules which require the URL Rewrite module.

### 2. Invalid web.config Syntax
XML syntax errors or unsupported configurations.

### 3. Missing IIS Features
Required IIS modules not enabled.

## Quick Fixes (Try in Order)

### Fix 1: Simple web.config (Minimal SPA Routing)
Replace the complex web.config with this basic version:

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
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
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

### Fix 2: No web.config (Alternative Method)
Remove web.config entirely and use IIS Manager GUI:
1. Open IIS Manager
2. Select your site
3. Double-click "URL Rewrite"
4. Add Rule > Blank Rule
5. Configure manually

### Fix 3: app_offline.htm Method
Instead of complex routing, use the simple approach:
1. Remove web.config
2. Create index.html in root with fallback JavaScript

## Installation Commands

### Install URL Rewrite Module (Run as Administrator)
```powershell
# Method 1: Windows Features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpRedirect

# Method 2: Download and install
# Download from: https://www.iis.net/downloads/microsoft/url-rewrite
```

### Check Current IIS Modules
```powershell
# Check if URL Rewrite is available
Get-WindowsFeature -Name *IIS*

# Check installed modules
Get-IISModule
```

## Diagnostic Steps

### 1. Check IIS Error Logs
Location: `C:\inetpub\logs\LogFiles\W3SVC1\`
Look for recent error entries.

### 2. Test with Minimal web.config
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
```

### 3. Verify File Permissions
Ensure IIS_IUSRS has read access to all files.

## Emergency Fallback Options

### Option 1: Remove web.config
```bash
# Temporarily remove web.config to restore site
mv web.config web.config.bak
```

### Option 2: JavaScript-Based Routing
Add to index.html head section:
```html
<script>
// Handle direct URL access for SPA
(function() {
    var path = window.location.pathname;
    if (path !== '/' && !path.includes('.')) {
        var params = window.location.search;
        var hash = window.location.hash;
        window.history.replaceState({}, '', '/' + params + hash + '&route=' + encodeURIComponent(path));
    }
})();
</script>
```

### Option 3: Hash-Based Routing
Configure React Router to use hash routing instead of browser routing.

## Common Error Messages & Solutions

### "HTTP Error 500.19"
- **Cause**: Invalid web.config syntax
- **Solution**: Use minimal web.config above

### "HTTP Error 500.52" 
- **Cause**: URL Rewrite module not installed
- **Solution**: Install URL Rewrite module

### "Cannot read configuration file"
- **Cause**: XML syntax error
- **Solution**: Validate XML syntax

## Testing Commands

```powershell
# Test site without web.config
Rename-Item web.config web.config.bak
# Test site access

# Test with minimal web.config
# (Use minimal version above)

# Test URL Rewrite module
Get-WebConfiguration -Filter "system.webServer/rewrite/rules"
```

## Next Steps

1. **Immediate**: Remove web.config to restore site
2. **Short-term**: Use minimal web.config 
3. **Long-term**: Install URL Rewrite module properly

## Safe Deployment Process

1. Backup current working site
2. Test web.config on staging/local first
3. Deploy minimal version first
4. Gradually add features
5. Monitor error logs

The key is to start simple and add complexity gradually!
