import { authService } from '../services/authService';
import { createPaymentIntent } from '../services/stripeService';

export const testAuthFlow = async () => {
  try {
    // Step 1: Clear any existing auth state
    authService.logout();
    console.log('✅ Cleared existing auth state');

    // Step 2: Attempt login
    const loginResponse = await authService.login({
      email: 'test@example.com',  // Replace with a valid test user
      password: 'password123'      // Replace with valid password
    });
    console.log('✅ Login successful', loginResponse);

    // Step 3: Verify auth token is stored
    const token = authService.getToken();
    if (!token) {
      throw new Error('❌ No auth token found after login');
    }
    console.log('✅ Auth token stored successfully');

    // Step 4: Verify current user is available
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('❌ No user data found after login');
    }
    console.log('✅ User data stored successfully', currentUser);

    // Step 5: Test payment intent creation
    const eventDetails = {
      eventId: 'test-event',
      eventTitle: 'Test Event',
      ticketDetails: { quantity: 1, price: 50 },
      selectedFoods: []
    };

    const paymentIntent = await createPaymentIntent(50, eventDetails);
    console.log('✅ Payment intent created successfully', paymentIntent);

    console.log('🎉 All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};
