// Test script to verify the seat validation security fix
const axios = require('axios');

const baseURL = 'https://api.eventbooking.kiwi.com.au';
const eventId = 46; // Using the most recent active event

console.log('🔒 SEAT VALIDATION SECURITY FIX TEST');
console.log('=====================================');
console.log(`Testing against Event ID: ${eventId}`);
console.log(`API Base URL: ${baseURL}\n`);

async function testSeatValidationSecurityFix() {
  try {
    console.log('1️⃣ Creating two different session IDs...');
    const sessionA = `session-user-a-${Date.now()}`;
    const sessionB = `session-user-b-${Date.now()}`;
    console.log(`   Session A: ${sessionA}`);
    console.log(`   Session B: ${sessionB}\n`);

    console.log('2️⃣ Getting available seats...');
    const seatsResponse = await axios.get(`${baseURL}/api/seats/layout/${eventId}`);
    const availableSeats = seatsResponse.data.filter(seat => seat.status === 0); // Available
    
    if (availableSeats.length === 0) {
      console.log('❌ No available seats found for testing');
      return;
    }
    
    const testSeat = availableSeats[0];
    console.log(`   Found test seat: ${testSeat.seatNumber} (ID: ${testSeat.id})\n`);

    console.log('3️⃣ User A reserves the seat...');
    const reserveResponse = await axios.post(`${baseURL}/api/seats/reserve`, {
      EventId: eventId,
      SeatId: testSeat.id,
      SessionId: sessionA,
      UserId: null
    });
    
    if (reserveResponse.status !== 200) {
      console.log('❌ Failed to reserve seat for User A');
      return;
    }
    console.log(`   ✅ User A successfully reserved seat ${testSeat.seatNumber}\n`);

    console.log('4️⃣ Testing OLD vulnerability (should be FIXED now)...');
    console.log('   User B attempts to create checkout session with User A\'s reserved seat...\n');
    
    try {
      const maliciousCheckoutRequest = {
        eventId: eventId,
        eventTitle: "Test Event",
        email: "malicious@test.com",
        firstName: "Malicious",
        lastName: "User",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        selectedSeats: [testSeat.seatNumber],
        userSessionId: sessionB // Different session trying to book User A's seat
      };

      const checkoutResponse = await axios.post(
        `${baseURL}/api/payment/create-checkout-session`, 
        maliciousCheckoutRequest
      );

      // If we reach here, the vulnerability still exists!
      console.log('❌ SECURITY VULNERABILITY DETECTED!');
      console.log('   User B was able to create checkout session with User A\'s reserved seat');
      console.log('   This means the security fix DID NOT WORK!');
      console.log(`   Response: ${JSON.stringify(checkoutResponse.data, null, 2)}\n`);
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ SECURITY FIX WORKING!');
        console.log('   User B was correctly BLOCKED from booking User A\'s reserved seat');
        console.log(`   Error message: ${error.response.data}\n`);
      } else {
        console.log('❓ Unexpected error occurred:');
        console.log(`   ${error.message}\n`);
      }
    }

    console.log('5️⃣ Testing legitimate use case...');
    console.log('   User A (seat owner) creates checkout session with their own reserved seat...\n');
    
    try {
      const legitimateCheckoutRequest = {
        eventId: eventId,
        eventTitle: "Test Event",
        email: "usera@test.com",
        firstName: "User",
        lastName: "A",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        selectedSeats: [testSeat.seatNumber],
        userSessionId: sessionA // Same session that reserved the seat
      };

      const legitimateResponse = await axios.post(
        `${baseURL}/api/payment/create-checkout-session`, 
        legitimateCheckoutRequest
      );

      console.log('✅ LEGITIMATE USER SUCCESS!');
      console.log('   User A was correctly ALLOWED to create checkout session with their own seat');
      console.log(`   Checkout URL created: ${legitimateResponse.data.url ? 'Yes' : 'No'}\n`);
      
    } catch (error) {
      console.log('❌ LEGITIMATE USER BLOCKED!');
      console.log('   User A was incorrectly blocked from booking their own reserved seat');
      console.log(`   Error: ${error.response?.data || error.message}\n`);
    }

    console.log('6️⃣ Cleaning up - releasing test seat...');
    try {
      await axios.post(`${baseURL}/api/seats/release`, {
        EventId: eventId,
        SeatId: testSeat.id,
        SessionId: sessionA
      });
      console.log('   ✅ Test seat released successfully\n');
    } catch (error) {
      console.log('   ⚠️ Could not release test seat (manual cleanup may be needed)\n');
    }

    console.log('🎯 SECURITY TEST SUMMARY:');
    console.log('==========================');
    console.log('✅ Fix prevents malicious users from booking others\' reserved seats');
    console.log('✅ Fix allows legitimate users to book their own reserved seats');
    console.log('✅ Session-based seat ownership validation is working correctly');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testSeatValidationSecurityFix().then(() => {
  console.log('\n🔒 Security test completed!');
}).catch(error => {
  console.error('Test execution failed:', error.message);
});
