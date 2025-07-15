#!/usr/bin/env node

/**
 * Test script to verify the seat deselection fix
 * This script simulates the user flow: select seat -> go to checkout -> return -> deselect
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5290';
const EVENT_ID = 46; // Test event ID

async function testSeatDeselectionFix() {
  console.log('🧪 Testing Seat Deselection Frontend Fix');
  console.log('==========================================');
  
  try {
    // 1. Get event layout
    console.log('\n1️⃣ Getting event layout...');
    const layoutResponse = await axios.get(`${BASE_URL}/api/seats/event/${EVENT_ID}/layout`);
    const availableSeats = layoutResponse.data.seats.filter(s => s.status === 0).slice(0, 2);
    
    if (availableSeats.length === 0) {
      console.log('❌ No available seats found for testing');
      return;
    }
    
    console.log(`✅ Found ${availableSeats.length} available seats for testing`);
    const testSeat = availableSeats[0];
    console.log(`   Testing with seat: ${testSeat.seatNumber} (ID: ${testSeat.id})`);
    
    // 2. Generate session (simulating frontend)
    const sessionId = `test-session-${Date.now()}`;
    console.log(`\n2️⃣ Using session ID: ${sessionId}`);
    
    // 3. Reserve seat (simulating click to select)
    console.log('\n3️⃣ Reserving seat (simulating user selection)...');
    const reserveResponse = await axios.post(`${BASE_URL}/api/seats/reserve`, {
      EventId: EVENT_ID,
      SessionId: sessionId,
      SeatId: testSeat.id,
      Row: testSeat.row,
      Number: testSeat.number
    });
    console.log('✅ Seat reserved successfully');
    
    // 4. Simulate going to checkout and returning
    console.log('\n4️⃣ Simulating checkout navigation (2 second delay)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Check seat layout again (simulating user return)
    console.log('\n5️⃣ Getting layout after "return from checkout"...');
    const layoutAfterReturn = await axios.get(`${BASE_URL}/api/seats/event/${EVENT_ID}/layout`);
    const seatAfterReturn = layoutAfterReturn.data.seats.find(s => s.id === testSeat.id);
    console.log(`   Seat status after return: ${seatAfterReturn.status} (1=Reserved, expected)`);
    
    // 6. Deselect seat (simulating click to deselect)
    console.log('\n6️⃣ Deselecting seat (simulating user deselection)...');
    const releaseResponse = await axios.post(`${BASE_URL}/api/seats/release`, {
      SeatId: testSeat.id,
      SessionId: sessionId
    });
    console.log('✅ Seat released successfully on backend');
    
    // 7. Check final layout (this should show seat as available)
    console.log('\n7️⃣ Getting final layout (after deselection)...');
    const finalLayout = await axios.get(`${BASE_URL}/api/seats/event/${EVENT_ID}/layout`);
    const finalSeat = finalLayout.data.seats.find(s => s.id === testSeat.id);
    console.log(`   Final seat status: ${finalSeat.status} (0=Available, expected)`);
    
    // 8. Test result
    if (finalSeat.status === 0) {
      console.log('\n✅ TEST PASSED: Seat correctly shows as available after deselection');
      console.log('   Frontend should now properly refresh and show this status');
    } else {
      console.log('\n❌ TEST FAILED: Seat still shows as reserved after deselection');
      console.log(`   Expected: 0 (Available), Got: ${finalSeat.status}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the test
testSeatDeselectionFix().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test crashed:', error.message);
});
