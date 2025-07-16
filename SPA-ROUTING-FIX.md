# React SPA Routing Fix - Production Deployment Guide

## Problem
When users access React routes directly (like `https://kiwilanka.co.nz/about`) or refresh the page, they get a 404 error. This happens because the web server looks for actual files/folders instead of letting React Router handle the routing.

## Root Cause
- React uses client-side routing (History API)
- Web server doesn't know about these routes
- Server tries to find actual `/about` folder and returns 404

## Solution Files Created

### 1. `web.config` (for IIS - Windows Server)
- ✅ Handles SPA routing by redirecting all routes to `index.html`
- ✅ Excludes API calls, static files, and maintenance pages
- ✅ Adds proper MIME types
- ✅ Enables compression for better performance
- ✅ Sets security headers
- ✅ Configures caching for static assets

### 2. `.htaccess` (for Apache servers)
- ✅ Same functionality as web.config but for Apache
- ✅ Backup option if you switch hosting providers

## Deployment Steps

### For IIS (Your Current Setup)

1. **Build your React app:**
   ```bash
   cd c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend
   npm run build
   ```

2. **Copy web.config to build folder:**
   The `web.config` file should be copied to your build output folder during the build process.

3. **Deploy the build folder:**
   Upload the entire contents of the `build` folder to your IIS website root directory.

4. **Verify IIS modules:**
   Make sure these IIS modules are installed:
   - URL Rewrite Module 2.1
   - IIS Compression (usually enabled by default)

### Quick Test After Deployment

1. Navigate to `https://kiwilanka.co.nz/about` directly ✅
2. Refresh the page while on `/about` ✅  
3. Navigate to `https://kiwilanka.co.nz/events` directly ✅
4. Test that API calls still work: `https://kiwilanka.co.nz/api/events` ✅

## How It Works

### Before Fix:
```
User visits: https://kiwilanka.co.nz/about
↓
IIS looks for /about folder
↓
Not found → 404 Error ❌
```

### After Fix:
```
User visits: https://kiwilanka.co.nz/about
↓
IIS checks web.config rewrite rules
↓
Serves /index.html instead
↓
React Router handles /about route ✅
```

## Files Excluded from Rewrite

The configuration won't rewrite these requests:
- API calls: `/api/*`
- Static files: `.js`, `.css`, `.png`, `.jpg`, etc.
- Maintenance page: `/maintenance.html`
- Actual files/directories that exist

## Performance Optimizations Included

- **Compression**: Reduces file sizes for faster loading
- **Caching**: Browser caches static assets for 1 year
- **MIME Types**: Proper content types for all file formats
- **Security Headers**: XSS protection, clickjacking prevention

## Troubleshooting

### If routes still don't work:

1. **Check IIS URL Rewrite Module:**
   ```powershell
   # Run in PowerShell as Administrator
   Get-WindowsFeature -Name IIS-HttpRedirect
   Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpRedirect
   ```

2. **Verify web.config syntax:**
   - Check for XML syntax errors
   - Ensure proper closing tags

3. **Check IIS error logs:**
   Usually located in: `C:\inetpub\logs\LogFiles\W3SVC1\`

4. **Test with simple route:**
   Try accessing `https://kiwilanka.co.nz/test-route`

### Alternative Manual Fix (if automatic doesn't work):

Add this to your IIS site's web.config manually:

```xml
<rewrite>
  <rules>
    <rule name="React Routes" stopProcessing="true">
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
```

## Success Indicators

✅ Direct URL access works: `https://kiwilanka.co.nz/about`  
✅ Page refresh works on any route  
✅ API calls still function: `https://kiwilanka.co.nz/api/events`  
✅ Static files load: images, CSS, JS  
✅ Maintenance page accessible: `https://kiwilanka.co.nz/maintenance.html`

## Next Steps

1. Build and deploy with the new web.config
2. Test all routes work correctly
3. Monitor IIS logs for any issues
4. Verify performance improvements from compression/caching

The fix should resolve the 404 issues immediately after deployment! 🚀
