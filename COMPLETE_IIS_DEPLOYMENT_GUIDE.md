# COMPLETE IIS DEPLOYMENT FIX - ALL APPLICATIONS

## IIS Structure Understanding
Based on your production URLs, your IIS structure should be:

```
Default Web Site (https://kiwilanka.co.nz)
├── wwwroot/ (Frontend React App)
├── api/ (Virtual Directory/Application → EventBooking.API)
├── qrapp-api/ (Virtual Directory/Application → QRCodeGeneratorAPI)  
└── qrapp/ (Virtual Directory/Application → QRReaderApp)
```

## Issues Fixed

### 1. Frontend (React App) ✅
**Files Fixed:**
- `qrCodeService.ts` - Removed `/api/` prefix from QR calls
- `.env.production` - Updated QR API URL to include `/api` path
- `.env.development` - Updated QR API port and added `/api` path

**Environment Configuration:**
```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_QR_API_BASE_URL=http://localhost:5002/api

# .env.production  
REACT_APP_API_BASE_URL=https://kiwilanka.co.nz/api
REACT_APP_QR_API_BASE_URL=https://kiwilanka.co.nz/qrapp-api/api
```

### 2. QR Reader App ✅
**Files Fixed:**
- `Pages/Index.cshtml.cs` - Removed `/api/` prefix from HTTP calls
- `appsettings.Development.json` - Updated to use localhost with `/api`
- `appsettings.Production.json` - Updated to include `/api` path

**Configuration:**
```json
// appsettings.Development.json
"QRCodeAPI": {
  "BaseUrl": "http://localhost:5002/api/"
}

// appsettings.Production.json  
"QRCodeAPI": {
  "BaseUrl": "https://kiwilanka.co.nz/qrapp-api/api/"
}
```

### 3. QR Code Generator API ✅
**Already Correctly Configured** - No changes needed
- Routes are properly set up in controllers
- CORS allows frontend and API domains

## Build & Deployment Instructions

### 1. Frontend (React App)
```powershell
# Already built - deploy from:
xcopy /E /Y "event-booking-frontend\build\*" "C:\inetpub\wwwroot\"
```

### 2. EventBooking.API  
```powershell
# Build for production
cd "EventBooking.API\EventBooking.API"
dotnet publish -c Release -o "publish\production"

# Deploy to IIS /api virtual directory/application
xcopy /E /Y "publish\production\*" "C:\inetpub\wwwroot\api\"
```

### 3. QRCodeGeneratorAPI
```powershell
# Build for production
cd "QRCodeGeneratorAPI" 
dotnet publish -c Release -o "publish\production"

# Deploy to IIS /qrapp-api virtual directory/application
xcopy /E /Y "publish\production\*" "C:\inetpub\wwwroot\qrapp-api\"
```

### 4. QRReaderApp
```powershell
# Build for production
cd "QRReaderApp"
dotnet publish -c Release -o "publish\production"

# Deploy to IIS /qrapp virtual directory/application  
xcopy /E /Y "publish\production\*" "C:\inetpub\wwwroot\qrapp\"
```

## URL Testing After Deployment

### Frontend URLs:
- ✅ `https://kiwilanka.co.nz` (Main site)
- ✅ `https://kiwilanka.co.nz/api/Events` (API calls)
- ✅ `https://kiwilanka.co.nz/qrapp-api/api/etickets/generate` (QR generation)

### QR Reader URLs:
- ✅ `https://kiwilanka.co.nz/qrapp` (QR Reader app)
- ✅ Internal call to `https://kiwilanka.co.nz/qrapp-api/api/etickets/generate`

### API URLs:
- ✅ `https://kiwilanka.co.nz/api/swagger` (EventBooking API docs)
- ✅ `https://kiwilanka.co.nz/qrapp-api/swagger` (QR API docs)

## Key Pattern Applied
**Before:** Applications hardcoded `/api/` paths
**After:** Environment variables include full paths, code uses relative paths

This pattern ensures:
- ✅ Clean separation between dev and production
- ✅ Easy environment configuration
- ✅ No duplicate path issues
- ✅ Consistent behavior across all applications

## Verification Steps
1. Deploy all four applications
2. Test main website functionality
3. Test QR code generation from payment flow
4. Test QR reader app independently
5. Verify all APIs respond correctly
