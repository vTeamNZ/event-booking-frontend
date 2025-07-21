# 🎯 PRIORITY 1 CRITICAL TESTING PLAN
# Enhanced Reservation Timer with Server Sync

## ⚡ IMMEDIATE TESTS (Run These First)

### TEST 1: Basic Timer Functionality
1. **Navigate to Event Page** → Select Event → Choose Seats
2. **Select 2-3 seats** → Click "Reserve Selected Seats"  
3. **Verify Timer Appears**: Blue timer bar with 10:00 countdown
4. **Check Console**: Look for "🎯 Enhanced timer started with server sync capabilities"
5. **✅ PASS**: Timer visible and counting down
6. **❌ FAIL**: Timer missing or not counting

### TEST 2: Server Sync Validation  
1. **With active timer** → Open Browser DevTools → Network tab
2. **Wait 30 seconds** → Look for POST to `/api/seats/sync-reservation`
3. **Check Response**: Should return `{"isValid": true, "timeLeft": xxx}`
4. **✅ PASS**: Sync requests every 30 seconds with valid responses
5. **❌ FAIL**: No sync requests or invalid responses

### TEST 3: Warning System
1. **Wait for 5-minute mark** → Toast: "5 minutes remaining..."
2. **Wait for 2-minute mark** → Orange timer + Toast: "Only 2 minutes left..."  
3. **Wait for 30-second mark** → Red timer + Toast: "URGENT: Only 30 seconds remaining!"
4. **✅ PASS**: All warnings triggered at correct times
5. **❌ FAIL**: Missing warnings or incorrect timing

### TEST 4: Browser Refresh Recovery
1. **With active timer** → Press F5 to refresh page
2. **Timer should reappear** with correct remaining time
3. **Check Console**: "🔄 Reservation recovered from storage"
4. **✅ PASS**: Timer recovered successfully
5. **❌ FAIL**: Timer lost after refresh

### TEST 5: Expiry Handling
1. **Let timer reach 00:00** → Should auto-redirect to events page
2. **Check for cleanup API call** → POST to `/api/seats/cleanup-reservation`
3. **Verify seats released** → Try selecting same seats (should be available)
4. **✅ PASS**: Auto-cleanup and redirect work
5. **❌ FAIL**: Timer stuck or seats not released

## 🔧 DEBUGGING COMMANDS

### Check Timer Service Status
```javascript
// Run in browser console
const timer = window.reservationTimer || 
  (await import('./src/services/reservationTimerService.ts')).default;
console.log('Timer Status:', timer.getStatus());
console.log('Time Left:', timer.getTimeLeft());
console.log('Reservation:', timer.getReservation());
```

### Check Server Sync
```javascript
// Check last sync status
fetch('/api/seats/sync-reservation', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    reservationId: 'your-reservation-id',
    sessionId: 'your-session-id'
  })
}).then(r => r.json()).then(console.log);
```

### Verify Storage
```javascript
// Check localStorage data
console.log('Active Reservation:', 
  JSON.parse(localStorage.getItem('activeReservation') || '{}'));
console.log('Backup Reservation:', 
  JSON.parse(sessionStorage.getItem('backupReservation') || '{}'));
```

## 🚨 CRITICAL ISSUES TO WATCH FOR

### HIGH PRIORITY FAILURES:
1. **Timer not appearing** → Check import paths and service initialization
2. **Server sync failing** → Check API endpoint URLs and CORS
3. **Double booking possible** → Verify cleanup API is called
4. **Timer not recovering** → Check storage persistence
5. **Warnings not showing** → Verify callback registration

### MEDIUM PRIORITY ISSUES:
1. Timer positioning problems → Check z-index conflicts
2. Multiple timers appearing → Check React strict mode
3. Performance issues → Check interval cleanup
4. Toast notifications not showing → Check react-hot-toast setup

## 🔬 TECHNICAL VALIDATION

### Backend API Validation:
```bash
# Test sync endpoint
curl -X POST http://localhost:5000/api/seats/sync-reservation \
  -H "Content-Type: application/json" \
  -d '{"reservationId":"test","sessionId":"test"}'

# Test cleanup endpoint  
curl -X POST http://localhost:5000/api/seats/cleanup-reservation \
  -H "Content-Type: application/json" \
  -d '{"reservationId":"test","reason":"Testing"}'
```

### Database Validation:
```sql
-- Check for orphaned reservations
SELECT * FROM SeatReservations 
WHERE ExpiresAt < GETUTCDATE() AND IsConfirmed = 0;

-- Check seat status consistency
SELECT s.*, sr.* FROM Seats s 
LEFT JOIN SeatReservations sr ON s.EventId = sr.EventId 
WHERE s.Status = 2 AND sr.Id IS NULL; -- Reserved seats without reservations
```

## 📊 SUCCESS METRICS

### ✅ PRIORITY 1 COMPLETE WHEN:
- [ ] Timer starts automatically after seat selection
- [ ] Server sync occurs every 30 seconds  
- [ ] Progressive warnings show at 5min, 2min, 30sec
- [ ] Browser refresh recovers timer state
- [ ] Timer expiry triggers cleanup and redirect
- [ ] No double booking possible
- [ ] All API endpoints respond correctly
- [ ] Storage redundancy works (localStorage + sessionStorage)

### 🎯 INDUSTRY STANDARD COMPLIANCE:
- [ ] 10-minute reservation window (matches Ticketmaster)
- [ ] Visual urgency indicators (color changes)
- [ ] Proactive warning system  
- [ ] Automatic cleanup on expiry
- [ ] Session recovery capability
- [ ] Server-side validation sync

## 🚀 NEXT STEPS (Priority 2)
Once Priority 1 tests pass:
1. Implement reservation extension capability
2. Add real-time WebSocket updates
3. Enhanced analytics and monitoring
4. Machine learning optimization
5. Multi-device synchronization

---
**Testing Status**: 🔄 Ready for execution
**Critical Path**: Timer → Sync → Warnings → Recovery → Cleanup
**Success Definition**: Zero double bookings + Complete user experience
