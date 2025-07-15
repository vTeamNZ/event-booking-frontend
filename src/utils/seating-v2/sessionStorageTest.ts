// Session Storage Test Script
// This file can be used to test the session storage functionality

import { 
  storeSessionId, 
  getSessionId, 
  clearAllSeatingData, 
  completeBookingCleanup,
  safeBookingCompletionCleanup,
  getAllSeatingDataKeys,
  debugSeatingStorage
} from './sessionStorage';

// Test function for session storage functionality
export const testSessionStorage = () => {
  const testEventId = 999;
  
  console.log('🧪 Testing Session Storage Functionality');
  
  // Test 1: Store and retrieve session ID
  console.log('\n1. Testing session ID storage...');
  storeSessionId(testEventId, 'test-session-123');
  const retrievedSessionId = getSessionId(testEventId);
  console.log(`Stored: test-session-123, Retrieved: ${retrievedSessionId}`);
  console.assert(retrievedSessionId === 'test-session-123', 'Session ID storage failed');
  
  // Test 2: Show all keys before cleanup
  console.log('\n2. Storage keys before cleanup:');
  debugSeatingStorage();
  
  // Test 3: Test cleanup
  console.log('\n3. Testing booking completion cleanup...');
  completeBookingCleanup(testEventId, 'test_cleanup');
  
  // Test 4: Verify cleanup worked
  console.log('\n4. Storage keys after cleanup:');
  const keysAfterCleanup = getAllSeatingDataKeys();
  const hasTestEventKeys = keysAfterCleanup.some(key => key.includes(testEventId.toString()));
  console.log(`Keys remaining for test event: ${hasTestEventKeys ? 'YES (ERROR!)' : 'NO (SUCCESS!)'}`);
  console.assert(!hasTestEventKeys, 'Cleanup did not remove all keys');
  
  // Test 5: Test safe cleanup with mock data
  console.log('\n5. Testing safe booking completion cleanup...');
  storeSessionId(testEventId, 'test-session-456'); // Store again for testing
  
  const mockSearchParams = new URLSearchParams();
  mockSearchParams.set('eventId', testEventId.toString());
  
  const cleanupSuccess = safeBookingCompletionCleanup(
    mockSearchParams,
    null,
    null,
    'test_safe_cleanup'
  );
  
  console.log(`Safe cleanup success: ${cleanupSuccess}`);
  console.assert(cleanupSuccess, 'Safe cleanup should have succeeded');
  
  // Final verification
  const finalKeys = getAllSeatingDataKeys();
  const hasFinalTestKeys = finalKeys.some(key => key.includes(testEventId.toString()));
  console.log(`Final verification - Keys remaining: ${hasFinalTestKeys ? 'YES (ERROR!)' : 'NO (SUCCESS!)'}`);
  
  console.log('\n✅ Session Storage tests completed!');
};

// Run tests if this file is executed directly (for development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testSessionStorage = testSessionStorage;
  console.log('Session storage test function available as: window.testSessionStorage()');
}
