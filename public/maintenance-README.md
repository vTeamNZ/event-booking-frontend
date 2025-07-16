# KiwiLanka Events - Maintenance Page Configuration

## Quick Setup Instructions

### 1. Basic Maintenance Page
Use `maintenance.html` for a simple, clean maintenance page.

### 2. Advanced Maintenance Page  
Use `maintenance-advanced.html` for a feature-rich page with animations and progress tracking.

## Customization Guide

### Update Contact Information
Edit these sections in the HTML files:

```html
<!-- Email -->
support@kiwilanka.co.nz

<!-- Phone (replace XXX with actual number) -->
+64 (0) 21 XXX XXXX

<!-- Social Media Links -->
Replace href="#" with actual URLs:
- Facebook: https://facebook.com/kiwilanka
- Instagram: https://instagram.com/kiwilanka  
- YouTube: https://youtube.com/kiwilanka
```

### Customize Maintenance Duration
Update the countdown timer in the JavaScript section:

```javascript
// Change the duration (currently set to 2 hours)
const endTime = new Date(Date.now() + (2 * 60 * 60 * 1000));

// For different durations:
// 1 hour: (1 * 60 * 60 * 1000)
// 30 minutes: (30 * 60 * 1000)
// 4 hours: (4 * 60 * 60 * 1000)
```

### Change Colors/Branding
Update CSS variables in `:root` section:

```css
:root {
    --primary-color: #667eea;     /* Main brand color */
    --secondary-color: #764ba2;   /* Secondary brand color */
    --success-color: #48bb78;     /* Success/completion color */
    --warning-color: #ed8936;     /* Warning/maintenance color */
}
```

### Update Logo
Replace the text logo with an image:

```html
<!-- Current text logo -->
<div class="logo">KL</div>

<!-- Replace with image -->
<img src="/your-logo.png" alt="KiwiLanka" class="logo-image">
```

## Web Server Configuration

### IIS (Windows Server)
1. Create a custom error page mapping in web.config:

```xml
<system.webServer>
    <httpErrors errorMode="Custom">
        <remove statusCode="503" subStatusCode="-1" />
        <error statusCode="503" 
               path="/maintenance.html" 
               responseMode="ExecuteURL" />
    </httpErrors>
</system.webServer>
```

2. Or create an app_offline.htm file with the maintenance content

### Nginx
Add to your nginx.conf:

```nginx
location / {
    return 503;
}

error_page 503 @maintenance;

location @maintenance {
    root /path/to/your/maintenance/files;
    try_files /maintenance.html =503;
}
```

### Apache
Add to .htaccess:

```apache
RewriteEngine On
RewriteCond %{REMOTE_ADDR} !^123\.456\.789\.000
RewriteCond %{REQUEST_URI} !/maintenance.html$ [NC]
RewriteRule ^(.*)$ /maintenance.html [R=302,L]
```

## Deployment Checklist

- [ ] Update contact information (email, phone)
- [ ] Set correct maintenance duration
- [ ] Update social media links
- [ ] Test page on mobile devices
- [ ] Verify auto-refresh functionality
- [ ] Configure web server redirect rules
- [ ] Notify key stakeholders
- [ ] Set up monitoring for when maintenance completes

## Features Included

### Basic Page (maintenance.html)
- ✅ Responsive design
- ✅ Auto-refresh every 5 minutes
- ✅ Contact information
- ✅ Social media links
- ✅ Real-time timestamp
- ✅ Professional styling

### Advanced Page (maintenance-advanced.html)
- ✅ All basic features plus:
- ✅ Animated background particles
- ✅ Progress bar with simulation
- ✅ Countdown timer
- ✅ Interactive hover effects
- ✅ Multiple information cards
- ✅ Gradient animations
- ✅ Enhanced mobile responsiveness

## Testing
Open the files in a browser to preview:
- `file:///path/to/maintenance.html`
- `file:///path/to/maintenance-advanced.html`

## Support
For technical assistance with these maintenance pages:
- Email: gayantd@gmail.com
- Email: appideanz@gmail.com
