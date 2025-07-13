const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:5290';
  
  console.log('=== Testing Seat Release API ===');
  
  try {
    // First, let's try to get an event layout to see available seats
    console.log('1. Getting event layout...');
    const layoutResponse = await axios.get(`${baseURL}/api/seats/event/46/layout`);
    const seats = layoutResponse.data.seats.slice(0, 3); // Get first 3 seats for testing
    
    console.log(`Found ${seats.length} seats:`, seats.map(s => `${s.seatNumber} (ID: ${s.id}, Status: ${s.status})`));
    
    // Try to reserve a seat first
    const sessionId = 'test-session-' + Date.now();
    const testSeat = seats[0];
    
    console.log(`\n2. Attempting to reserve seat ${testSeat.seatNumber} (ID: ${testSeat.id}) with session ${sessionId}...`);
    
    try {
      const reserveResponse = await axios.post(`${baseURL}/api/seats/reserve`, {
        EventId: 46,
        SessionId: sessionId,
        SeatId: testSeat.id,
        Row: testSeat.row,
        Number: testSeat.number
      });
      console.log('Reserve success:', reserveResponse.data);
      
      // Now try to release it
      console.log(`\n3. Attempting to release seat ${testSeat.seatNumber} (ID: ${testSeat.id}) with session ${sessionId}...`);
      
      try {
        const releaseResponse = await axios.post(`${baseURL}/api/seats/release`, {
          SeatId: testSeat.id,
          SessionId: sessionId
        });
        console.log('Release success:', releaseResponse.data);
      } catch (releaseError) {
        console.error('Release failed:', {
          status: releaseError.response?.status,
          statusText: releaseError.response?.statusText,
          data: releaseError.response?.data
        });
      }
      
    } catch (reserveError) {
      console.error('Reserve failed:', {
        status: reserveError.response?.status,
        statusText: reserveError.response?.statusText,
        data: reserveError.response?.data
      });
    }
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPI();
