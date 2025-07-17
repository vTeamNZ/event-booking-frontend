# QR Apps Health Check Enhancement

## Overview
Enhanced the production health check script to include comprehensive QR code functionality testing, covering the QR Code Generator API, QR Reader App, and email delivery systems.

## New Test Categories Added

### 1. QR Apps Connectivity Tests
- **QR Code API Health**: Tests if the QR Code Generator API at `/qrapp-api` is responding
- **QR Reader App Health**: Tests if the QR Reader App at `/qrreader` is accessible
- **QR API Documentation**: Checks if Swagger documentation is available

### 2. QR Code Generation Tests
- **QR Code Generation**: Tests the `/api/ETickets/generate-qr` endpoint with sample booking data
- **QR Generation Response**: Validates the JSON response format and success status
- **QR Ticket Path**: Verifies that a valid ticket path is generated for later validation

### 3. Email Delivery Tests
- **Email Configuration**: Tests email configuration endpoint accessibility
- **Email Sending Test**: Attempts to send a test email using the ticket system
- **Email Send Response**: Validates email service responses and error handling

### 4. QR Reader Functionality Tests
- **QR Reader Page Load**: Tests if the QR Reader application loads correctly
- **QR Reader Content**: Scans page content for QR scanning functionality indicators
- **QR Ticket Validation**: Tests ticket validation endpoints if available

### 5. QR End-to-End Flow Tests
- **Complete Flow Testing**: Tests the entire process from QR generation to validation
- **E2E QR Generation**: Creates a test ticket for end-to-end validation
- **E2E Ticket Creation**: Verifies ticket is properly stored and retrievable
- **E2E Ticket Retrieval**: Tests ticket information retrieval
- **E2E Ticket Validation**: Tests the complete validation process

## New Script Parameters

```powershell
# Skip all QR-related tests
.\production-health-check.ps1 -SkipQRApps

# Skip only email tests (but keep other QR tests)
.\production-health-check.ps1 -SkipEmailTests

# Run with verbose output for debugging
.\production-health-check.ps1 -Verbose

# Test against staging environment
.\production-health-check.ps1 -BaseUrl "https://staging.kiwilanka.co.nz"
```

## Configuration Updates

### URLs Added:
- **QRCodeApiUrl**: `https://kiwilanka.co.nz/qrapp-api`
- **QRReaderUrl**: `https://kiwilanka.co.nz/qrreader`

### Test Data:
- Sample booking data for QR generation testing
- Test email addresses for email delivery testing
- Randomized test IDs to avoid conflicts

### Timeouts:
- **QRGeneration**: 45 seconds (for potentially slow QR generation)
- Extended timeouts for email and validation operations

## Expected Test Results

### Healthy System:
- All QR Apps connectivity tests should **PASS**
- QR code generation should complete successfully
- Email configuration should be accessible
- QR Reader app should load and show scanning functionality
- End-to-end flow should complete without errors

### Common Expected Issues:
- **Email sending tests** may be **SKIPPED** if test endpoints aren't implemented
- **QR validation** may be **SKIPPED** if validation endpoints aren't available
- **Swagger documentation** may be **SKIPPED** if not enabled in production

### Test Failure Indicators:
- **QR API not responding**: Indicates deployment or routing issues
- **QR generation failures**: Could indicate database connectivity or file system issues
- **Email service errors**: May indicate SMTP configuration problems
- **Reader app failures**: Could indicate frontend deployment issues

## Usage Examples

### Full Health Check (includes QR Apps):
```powershell
.\production-health-check.ps1
```

### Quick Check (skip QR Apps):
```powershell
.\production-health-check.ps1 -SkipQRApps
```

### Email-focused Testing:
```powershell
.\production-health-check.ps1 -SkipAuth -SkipPayments
```

### Debugging Mode:
```powershell
.\production-health-check.ps1 -Verbose
```

## Monitoring Integration

The enhanced script provides detailed status reporting for:
- QR code generation performance
- Email delivery system health
- Ticket validation system status
- End-to-end booking workflow integrity

This enables automated monitoring of the complete KiwiLanka ticketing ecosystem including the QR functionality that's crucial for event check-ins and ticket validation.

## Safety Features

- All tests use safe test data that won't interfere with real bookings
- Email tests use designated test email addresses
- QR generation uses clearly marked test events
- Fallback handling for endpoints that may not be implemented yet
- Graceful degradation when services are unavailable
