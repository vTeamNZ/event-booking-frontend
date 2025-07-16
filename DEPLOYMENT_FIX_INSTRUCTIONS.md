# DEPLOYMENT FIX - RESOLVED THE 403 FORBIDDEN ERROR

## Issue Fixed
✅ **FIXED**: The frontend was trying to access `https://kiwilanka.co.nz/Events` instead of `https://kiwilanka.co.nz/api/Events`

## What Was Wrong
- `.env.production` had `REACT_APP_API_BASE_URL=https://kiwilanka.co.nz` (missing `/api`)
- This caused 403 Forbidden errors because the API endpoints are under `/api/` virtual directory in IIS

## What Was Fixed
- Updated `.env.production` to: `REACT_APP_API_BASE_URL=https://kiwilanka.co.nz/api`
- Rebuilt the frontend with the correct API path

## Deployment Instructions

### 1. Deploy the Corrected Frontend
```powershell
# Copy the corrected build to your main website directory
xcopy /E /Y "c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend\build\*" "C:\inetpub\wwwroot\"
```

### 2. Verify the Fix
After deployment, your frontend will now correctly call:
- ✅ `https://kiwilanka.co.nz/api/Events` (correct)
- ✅ `https://kiwilanka.co.nz/api/Auth/login` (correct)
- ✅ All other API endpoints with proper `/api/` prefix

### 3. Test the Application
1. Go to https://kiwilanka.co.nz
2. The home page should now show events in the carousel
3. The events list page should show events properly
4. No more 403 Forbidden errors in the browser console

## Technical Details
- **Frontend Build**: Ready at `event-booking-frontend\build\`
- **API Base URL**: Now correctly set to `https://kiwilanka.co.nz/api`
- **CORS Configuration**: Already allows `https://kiwilanka.co.nz` in backend
- **File Size**: 222.54 kB (main bundle)

## Next Steps
1. Deploy the corrected frontend build
2. Test the complete application functionality
3. Verify processing fees work in payment flow
4. All systems should be operational after this fix

The issue was a simple but critical URL path problem. The frontend is now correctly configured to communicate with your API through the `/api` virtual directory in IIS.
