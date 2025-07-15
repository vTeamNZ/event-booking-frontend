const axios = require('axios');

async function testFrontendScenario() {
  const baseURL = 'http://localhost:5290';
  
  console.log('=== Testing Frontend Seat Selection Scenario ===');
  
  try {
    // 1. Get event layout (like the frontend does)
    console.log('1. Getting event 46 layout...');
    const layoutResponse = await axios.get(`${baseURL}/api/seats/event/46/layout`);
    const seats = layoutResponse.data.seats.slice(0, 2);
    
    console.log(`Found ${seats.length} seats:`, seats.map(s => `${s.seatNumber} (ID: ${s.id}, Status: ${s.status})`));
    
    // 2. Generate session ID (like the frontend does)
    const sessionId = 'frontend-session-' + Date.now();
    console.log(`\nUsing session ID: ${sessionId}`);
    
    // 3. Reserve a seat (like clicking to select)
    const testSeat = seats[0];
    console.log(`\n2. SELECTING seat ${testSeat.seatNumber} (ID: ${testSeat.id})...`);
    
    try {
      const reserveResponse = await axios.post(`${baseURL}/api/seats/reserve`, {
        EventId: 46,
        SessionId: sessionId,
        SeatId: testSeat.id,
        Row: testSeat.row,
        Number: testSeat.number
      });
      console.log('✓ Seat reserved successfully:', reserveResponse.data);
      
      // 4. Wait a moment (simulate user interaction)
      console.log('\n3. Waiting 2 seconds (simulating user interaction)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 5. Try to release it (like clicking to deselect)
      console.log(`\n4. DESELECTING seat ${testSeat.seatNumber} (ID: ${testSeat.id})...`);
      
      try {
        const releaseResponse = await axios.post(`${baseURL}/api/seats/release`, {
          SeatId: testSeat.id,
          SessionId: sessionId
        });
        console.log('✓ Seat released successfully:', releaseResponse.data);
        
        // 6. Try to release the same seat again (this should fail)
        console.log(`\n5. Trying to DESELECT the same seat again (should fail)...`);
        try {
          const releaseResponse2 = await axios.post(`${baseURL}/api/seats/release`, {
            SeatId: testSeat.id,
            SessionId: sessionId
          });
          console.log('✓ Unexpected success:', releaseResponse2.data);
        } catch (secondReleaseError) {
          console.log('✓ Expected failure (seat already released):', {
            status: secondReleaseError.response?.status,
            data: secondReleaseError.response?.data
          });
        }
        
      } catch (releaseError) {
        console.error('✗ Release failed unexpectedly:', {
          status: releaseError.response?.status,
          statusText: releaseError.response?.statusText,
          data: releaseError.response?.data
        });
      }
      
    } catch (reserveError) {
      console.error('✗ Reserve failed:', {
        status: reserveError.response?.status,
        statusText: reserveError.response?.statusText,
        data: reserveError.response?.data
      });
    }
    
    // 7. Check for existing reservations with current session
    console.log(`\n6. Checking existing reservations for session ${sessionId}...`);
    try {
      const reservationsResponse = await axios.get(`${baseURL}/api/seats/reservations/46/${sessionId}`);
      console.log('Current reservations:', reservationsResponse.data);
    } catch (reservationsError) {
      console.log('No reservations found or error:', {
        status: reservationsError.response?.status,
        data: reservationsError.response?.data
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFrontendScenario();
