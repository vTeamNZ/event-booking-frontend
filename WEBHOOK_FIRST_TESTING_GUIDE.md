# 🧪 Webhook-First Payment Verification - Testing Guide

## 🎯 **TESTING OBJECTIVES**

We're testing the new webhook-first payment verification system to ensure:
1. ✅ No more "payment successful but shows failure" issues
2. ✅ Faster user experience with polling
3. ✅ Reliable fallback verification
4. ✅ Elimination of dual verification race conditions
5. ✅ Organizer payment bypass still works correctly

## 🚀 **SERVICES STATUS**

### ✅ Backend API: Running on http://localhost:5000
### ✅ Frontend: Running on http://localhost:3000  
### 🔄 QR Generator API: Check separately

## 📋 **TESTING PLAN**

### **Phase 1: API Endpoint Testing**
Test the new webhook-first endpoints directly via API calls.

### **Phase 2: Frontend Polling Testing**  
Test the frontend polling system with various scenarios.

### **Phase 3: End-to-End Payment Flow**
Test complete payment flows including webhook processing.

### **Phase 4: Organizer Bypass Testing**
Verify organizer payment bypass still works correctly.

---

## 🔧 **PHASE 1: API ENDPOINT TESTING**

### **Test 1.1: New Payment Status Endpoint**
```powershell
# Test the new polling endpoint (should return "not processed" for non-existent session)
Invoke-RestMethod -Uri "http://localhost:5000/Payment/payment-status/test-session-123" -Method GET
```

**Expected Result:**
```json
{
  "isProcessed": false,
  "processedAt": "...",
  "bookingDetails": null,
  "errorMessage": null
}
```

### **Test 1.2: Webhook Memory Cache Test**
```powershell
# This would normally be populated by webhook, let's test cache retrieval
Invoke-RestMethod -Uri "http://localhost:5000/Payment/payment-status/cs_test_session" -Method GET
```

### **Test 1.3: Health Check Endpoints**
```powershell
# Test API health
Invoke-RestMethod -Uri "http://localhost:5000/Events" -Method GET -Headers @{"Accept"="application/json"}
```

---

## 🔧 **PHASE 2: FRONTEND POLLING TESTING**

### **Test 2.1: Open Payment Success Page**
1. Navigate to: `http://localhost:3000/payment-success?session_id=test123`
2. Observe polling behavior in browser dev tools
3. Check console logs for polling progress

### **Test 2.2: Check Browser Console**
Open browser dev tools and look for:
- ✅ Polling start messages
- ✅ Progress updates every second
- ✅ Fallback activation after 30 seconds
- ✅ Processing time display

---

## 🔧 **PHASE 3: END-TO-END TESTING**

### **Test 3.1: Complete Payment Flow**
1. Navigate to event booking page
2. Select seats
3. Go through payment process
4. Return to success page
5. Observe webhook processing vs polling

### **Test 3.2: Webhook Processing Speed**
Monitor how quickly webhook processes vs frontend polling retrieval.

---

## 🔧 **PHASE 4: ORGANIZER BYPASS TESTING**

### **Test 4.1: Organizer QR Generation**
1. Login as organizer
2. Navigate to event
3. Select seats  
4. Use "Generate QR Tickets" button
5. Verify no payment processing occurs
6. Check QR ticket generation

---

## 📊 **EXPECTED IMPROVEMENTS**

### **Before (Old System):**
- Dual verification caused race conditions
- "Payment successful but shows failure"
- Slow user experience
- Inconsistent results

### **After (New System):**
- Single source of truth from webhook
- Instant results when webhook completes
- Automatic fallback for reliability
- Consistent, fast user experience

---

## 🐛 **TROUBLESHOOTING**

### **If API Not Responding:**
```powershell
cd C:\Users\gayantd\source\repos\vTeamNZ\EventBooking.API\EventBooking.API
dotnet run
```

### **If Frontend Not Responding:**
```powershell
cd C:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend
npm start
```

### **Check Logs:**
- API logs: Terminal output where `dotnet run` is running
- Frontend logs: Browser console (F12)
- Database logs: Check API terminal for EF Core logs

---

## 🎯 **SUCCESS CRITERIA**

### ✅ **API Tests Pass:**
- New endpoints respond correctly
- Memory cache works
- Proper error handling

### ✅ **Frontend Tests Pass:**
- Polling system works
- Progress updates display
- Fallback activates correctly

### ✅ **End-to-End Tests Pass:**
- Payment flow completes successfully
- No dual verification issues
- Fast user experience

### ✅ **Organizer Tests Pass:**
- QR generation works without payment
- Processing fees don't interfere
- Seats marked as booked correctly

---

## 📝 **TEST RESULTS LOG**

### Test 1.1: ⏳ Pending
### Test 1.2: ⏳ Pending  
### Test 1.3: ⏳ Pending
### Test 2.1: ⏳ Pending
### Test 2.2: ⏳ Pending
### Test 3.1: ⏳ Pending
### Test 3.2: ⏳ Pending
### Test 4.1: ⏳ Pending

**Overall Status:** 🚀 Ready to begin testing
