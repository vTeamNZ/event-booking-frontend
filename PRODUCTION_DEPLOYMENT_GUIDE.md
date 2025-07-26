# Production Deployment Configuration Guide

This guide explains how the EventBooking frontend is configured for different environments.

## Environments

### Production Environment
- **URL**: https://kiwilanka.co.nz/
- **API**: https://kiwilanka.co.nz/api
- **QR API**: https://kiwilanka.co.nz/qrapp-api

### Test Environment  
- **URL**: https://thelankanspace.co.nz/kw/
- **API**: https://thelankanspace.co.nz/kw/api
- **QR API**: https://thelankanspace.co.nz/kw/qrapp-api

## Configuration Files

### Frontend Configuration

#### For Production (https://kiwilanka.co.nz/)
- **package.json**: `"homepage": "/"`
- **.env.production**: 
  ```
  REACT_APP_API_BASE_URL=https://kiwilanka.co.nz/api
  REACT_APP_QR_API_BASE_URL=https://kiwilanka.co.nz/qrapp-api
  ```
- **web.config**: Root domain configuration (current state)

#### For Test Environment (https://thelankanspace.co.nz/kw/)
- **package.json**: `"homepage": "/kw/"`
- **.env.test**: 
  ```
  REACT_APP_API_BASE_URL=/kw/api
  REACT_APP_QR_API_BASE_URL=/kw/qrapp-api
  ```
- **web.config.test**: Subpath configuration with /kw/ rewrite rules

### Backend Configuration

#### appsettings.Production.json
- JWT Issuer/Audience: `https://kiwilanka.co.nz`
- QR BaseUrl: `https://kiwilanka.co.nz`
- ApplicationSettings BaseUrl: `https://kiwilanka.co.nz`
- ✅ Already configured correctly

#### appsettings.Test.json  
- JWT Issuer/Audience: `https://thelankanspace.co.nz/kw`
- QR BaseUrl: `https://thelankanspace.co.nz/kw`
- ApplicationSettings BaseUrl: `https://thelankanspace.co.nz/kw`
- ✅ Already configured correctly

## Deployment Scripts

### Production Deployment
```powershell
# Use the existing comprehensive deployment script
.\deploy-production.ps1
```

### Test Environment Deployment
```powershell
# Use the test-specific deployment script
.\deploy-testing.ps1
```

## Quick Environment Switch

### Switch to Production Configuration
1. Set `package.json` homepage to `"/"`
2. Use `web.config` (production version)
3. Build with production environment variables

### Switch to Test Configuration  
1. Set `package.json` homepage to `"/kw/"`
2. Copy `web.config.test` to `web.config`
3. Build with test environment variables

## AfterPay Configuration

Both environments have AfterPay configured with:
- **Enabled**: true
- **Fee**: 6% + NZ$0.30
- **Currency**: NZD

## Security Notes

- Sensitive configuration files (appsettings.*.json) are in .gitignore
- API keys and connection strings are not committed to repository
- Environment-specific secrets must be configured on each server

## Verification Checklist

### After Production Deployment
- [ ] Frontend loads at https://kiwilanka.co.nz/
- [ ] API accessible at https://kiwilanka.co.nz/api/health
- [ ] AfterPay settings endpoint works: https://kiwilanka.co.nz/api/admin/afterpay-settings
- [ ] QR code generation works
- [ ] Event booking flow complete

### After Test Deployment  
- [ ] Frontend loads at https://thelankanspace.co.nz/kw/
- [ ] API accessible at https://thelankanspace.co.nz/kw/api/health
- [ ] AfterPay settings endpoint works: https://thelankanspace.co.nz/kw/api/admin/afterpay-settings
- [ ] All relative URLs work correctly with /kw/ prefix
