# Testing Environment Configuration
# Location: https://thelankanspace.co.nz/kw/

## Current Setup
- **Frontend**: `https://thelankanspace.co.nz/kw/` ✅ DEPLOYED
- **API**: `https://thelankanspace.co.nz/kw/api/` ✅ DEPLOYED
- **QR API**: `https://thelankanspace.co.nz/kw/qrapp-api/` ⚠️ TODO
- **Homepage**: `/kw/` (configured in package.json)
- **Image Paths**: Relative using `process.env.PUBLIC_URL` ✅ FIXED

## Architecture Benefits
✅ Same structure as production, just different domain
✅ Easy migration to production - only domain changes
✅ No CORS issues - same domain for frontend and API
✅ Clean relative API paths

## Files Modified for Testing:
1. `package.json` - Added `"homepage": "/kw/"`
2. `.env.production` - API URLs: `/kw/api` and `/kw/qrapp-api`
3. `AnimatedHeader.tsx` - Fixed image path to use PUBLIC_URL
4. `EventHero.tsx` - Fixed fallback image path
5. `HeroCarousel.tsx` - Fixed background and fallback image paths
6. `EventsList.tsx` - Fixed event image and error fallback paths
7. `SeatSelectionPage.tsx` - Fixed event image fallback path
8. `web.config` - Simple React Router configuration

## IIS Setup Completed:
1. **Frontend**: Deployed React app to `c:\inetpub\TLS\kw\` ✅
2. **API**: Deployed EventBooking.API to `c:\inetpub\TLS\kw\api\` ✅
3. **QR API**: Deploy QR service to `c:\inetpub\TLS\kw\qrapp-api\` ⚠️ TODO

## Deployment Scripts:
- **Frontend**: `.\deploy-testing.ps1` - Builds and deploys React app
- **API**: `.\deploy-api-testing.ps1` - Deploys EventBooking.API
- **Combined**: Run both scripts for full deployment

## Test URLs:
- **Frontend**: https://thelankanspace.co.nz/kw/
- **API**: https://thelankanspace.co.nz/kw/api/Events
- **Swagger**: https://thelankanspace.co.nz/kw/api/swagger

## Current Status:
✅ React app built with `/kw/` base path
✅ All images load correctly with PUBLIC_URL  
✅ API configuration points to `/kw/api/`
✅ Frontend deployed and working
✅ API deployed and accessible
✅ Frontend can connect to API
⚠️ **TODO**: Deploy QR service (if needed)
